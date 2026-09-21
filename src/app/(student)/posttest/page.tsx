import { redirect } from 'next/navigation';
import QuizRunner from '@/components/quiz/QuizRunner';
import { loadQuiz } from '@/lib/quiz';
import { requireStudent } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { avatarEmoji } from '@/lib/types';

export const metadata = { title: 'Ujian Akhir Kapten' };

export default async function Page() {
  const me = await requireStudent();
  const sb = db();
  const [{ data: ev }, { data: mods }, { data: prog }] = await Promise.all([
    sb.from('research_evaluations').select('pre_test_done_at').eq('user_id', me.id).maybeSingle(),
    sb.from('modules').select('id').eq('is_published', true),
    sb.from('student_module_progress').select('module_id, test_completed').eq('user_id', me.id),
  ]);
  const done = new Set((prog ?? []).filter((p: any) => p.test_completed).map((p: any) => p.module_id));
  if (!ev?.pre_test_done_at || !(mods ?? []).every((m: any) => done.has(m.id))) redirect('/hub');
  const { questions, states } = await loadQuiz(me.id, { purpose: 'post_test' });
  return (
    <div className="px-4 pb-32 pt-2">
      <h1 className="mb-6 text-center text-3xl font-semibold sm:text-4xl">Ujian Akhir Kapten</h1>
      <QuizRunner mode="post_test" title="Ujian Akhir Kapten" questions={questions} initialStates={states} avatar={avatarEmoji(me.avatar)} backHref="/hub" />
    </div>
  );
}
