'use server';

import { randomInt } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/supabase/admin';
import { supabaseServer } from '@/lib/supabase/server';
import { recomputeAll, recomputeUser } from '@/lib/scoring';

export interface Result { ok: boolean; message: string; data?: any }
const ok = (message: string, data?: any): Result => ({ ok: true, message, data });
const fail = (message: string): Result => ({ ok: false, message });

/* ------------------------------ AUTH ------------------------------ */
export async function adminLogin(_prev: Result | null, fd: FormData): Promise<Result> {
  const email = String(fd.get('email') ?? '').trim();
  const password = String(fd.get('password') ?? '');
  if (!email || !password) return fail('Email dan kata sandi wajib diisi.');
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return fail('Email atau kata sandi salah.');
  const { data: p } = await db().from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  if (p?.role !== 'admin') {
    await supabase.auth.signOut();
    return fail('Akun ini bukan admin. Jalankan `npm run create-admin` untuk membuat akun admin.');
  }
  redirect('/admin');
}

export async function adminLogout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

/* ----------------------------- SISWA ------------------------------ */
const newPin = () => String(randomInt(1000, 10000));

export async function addStudents(text: string, defaultClass: string): Promise<Result> {
  await requireAdmin();
  const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line, i) => {
    const [name, cls] = line.split(/[,;\t]/).map((x) => x.trim());
    return { full_name: name.slice(0, 100), class_name: (cls || defaultClass || null)?.slice(0, 30) ?? null, pin_code: newPin(), avatar_id: `astro-${(i % 8) + 1}`, role: 'student' };
  }).filter((r) => r.full_name);
  if (!rows.length) return fail('Tidak ada nama yang valid. Tulis satu siswa per baris: Nama, Kelas');
  const { error } = await db().from('profiles').insert(rows);
  if (error) return fail(error.message);
  revalidatePath('/admin/students');
  return ok(`${rows.length} siswa ditambahkan dengan PIN acak.`);
}

export async function updateStudent(id: string, v: { full_name: string; class_name: string; avatar_id: string; pin_code: string }): Promise<Result> {
  await requireAdmin();
  const p = z.object({ full_name: z.string().trim().min(1).max(100), class_name: z.string().trim().max(30), avatar_id: z.string().max(50), pin_code: z.string().regex(/^\d{4}$/, 'PIN harus 4 angka') }).safeParse(v);
  if (!p.success) return fail(p.error.issues[0].message);
  const { error } = await db().from('profiles').update({ ...p.data, class_name: p.data.class_name || null }).eq('id', id).eq('role', 'student');
  if (error) return fail(error.message);
  revalidatePath('/admin/students');
  return ok('Data siswa disimpan.');
}

export async function deleteStudent(id: string): Promise<Result> {
  await requireAdmin();
  const { error } = await db().from('profiles').delete().eq('id', id).eq('role', 'student');
  if (error) return fail(error.message);
  revalidatePath('/admin/students');
  return ok('Siswa dihapus beserta seluruh datanya.');
}

/* --------------------------- RESET PROGRESS ----------------------- */
export type ResetScope = 'all' | 'pre' | 'post' | `module:${string}`;

async function deleteAttempts(userId: string, filter: { purpose: string; moduleId?: string }) {
  const sb = db();
  let q = sb.from('quiz_questions').select('id').eq('purpose', filter.purpose);
  if (filter.moduleId) q = q.eq('module_id', filter.moduleId);
  const { data } = await q;
  const ids = (data ?? []).map((x: any) => x.id);
  if (ids.length) await sb.from('quiz_attempts').delete().eq('user_id', userId).in('question_id', ids);
}

export async function resetProgress(userId: string, scope: ResetScope): Promise<Result> {
  await requireAdmin();
  const sb = db();
  if (scope === 'all') {
    await sb.from('quiz_attempts').delete().eq('user_id', userId);
    await sb.from('student_module_progress').delete().eq('user_id', userId);
    await sb.from('research_evaluations').delete().eq('user_id', userId);
    await sb.from('usability_feedback').delete().eq('user_id', userId);
  } else if (scope === 'pre' || scope === 'post') {
    await deleteAttempts(userId, { purpose: scope === 'pre' ? 'pre_test' : 'post_test' });
    await sb.from('research_evaluations').update(scope === 'pre' ? { pre_overridden: false } : { post_overridden: false }).eq('user_id', userId);
    await recomputeUser(userId);
  } else {
    const moduleId = scope.slice('module:'.length);
    await deleteAttempts(userId, { purpose: 'module_test', moduleId });
    await sb.from('student_module_progress').update({ score_overridden: false, test_completed: false, test_score: 0 }).eq('user_id', userId).eq('module_id', moduleId);
    await recomputeUser(userId);
  }
  revalidatePath('/admin', 'layout');
  return ok('Riwayat pengerjaan direset. Siswa dapat mengerjakan ulang.');
}

