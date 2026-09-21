import 'server-only';
import { db } from '@/lib/supabase/admin';
import { questionStateFromAttempts } from '@/lib/quiz';
import type { QuizPurpose } from '@/lib/types';

interface QRow { id: string; module_id: string | null; purpose: QuizPurpose }
interface Agg {
  modules: Record<string, { score: number; completed: boolean }>;
  pre: { score: number; completed: boolean };
  post: { score: number; completed: boolean };
}

/** Hitung nilai agregat satu siswa dari bank soal + seluruh percobaannya. */
export function computeAggregates(questions: QRow[], attempts: any[]): Agg {
  const byQ: Record<string, any[]> = {};
  attempts.forEach((a) => (byQ[a.question_id] ??= []).push(a));

  const groups: Record<string, QRow[]> = {};
  questions.forEach((q) => {
    const key = q.purpose === 'module_test' ? `m:${q.module_id}` : q.purpose;
    (groups[key] ??= []).push(q);
  });

  const summarize = (qs: QRow[]) => {
    if (!qs.length) return { score: 0, completed: false };
    let sum = 0;
    let allResolved = true;
    qs.forEach((q) => {
      const st = questionStateFromAttempts(byQ[q.id] ?? [], q.purpose);
      sum += st.bestScore;
      if (!st.resolved) allResolved = false;
    });
    return { score: Math.round(sum / qs.length), completed: allResolved };
  };

  const modules: Agg['modules'] = {};
  Object.entries(groups).forEach(([k, qs]) => {
    if (k.startsWith('m:')) modules[k.slice(2)] = summarize(qs);
  });
  return { modules, pre: summarize(groups['pre_test'] ?? []), post: summarize(groups['post_test'] ?? []) };
}

export function nGain(pre: number, post: number): number | null {
  if (pre >= 100) return null;
  return Math.round(((post - pre) / (100 - pre)) * 100) / 100;
}

export function nGainCategory(g: number | null | undefined): 'Tinggi' | 'Sedang' | 'Rendah' | '-' {
  if (g == null) return '-';
  if (g >= 0.7) return 'Tinggi';
  if (g >= 0.3) return 'Sedang';
  return 'Rendah';
}

async function persist(userId: string, agg: Agg, existingProgress: any[], existingEval: any | null) {
  const sb = db();
  const overriddenModules = new Set(existingProgress.filter((p) => p.score_overridden).map((p) => p.module_id));

  const rows = Object.entries(agg.modules)
    .filter(([module_id]) => !overriddenModules.has(module_id)) // nilai yang di-override admin tidak ditimpa
    .map(([module_id, v]) => ({
      user_id: userId,
      module_id,
      test_completed: v.completed,
      test_score: v.score,
      updated_at: new Date().toISOString(),
    }));
  // pastikan modul benar-benar ada (FK); abaikan modul yang sudah dihapus
  if (rows.length) {
    const { data: mods } = await sb.from('modules').select('id').in('id', rows.map((r) => r.module_id));
    const valid = new Set((mods ?? []).map((m: any) => m.id));
    const ok = rows.filter((r) => valid.has(r.module_id));
    if (ok.length) await sb.from('student_module_progress').upsert(ok, { onConflict: 'user_id,module_id' });
  }

  const pre = existingEval?.pre_overridden ? existingEval.pre_test_score : agg.pre.score;
  const post = existingEval?.post_overridden ? existingEval.post_test_score : agg.post.score;
  const preDone = agg.pre.completed || !!existingEval?.pre_overridden;
  const postDone = agg.post.completed || !!existingEval?.post_overridden;
  const now = new Date().toISOString();
  await sb.from('research_evaluations').upsert(
    {
      user_id: userId,
      pre_test_score: pre,
      post_test_score: post,
      n_gain_score: preDone && postDone ? nGain(pre, post) : null,
      pre_test_done_at: preDone ? existingEval?.pre_test_done_at ?? now : null,
      post_test_done_at: postDone ? existingEval?.post_test_done_at ?? now : null,
    },
    { onConflict: 'user_id' },
  );
}

/** Hitung ulang & simpan nilai satu siswa. Mengembalikan agregat terbaru. */
export async function recomputeUser(userId: string) {
  const sb = db();
  const [{ data: qs }, { data: atts }, { data: prog }, { data: ev }] = await Promise.all([
    sb.from('quiz_questions').select('id, module_id, purpose'),
    sb.from('quiz_attempts').select('question_id, score_given, is_correct, is_overridden, created_at').eq('user_id', userId).order('created_at'),
    sb.from('student_module_progress').select('module_id, score_overridden').eq('user_id', userId),
    sb.from('research_evaluations').select('*').eq('user_id', userId).maybeSingle(),
  ]);
  const agg = computeAggregates((qs ?? []) as QRow[], atts ?? []);
  await persist(userId, agg, prog ?? [], ev ?? null);
  return agg;
}

/**
 * Hitung ulang SEMUA siswa. Bila `regrade` = true, tiap percobaan dinilai ulang dengan kunci jawaban
 * terbaru (kecuali percobaan yang sudah di-override admin). Dipakai setelah kunci jawaban diubah.
 */
export async function recomputeAll(opts: { regrade?: boolean; questionId?: string } = {}) {
  const sb = db();
  const { gradeAnswer, scoreForAttempt } = await import('@/lib/quiz');
  const { data: qs } = await sb.from('quiz_questions').select('id, module_id, purpose, question_type, correct_answer_json');
  const questions = (qs ?? []) as any[];

  let regraded = 0;
  if (opts.regrade) {
    const targets = opts.questionId ? questions.filter((q) => q.id === opts.questionId) : questions;
    for (const q of targets) {
      const { data: atts } = await sb
        .from('quiz_attempts')
        .select('id, user_answer_json, is_correct, score_given, attempt_no, hint_used, is_overridden')
        .eq('question_id', q.id);
      for (const a of atts ?? []) {
        if (a.is_overridden) continue;
        const correct = gradeAnswer(q.question_type, a.user_answer_json, q.correct_answer_json);
        const score = scoreForAttempt(q.purpose, correct, a.attempt_no, a.hint_used);
        if (correct !== a.is_correct || score !== a.score_given) {
          await sb.from('quiz_attempts').update({ is_correct: correct, score_given: score }).eq('id', a.id);
          regraded++;
        }
      }
    }
  }

  const { data: students } = await sb.from('profiles').select('id').eq('role', 'student');
  const { data: allAtts } = await sb.from('quiz_attempts').select('user_id, question_id, score_given, is_correct, is_overridden, created_at').order('created_at');
  const { data: allProg } = await sb.from('student_module_progress').select('user_id, module_id, score_overridden');
  const { data: allEval } = await sb.from('research_evaluations').select('*');

  const attBy: Record<string, any[]> = {};
  (allAtts ?? []).forEach((a: any) => (attBy[a.user_id] ??= []).push(a));
  const progBy: Record<string, any[]> = {};
  (allProg ?? []).forEach((p: any) => (progBy[p.user_id] ??= []).push(p));
  const evalBy: Record<string, any> = {};
  (allEval ?? []).forEach((e: any) => (evalBy[e.user_id] = e));

  for (const s of students ?? []) {
    const agg = computeAggregates(questions, attBy[s.id] ?? []);
    await persist(s.id, agg, progBy[s.id] ?? [], evalBy[s.id] ?? null);
  }
  return { students: students?.length ?? 0, regraded };
}
