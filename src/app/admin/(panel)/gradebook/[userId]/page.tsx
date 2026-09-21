import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AttemptsTable, TotalsTable, type AttemptRow, type TotalRow } from '@/components/admin/GradeEditor';
import { Card } from '@/components/admin/ui';
import { db } from '@/lib/supabase/admin';
import { questionStateFromAttempts } from '@/lib/quiz';
import { PURPOSE_LABEL } from '@/lib/types';

export const metadata = { title: 'Detail Nilai Siswa' };

export default async function StudentGrades({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const sb = db();
  const { data: s } = await sb.from('profiles').select('id, full_name, class_name').eq('id', userId).eq('role', 'student').maybeSingle();
  if (!s) notFound();
  const [{ data: mods }, { data: prog }, { data: ev }, { data: qs }, { data: atts }, { data: audit }] = await Promise.all([
    sb.from('modules').select('id, title').order('order_index'),
    sb.from('student_module_progress').select('*').eq('user_id', userId),
    sb.from('research_evaluations').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('quiz_questions').select('id, module_id, purpose, question_text, order_index').order('purpose').order('module_id').order('order_index'),
    sb.from('quiz_attempts').select('*').eq('user_id', userId).order('created_at'),
    sb.from('grade_overrides').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
  ]);
  const pBy = Object.fromEntries((prog ?? []).map((p: any) => [p.module_id, p]));
  const title = Object.fromEntries((mods ?? []).map((m: any) => [m.id, m.title]));

  const totals: TotalRow[] = [
    { target: 'pre_test', label: 'Pre-Test', score: ev?.pre_test_done_at ? ev.pre_test_score : null, overridden: !!ev?.pre_overridden, done: !!ev?.pre_test_done_at, reset: 'pre' },
    ...(mods ?? []).map((m: any): TotalRow => ({ target: `module:${m.id}`, label: `Test: ${m.title}`, score: pBy[m.id]?.test_completed ? pBy[m.id].test_score : null, overridden: !!pBy[m.id]?.score_overridden, done: !!pBy[m.id]?.test_completed, reset: `module:${m.id}` })),
    { target: 'post_test', label: 'Post-Test', score: ev?.post_test_done_at ? ev.post_test_score : null, overridden: !!ev?.post_overridden, done: !!ev?.post_test_done_at, reset: 'post' },
  ];

  const byQ: Record<string, any[]> = {};
  (atts ?? []).forEach((a: any) => (byQ[a.question_id] ??= []).push(a));
  const rows: AttemptRow[] = (qs ?? []).filter((q: any) => byQ[q.id]).map((q: any) => {
    const st = questionStateFromAttempts(byQ[q.id], q.purpose);
    const ov = byQ[q.id].filter((a) => a.is_overridden).at(-1);
    return { key: q.id, questionId: q.id, purpose: (PURPOSE_LABEL as any)[q.purpose], module: title[q.module_id] ?? '-', text: q.question_text, attempts: st.attempts, correct: st.correct || !!ov, score: st.bestScore, overridden: !!ov, reason: ov?.override_reason ?? null };
  });

  return (
    <>
      <div><Link href="/admin/gradebook" className="text-sm text-indigo-600 hover:underline">← Buku nilai</Link><h1 className="mt-1 text-2xl font-semibold text-slate-900">{s.full_name} <span className="text-base font-normal text-slate-500">{s.class_name}</span></h1></div>
      <Card title="Nilai total (override & reset)"><TotalsTable userId={userId} rows={totals} /></Card>
      <Card title="Jawaban per soal"><AttemptsTable userId={userId} rows={rows} /></Card>
      <Card title="Audit log override">
        {(audit ?? []).length ? (
          <ul className="space-y-2 text-sm">{(audit ?? []).map((a: any) => <li key={a.id} className="rounded-lg bg-slate-50 p-3"><span className="font-mono text-xs text-slate-500">{new Date(a.created_at).toLocaleString('id-ID')}</span> · <b>{a.target}</b>: {a.old_score ?? '-'} → {a.new_score ?? '-'} <span className="text-slate-600">— {a.reason}</span></li>)}</ul>
        ) : <p className="text-sm text-slate-500">Belum ada override.</p>}
      </Card>
    </>
  );
}