/* ------------------------------ MODUL ----------------------------- */
const moduleSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]{2,50}$/, 'ID modul: huruf kecil, angka, tanda minus (2-50 karakter)'),
  title: z.string().trim().min(2).max(150),
  planet_name: z.string().trim().max(50).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  order_index: z.number().int().min(0).max(999),
  is_published: z.boolean(),
  learn_content: z.array(z.object({
    title: z.string().trim().min(1), body: z.string().trim().min(1), emoji: z.string().optional(), analogy: z.string().optional(), image_url: z.string().optional(), audio_url: z.string().optional(),
  })),
  explore_config: z.discriminatedUnion('type', [
    z.object({ type: z.literal('planet_viewer'), planets: z.array(z.string()).min(1), min_seconds: z.number().optional(), instruction: z.string().optional() }),
    z.object({ type: z.literal('day_night'), min_seconds: z.number().optional(), instruction: z.string().optional() }),
    z.object({ type: z.literal('space_calculator'), planets: z.array(z.string()).optional(), min_seconds: z.number().optional(), instruction: z.string().optional() }),
    z.object({ type: z.literal('moon_phases'), min_seconds: z.number().optional(), instruction: z.string().optional() }),
  ]),
});

export async function saveModule(input: unknown, isNew: boolean): Promise<Result> {
  await requireAdmin();
  const p = moduleSchema.safeParse(input);
  if (!p.success) return fail(`${p.error.issues[0].path.join('.')}: ${p.error.issues[0].message}`);
  const sb = db();
  if (isNew) {
    const { data } = await sb.from('modules').select('id').eq('id', p.data.id).maybeSingle();
    if (data) return fail('ID modul sudah dipakai.');
  }
  const { error } = await sb.from('modules').upsert(p.data, { onConflict: 'id' });
  if (error) return fail(error.message);
  revalidatePath('/admin/modules'); revalidatePath('/hub');
  return ok('Modul disimpan.');
}

export async function toggleModule(id: string, published: boolean): Promise<Result> {
  await requireAdmin();
  const { error } = await db().from('modules').update({ is_published: published }).eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/admin/modules');
  return ok(published ? 'Modul dipublikasikan.' : 'Modul disembunyikan dari siswa.');
}

export async function deleteModule(id: string): Promise<Result> {
  await requireAdmin();
  const { error } = await db().from('modules').delete().eq('id', id);
  if (error) return fail(error.message);
  revalidatePath('/admin/modules');
  return ok('Modul dan soalnya dihapus.');
}

/* ------------------------------ SOAL ------------------------------ */
const questionSchema = z.object({
  id: z.string().uuid().optional(),
  purpose: z.enum(['module_test', 'pre_test', 'post_test']),
  module_id: z.string().nullable(),
  question_type: z.enum(['simulation_driven', 'drag_drop', 'ordering', 'hotspot', 'scenario', 'multiple_choice']),
  question_text: z.string().trim().min(3),
  explanation: z.string().trim().optional().nullable(),
  order_index: z.number().int().min(0),
  question_data_json: z.record(z.string(), z.any()),
  correct_answer_json: z.record(z.string(), z.any()),
});

function validateKey(type: string, data: any, key: any): string | null {
  const ids = (arr: any) => (Array.isArray(arr) ? arr.map((x: any) => x.id) : []);
  switch (type) {
    case 'simulation_driven': return key.ranges || (key.min != null && key.max != null) ? null : 'Kunci: {"ranges":[[min,max]]} atau {"min":..,"max":..}';
    case 'drag_drop': {
      const items = ids(data.items), cats = ids(data.categories);
      if (!items.length || !cats.length) return 'question_data_json butuh "items" dan "categories".';
      if (!key.mapping || items.some((i: string) => !cats.includes(key.mapping[i]))) return 'Kunci: {"mapping":{itemId:categoryId}} harus memuat semua item.';
      return null;
    }
    case 'ordering': {
      const items = ids(data.items);
      return Array.isArray(key.order) && key.order.length === items.length && key.order.every((x: string) => items.includes(x)) ? null : 'Kunci: {"order":[...]} harus memuat semua id item.';
    }
    case 'hotspot': return ids(data.hotspots).includes(key.hotspotId) ? null : 'Kunci: {"hotspotId":"..."} harus salah satu id hotspot.';
    case 'scenario': return ids(data.choices).includes(key.choiceId) || (key.choiceIds ?? []).length ? null : 'Kunci: {"choiceId":"..."} harus salah satu id pilihan.';
    case 'multiple_choice': return ids(data.options).includes(key.optionId) || (key.optionIds ?? []).length ? null : 'Kunci: {"optionId":"..."} harus salah satu id opsi.';
  }
  return null;
}

