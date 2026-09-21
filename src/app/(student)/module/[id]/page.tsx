import { notFound, redirect } from 'next/navigation';
import ModuleShell from '@/components/ModuleShell';
import { PLANET_MAP } from '@/lib/planets';
import { loadQuiz } from '@/lib/quiz';
import { requireStudent } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { avatarEmoji, type ModuleRow } from '@/lib/types';

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireStudent();
  const sb = db();
  const [{ data: m }, { data: ev }, { data: prog }] = await Promise.all([
    sb.from('modules').select('*').eq('id', id).eq('is_published', true).maybeSingle(),
    sb.from('research_evaluations').select('pre_test_done_at').eq('user_id', me.id).maybeSingle(),
    sb.from('student_module_progress').select('*').eq('user_id', me.id).eq('module_id', id).maybeSingle(),
  ]);
  if (!m) notFound();
  if (!ev?.pre_test_done_at) redirect('/pretest');
  const { questions, states } = await loadQuiz(me.id, { purpose: 'module_test', moduleId: id });
  const pid = (m as ModuleRow).planet_name?.toLowerCase() ?? '';
  return (
    <ModuleShell module={m as ModuleRow} progress={prog ?? null} avatar={avatarEmoji(me.avatar)} questions={questions} states={states} planetId={PLANET_MAP[pid] ? pid : 'bumi'} />
  );
}
