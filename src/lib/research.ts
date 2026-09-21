import 'server-only';
import { db } from '@/lib/supabase/admin';
import { nGainCategory } from '@/lib/scoring';
import { PURPOSE_LABEL, QUESTION_TYPE_LABEL } from '@/lib/types';

/** Ambil semua data penelitian sekaligus (dipakai dashboard & ekspor). */
export async function loadResearchData() {
  const sb = db();
  const [students, modules, progress, evals, feedback, questions, attempts] = await Promise.all([
    sb.from('profiles').select('id, full_name, class_name, pin_code, avatar_id, created_at').eq('role', 'student').order('class_name').order('full_name'),
    sb.from('modules').select('id, title, order_index, is_published').order('order_index'),
    sb.from('student_module_progress').select('*'),
    sb.from('research_evaluations').select('*'),
    sb.from('usability_feedback').select('*'),
    sb.from('quiz_questions').select('id, module_id, purpose, question_type, question_text'),
    sb.from('quiz_attempts').select('*').order('created_at'),
  ]);
  return {
    students: (students.data ?? []) as any[],
    modules: (modules.data ?? []) as any[],
    progress: (progress.data ?? []) as any[],
    evals: (evals.data ?? []) as any[],
    feedback: (feedback.data ?? []) as any[],
    questions: (questions.data ?? []) as any[],
    attempts: (attempts.data ?? []) as any[],
  };
}
export type ResearchData = Awaited<ReturnType<typeof loadResearchData>>;

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null);

export function summarize(d: ResearchData) {
  const evBy = Object.fromEntries(d.evals.map((e) => [e.user_id, e]));
  const rows = d.students.map((s) => {
    const e = evBy[s.id];
    const prog = d.progress.filter((p) => p.user_id === s.id);
    const pre = e?.pre_test_done_at ? e.pre_test_score : null;
    const post = e?.post_test_done_at ? e.post_test_score : null;
    const g = e?.n_gain_score != null ? Number(e.n_gain_score) : null;
    return {
      ...s, pre, post, nGain: g, category: nGainCategory(g),
      exploreSeconds: prog.reduce((a, p) => a + (p.time_spent_explore_seconds ?? 0), 0),
      modules: Object.fromEntries(prog.map((p) => [p.module_id, p])),
    };
  });
  const gains = rows.map((r) => r.nGain).filter((x): x is number => x != null);
  const byModule = d.modules.map((m) => {
    const ps = d.progress.filter((p) => p.module_id === m.id);
    return {
      id: m.id, title: m.title,
      avgScore: avg(ps.filter((p) => p.test_completed).map((p) => p.test_score ?? 0)),
      avgExplore: avg(ps.map((p) => p.time_spent_explore_seconds ?? 0)),
      completed: ps.filter((p) => p.test_completed).length,
    };
  });
  const classes = Array.from(new Set(rows.map((r) => r.class_name ?? '-'))).map((c) => {
    const rs = rows.filter((r) => (r.class_name ?? '-') === c);
    return {
      name: c, n: rs.length,
      pre: avg(rs.map((r) => r.pre).filter((x): x is number => x != null)),
      post: avg(rs.map((r) => r.post).filter((x): x is number => x != null)),
      gain: avg(rs.map((r) => r.nGain).filter((x): x is number => x != null)),
    };
  });
  return {
    rows, byModule, classes,
    totals: {
      students: rows.length,
      pre: avg(rows.map((r) => r.pre).filter((x): x is number => x != null)),
      post: avg(rows.map((r) => r.post).filter((x): x is number => x != null)),
      gain: avg(gains),
      exploreAvg: avg(rows.map((r) => r.exploreSeconds)),
      cat: { Tinggi: gains.filter((g) => g >= 0.7).length, Sedang: gains.filter((g) => g >= 0.3 && g < 0.7).length, Rendah: gains.filter((g) => g < 0.3).length },
      feedbackAvg: avg(d.feedback.map((f) => f.rating_emoji)),
    },
  };
}

export interface Sheet { name: string; header: string[]; rows: (string | number | null)[][] }

export function buildSheets(d: ResearchData): Sheet[] {
  const sum = summarize(d);
  const stu = Object.fromEntries(d.students.map((s) => [s.id, s]));
  const mod = Object.fromEntries(d.modules.map((m) => [m.id, m]));
  const q = Object.fromEntries(d.questions.map((x) => [x.id, x]));
  const yn = (b: boolean) => (b ? 'Ya' : 'Tidak');

  return [
    {
      name: 'Nilai & N-Gain',
      header: ['Nama', 'Kelas', 'Pre-Test', 'Post-Test', 'N-Gain', 'Kategori N-Gain', 'Total Detik Explore', ...d.modules.map((m) => `Skor ${m.title}`)],
      rows: sum.rows.map((r) => [r.full_name, r.class_name, r.pre, r.post, r.nGain, r.category, r.exploreSeconds, ...d.modules.map((m) => (r.modules[m.id]?.test_completed ? r.modules[m.id].test_score : null))]),
    },
    {
      name: 'Aktivitas Modul',
      header: ['Nama', 'Kelas', 'Modul', 'Learn Selesai', 'Explore Selesai', 'Detik Explore', 'Test Selesai', 'Skor Test', 'Nilai Di-override'],
      rows: d.progress.filter((p) => stu[p.user_id]).map((p) => [stu[p.user_id].full_name, stu[p.user_id].class_name, mod[p.module_id]?.title ?? p.module_id, yn(p.learn_completed), yn(p.explore_completed), p.time_spent_explore_seconds, yn(p.test_completed), p.test_score, yn(p.score_overridden)]),
    },
    {
      name: 'Jawaban',
      header: ['Nama', 'Kelas', 'Tujuan', 'Modul', 'Tipe Soal', 'Soal', 'Percobaan ke', 'Benar', 'Skor', 'Pakai Hint', 'Di-override', 'Alasan Override', 'Waktu'],
      rows: d.attempts.filter((a) => stu[a.user_id] && q[a.question_id]).map((a) => {
        const qq = q[a.question_id];
        return [stu[a.user_id].full_name, stu[a.user_id].class_name, (PURPOSE_LABEL as any)[qq.purpose], mod[qq.module_id]?.title ?? '-', (QUESTION_TYPE_LABEL as any)[qq.question_type], qq.question_text, a.attempt_no, yn(a.is_correct), a.score_given, yn(a.hint_used), yn(a.is_overridden), a.override_reason, a.created_at];
      }),
    },
    {
      name: 'Usability',
      header: ['Nama', 'Kelas', 'Rating (1-5)', 'Saran', 'Waktu'],
      rows: d.feedback.filter((f) => stu[f.user_id]).map((f) => [stu[f.user_id].full_name, stu[f.user_id].class_name, f.rating_emoji, f.feedback_text, f.created_at]),
    },
  ];
}

export function toCsv(sheet: Sheet): string {
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    // cegah CSV/formula injection di Excel
    const safe = /^[=+\-@]/.test(s) && Number.isNaN(Number(s)) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return '\uFEFF' + [sheet.header, ...sheet.rows].map((r) => r.map(esc).join(',')).join('\r\n');
}
