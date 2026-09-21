import { notFound } from 'next/navigation';
import ModuleForm from '@/components/admin/ModuleForm';
import { db } from '@/lib/supabase/admin';
import type { ModuleRow } from '@/lib/types';

export const metadata = { title: 'Edit Modul' };

export default async function EditModule({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'new') return (<><h1 className="text-2xl font-semibold text-slate-900">Modul baru</h1><ModuleForm initial={null} isNew /></>);
  const { data } = await db().from('modules').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  return (<><h1 className="text-2xl font-semibold text-slate-900">Edit modul</h1><ModuleForm key={id} initial={data as ModuleRow} isNew={false} /></>);
}
