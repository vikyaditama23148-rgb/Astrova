import ModuleList from '@/components/admin/ModuleList';
import { db } from '@/lib/supabase/admin';

export const metadata = { title: 'Modul' };

export default async function ModulesPage() {
  const sb = db();
  const [{ data: mods }, { data: qs }] = await Promise.all([sb.from('modules').select('id, title, planet_name, is_published, order_index').order('order_index'), sb.from('quiz_questions').select('module_id').eq('purpose', 'module_test')]);
  const count: Record<string, number> = {};
  (qs ?? []).forEach((q: any) => (count[q.module_id] = (count[q.module_id] ?? 0) + 1));
  return (<><h1 className="text-2xl font-semibold text-slate-900">Modul</h1><ModuleList modules={(mods ?? []).map((m: any) => ({ ...m, questions: count[m.id] ?? 0 }))} /></>);
}