export async function saveQuestion(input: unknown): Promise<Result> {
  await requireAdmin();
  const p = questionSchema.safeParse(input);
  if (!p.success) return fail(`${p.error.issues[0].path.join('.')}: ${p.error.issues[0].message}`);
  const q = p.data;
  if (q.purpose === 'module_test' && !q.module_id) return fail('Test modul harus memilih modul.');
  if (q.purpose !== 'module_test') q.module_id = null;
  const bad = validateKey(q.question_type, q.question_data_json, q.correct_answer_json);
  if (bad) return fail(bad);

  const sb = db();
  let keyChanged = false;
  if (q.id) {
    const { data: old } = await sb.from('quiz_questions').select('correct_answer_json, question_type').eq('id', q.id).maybeSingle();
    keyChanged = !!old && (JSON.stringify(old.correct_answer_json) !== JSON.stringify(q.correct_answer_json) || old.question_type !== q.question_type);
  }
  const { data, error } = await sb.from('quiz_questions').upsert(q, { onConflict: 'id' }).select('id').single();
  if (error) return fail(error.message);
  let extra = '';
  if (keyChanged) {
    const r = await recomputeAll({ regrade: true, questionId: data.id });
    extra = ` Kunci berubah → ${r.regraded} jawaban dinilai ulang, nilai ${r.students} siswa dihitung ulang.`;
  }
  revalidatePath('/admin', 'layout');
  return ok(`Soal disimpan.${extra}`, { id: data.id });
}

export async function deleteQuestion(id: string): Promise<Result> {
  await requireAdmin();
  const { error } = await db().from('quiz_questions').delete().eq('id', id);
  if (error) return fail(error.message);
  await recomputeAll();
  revalidatePath('/admin', 'layout');
  return ok('Soal dihapus dan nilai dihitung ulang.');
}

/* -------------------------- GRADEBOOK ----------------------------- */
export async function recalculateAll(): Promise<Result> {
  await requireAdmin();
  const r = await recomputeAll({ regrade: true });
  revalidatePath('/admin', 'layout');
  return ok(`Selesai: ${r.regraded} jawaban dinilai ulang, ${r.students} siswa dihitung ulang.`);
}

export async function overrideQuestion(userId: string, questionId: string, score: number, reason: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!Number.isFinite(score) || score < 0 || score > 100) return fail('Nilai harus 0-100.');
  if (reason.trim().length < 3) return fail('Alasan override wajib diisi.');
  const sb = db();
  const { data: last } = await sb.from('quiz_attempts').select('id, score_given').eq('user_id', userId).eq('question_id', questionId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  const patch = { score_given: Math.round(score), is_overridden: true, overridden_by: admin.id, override_reason: reason.trim(), is_correct: score >= 60 };
  if (last) await sb.from('quiz_attempts').update(patch).eq('id', last.id);
  else await sb.from('quiz_attempts').insert({ user_id: userId, question_id: questionId, attempt_no: 1, user_answer_json: null, ...patch });
  await sb.from('grade_overrides').insert({ user_id: userId, target: `question:${questionId}`, old_score: last?.score_given ?? null, new_score: Math.round(score), reason: reason.trim(), admin_id: admin.id });
  await recomputeUser(userId);
  revalidatePath(`/admin/gradebook/${userId}`);
  return ok('Nilai soal di-override.');
}

