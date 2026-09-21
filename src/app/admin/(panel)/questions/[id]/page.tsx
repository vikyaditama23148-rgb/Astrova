import { notFound } from 'next/navigation';
import QuestionForm from '@/components/admin/QuestionForm';
import { db } from '@/lib/supabase/admin';

export const metadata = { title: 'Edit Soal' };

export default async function EditQuestion({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ module?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const sb = db();
  const { data: mods } = await sb.from('modules').select('id, title').order('order_index');
  if (id === 'new') {
    const first = sp.module ?? mods?.[0]?.id ?? null;
    return (<><h1 className="text-2xl font-semibold text-slate-900">Soal baru</h1><QuestionForm modules={mods ?? []} initial={{ purpose: 'module_test', module_id: first, question_type: 'scenario', question_text: '', explanation: '', order_index: 0, question_data_json: undefined, correct_answer_json: undefined }} /></>);
  }
  const { data } = await sb.from('quiz_questions').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  return (<><h1 className="text-2xl font-semibold text-slate-900">Edit soal</h1><QuestionForm key={id} modules={mods ?? []} initial={data as any} /></>);
}
