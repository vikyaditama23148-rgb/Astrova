import 'server-only';
import { computeBadges } from '@/lib/badges';
import { nGainCategory } from '@/lib/scoring';
import { questionStateFromAttempts } from '@/lib/quiz';
import { starsFromScore } from '@/lib/stars';
import { db } from '@/lib/supabase/admin';
import { QUESTION_TYPE_LABEL, type ModuleRow, type ProgressRow, type QuestionType } from '@/lib/types';

export interface ModuleReportRow {
  id: string; title: string; score: number; stars: 0 | 1 | 2 | 3; completed: boolean;
  hintRate: number; attemptsAvg: number; exploreSeconds: number;
}
export interface TypeStat { type: QuestionType; label: string; accuracy: number; correct: number; total: number }

export interface EvaluationReport {
  studentName: string; className: string | null;
  preScore: number | null; postScore: number | null;
  nGainValue: number | null; nGainCat: 'Tinggi' | 'Sedang' | 'Rendah' | '-';
  totalStars: number; maxStars: number; badgesEarned: number; badgesTotal: number;
  exploreMinutesTotal: number;
  modules: ModuleReportRow[];
  strongModules: ModuleReportRow[]; weakModules: ModuleReportRow[];
  typeStats: TypeStat[]; strongestType: TypeStat | null; weakestType: TypeStat | null;
}

/**
 * Hitung SELURUH fakta evaluasi murni dari data asli di database — tidak ada
 * AI/LLM di fungsi ini sama sekali. Fungsi inilah "kebenaran tunggal" yang
 * nanti dipakai AstroBot untuk membuat kalimat, sehingga AstroBot tidak bisa
 * menyebut angka atau modul di luar hasil perhitungan ini.
 * Mengembalikan null jika Post-Test siswa belum selesai (laporan belum relevan).
 */
export async function buildEvaluationReport(userId: string): Promise<EvaluationReport | null> {
  const sb = db();
  const [{ data: profile }, { data: mods }, { data: prog }, { data: ev }, { data: qs }, { data: atts }] = await Promise.all([
    sb.from('profiles').select('full_name, class_name').eq('id', userId).maybeSingle(),
    sb.from('modules').select('id, title, planet_name, description, learn_content, explore_config, is_published, order_index').eq('is_published', true).order('order_index'),
    sb.from('student_module_progress').select('*').eq('user_id', userId),
    sb.from('research_evaluations').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('quiz_questions').select('id, module_id, purpose, question_type'),
    sb.from('quiz_attempts').select('question_id, score_given, is_correct, hint_used, created_at').eq('user_id', userId).order('created_at'),
  ]);
  if (!ev?.post_test_done_at) return null;

  const modules = (mods ?? []) as { id: string; title: string; planet_name: string | null; description: string | null; learn_content: any; explore_config: any; is_published: boolean; order_index: number }[];
  const progBy: Record<string, any> = Object.fromEntries((prog ?? []).map((p: any) => [p.module_id, p]));
  const attByQ: Record<string, any[]> = {};
  (atts ?? []).forEach((a: any) => (attByQ[a.question_id] ??= []).push(a));
  const moduleTestQs = (qs ?? []).filter((q: any) => q.purpose === 'module_test');

  const moduleRows: ModuleReportRow[] = modules.map((m) => {
    const p = progBy[m.id];
    const score = p?.test_completed ? (p.test_score ?? 0) : 0;
    const qsOfModule = moduleTestQs.filter((q: any) => q.module_id === m.id);
    let hintUsers = 0, attemptSum = 0, answered = 0;
    qsOfModule.forEach((q: any) => {
      const list = attByQ[q.id];
      if (!list?.length) return;
      answered++;
      attemptSum += list.length;
      if (list.some((a: any) => a.hint_used)) hintUsers++;
    });
    return {
      id: m.id, title: m.title, score, stars: p?.test_completed ? starsFromScore(score) : 0,
      completed: !!p?.test_completed, hintRate: answered ? hintUsers / answered : 0,
      attemptsAvg: answered ? Math.round((attemptSum / answered) * 10) / 10 : 0,
      exploreSeconds: p?.time_spent_explore_seconds ?? 0,
    };
  });

  const finished = moduleRows.filter((m) => m.completed);
  const strongModules = [...finished].filter((m) => m.score >= 85).sort((a, b) => b.score - a.score);
  const weakModules = [...finished].filter((m) => m.score < 60).sort((a, b) => a.score - b.score);

  // Akurasi per TIPE soal (hanya soal yang sudah benar-benar tuntas dikerjakan siswa)
  const typeGroups: Record<string, { correct: number; total: number }> = {};
  moduleTestQs.forEach((q: any) => {
    const list = attByQ[q.id];
    if (!list?.length) return;
    const state = questionStateFromAttempts(list, 'module_test');
    if (!state.resolved) return;
    const g = (typeGroups[q.question_type] ??= { correct: 0, total: 0 });
    g.total++;
    if (state.correct) g.correct++;
  });
  const typeStats: TypeStat[] = Object.entries(typeGroups)
    .map(([type, g]) => ({ type: type as QuestionType, label: QUESTION_TYPE_LABEL[type as QuestionType], accuracy: g.total ? g.correct / g.total : 0, correct: g.correct, total: g.total }))
    .filter((t) => t.total > 0)
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);

  const badges = computeBadges(modules as ModuleRow[], progBy as Record<string, ProgressRow>, true, true);
  const gRaw = ev.n_gain_score != null ? Number(ev.n_gain_score) : null;

  return {
    studentName: profile?.full_name ?? 'Penjelajah',
    className: profile?.class_name ?? null,
    preScore: ev.pre_test_score ?? null,
    postScore: ev.post_test_score ?? null,
    nGainValue: gRaw,
    nGainCat: nGainCategory(gRaw),
    totalStars: moduleRows.reduce((s, m) => s + m.stars, 0),
    maxStars: moduleRows.length * 3,
    badgesEarned: badges.filter((b) => b.earned).length,
    badgesTotal: badges.length,
    exploreMinutesTotal: Math.round(moduleRows.reduce((s, m) => s + m.exploreSeconds, 0) / 60),
    modules: moduleRows,
    strongModules, weakModules,
    typeStats,
    strongestType: typeStats[0] ?? null,
    weakestType: typeStats.length ? typeStats[typeStats.length - 1] : null,
  };
}