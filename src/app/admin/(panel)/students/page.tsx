import StudentsManager from '@/components/admin/StudentsManager';
import { db } from '@/lib/supabase/admin';

export const metadata = { title: 'Siswa' };

export default async function StudentsPage() {
  const { data } = await db().from('profiles').select('id, full_name, class_name, pin_code, avatar_id').eq('role', 'student').order('class_name').order('full_name');
  return (<><h1 className="text-2xl font-semibold text-slate-900">Siswa</h1><StudentsManager students={(data ?? []) as any[]} /></>);
}
