import QuizRunner from '@/components/quiz/QuizRunner';
import { loadQuiz } from '@/lib/quiz';
import { requireStudent } from '@/lib/session';
import { avatarEmoji } from '@/lib/types';

export const metadata = { title: 'Misi Pemanasan' };

export default async function Page() {
  const me = await requireStudent();

  const { questions, states } = await loadQuiz(me.id, { purpose: 'pre_test' });
  return (
    <div className="px-4 pb-32 pt-2">
      <h1 className="mb-6 text-center text-3xl font-semibold sm:text-4xl">Misi Pemanasan</h1>
      <QuizRunner mode="pre_test" title="Misi Pemanasan" questions={questions} initialStates={states} avatar={avatarEmoji(me.avatar)} backHref="/hub" />
    </div>
  );
}