export async function overrideTotal(userId: string, target: 'pre_test' | 'post_test' | `module:${string}`, score: number, reason: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!Number.isFinite(score) || score < 0 || score > 100) return fail('Nilai harus 0-100.');
  if (reason.trim().length < 3) return fail('Alasan override wajib diisi.');
  const sb = db();
  const s = Math.round(score);
  let old: number | null = null;
  if (target === 'pre_test' || target === 'post_test') {
    const { data: e } = await sb.from('research_evaluations').select('*').eq('user_id', userId).maybeSingle();
    old = e?.[target === 'pre_test' ? 'pre_test_score' : 'post_test_score'] ?? null;
    const now = new Date().toISOString();
    const patch = target === 'pre_test'
      ? { pre_test_score: s, pre_overridden: true, pre_test_done_at: e?.pre_test_done_at ?? now }
      : { post_test_score: s, post_overridden: true, post_test_done_at: e?.post_test_done_at ?? now };
    await sb.from('research_evaluations').upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
  } else {
    const moduleId = target.slice('module:'.length);
    const { data: p } = await sb.from('student_module_progress').select('test_score').eq('user_id', userId).eq('module_id', moduleId).maybeSingle();
    old = p?.test_score ?? null;
    await sb.from('student_module_progress').upsert({ user_id: userId, module_id: moduleId, test_score: s, test_completed: true, score_overridden: true, updated_at: new Date().toISOString() }, { onConflict: 'user_id,module_id' });
  }
  await sb.from('grade_overrides').insert({ user_id: userId, target, old_score: old, new_score: s, reason: reason.trim(), admin_id: admin.id });
  await recomputeUser(userId);
  revalidatePath(`/admin/gradebook/${userId}`); revalidatePath('/admin');
  return ok('Nilai total di-override dan tercatat di audit log.');
}

export async function clearOverride(userId: string, target: 'pre_test' | 'post_test' | `module:${string}`): Promise<Result> {
  const admin = await requireAdmin();
  const sb = db();
  if (target === 'pre_test') await sb.from('research_evaluations').update({ pre_overridden: false }).eq('user_id', userId);
  else if (target === 'post_test') await sb.from('research_evaluations').update({ post_overridden: false }).eq('user_id', userId);
  else await sb.from('student_module_progress').update({ score_overridden: false }).eq('user_id', userId).eq('module_id', target.slice(7));
  await sb.from('grade_overrides').insert({ user_id: userId, target, reason: 'Override dicabut (nilai otomatis dipulihkan)', admin_id: admin.id });
  await recomputeUser(userId);
  revalidatePath(`/admin/gradebook/${userId}`);
  return ok('Override dicabut; nilai otomatis dipulihkan.');
}

/* ----------------------------- ASTROBOT --------------------------- */
const astroSchema = z.object({
  enabled: z.boolean(), model: z.string().trim().min(3).max(80),
  max_output_tokens: z.number().int().min(50).max(2000), daily_message_limit: z.number().int().min(0).max(500),
  system_prompt: z.string().trim().min(20).max(6000),
});
export async function saveAstroSettings(input: unknown): Promise<Result> {
  await requireAdmin();
  const p = astroSchema.safeParse(input);
  if (!p.success) return fail(`${p.error.issues[0].path.join('.')}: ${p.error.issues[0].message}`);
  const { error } = await db().from('app_settings').upsert({ key: 'astrobot', value: p.data, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return fail(error.message);
  revalidatePath('/admin/astrobot');
  return ok('Pengaturan AstroBot disimpan.');
}

/* ------------------------------ MEDIA ----------------------------- */
const ALLOWED: Record<string, string> = { 'image/svg+xml': 'svg', 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'audio/mpeg': 'mp3' };
export async function uploadMedia(fd: FormData): Promise<Result> {
  await requireAdmin();
  const file = fd.get('file');
  if (!(file instanceof File) || !file.size) return fail('Pilih file dulu.');
  const ext = ALLOWED[file.type];
  if (!ext) return fail('Format didukung: SVG, WebP, PNG, JPG, MP3.');
  if (file.size > 5 * 1024 * 1024) return fail('Ukuran maksimum 5 MB.');
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'media';
  const path = `${ext === 'mp3' ? 'audio' : 'images'}/${Date.now()}-${base}.${ext}`;
  const sb = db();
  const { error } = await sb.storage.from('tatasurya-media').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) return fail(error.message);
  const { data } = sb.storage.from('tatasurya-media').getPublicUrl(path);
  revalidatePath('/admin/modules');
  return ok('File terunggah.', { url: data.publicUrl, path });
}

export async function deleteMedia(path: string): Promise<Result> {
  await requireAdmin();
  const { error } = await db().storage.from('tatasurya-media').remove([path]);
  if (error) return fail(error.message);
  revalidatePath('/admin/modules');
  return ok('File dihapus.');
}