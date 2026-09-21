import Link from 'next/link';
import { db } from '@/lib/supabase/admin';
import { PURPOSE_LABEL, QUESTION_TYPE_LABEL } from '@/lib/types';
import { btnCls } from '@/components/admin/styles';

export const metadata = { title: 'Bank Soal' };

export default async function Questions({ searchParams }: { searchParams: Promise<{ module?: string; purpose?: string }> }) {
  const sp = await searchParams;
  const sb = db();
  let q = sb.from('quiz_questions').select('id, module_id, purpose, question_type, question_text, order_index').order('purpose').order('module_id').order('order_index');
  if (sp.module) q = q.eq('module_id', sp.module);
  if (sp.purpose) q = q.eq('purpose', sp.purpose);
  const [{ data }, { data: mods }] = await Promise.all([q, sb.from('modules').select('id, title').order('order_index')]);
  const title = Object.fromEntries((mods ?? []).map((m: any) => [m.id, m.title]));
  const chip = (href: string, label: string, on: boolean) => <Link key={href} href={href} className={`rounded-full border px-3 py-1 text-sm ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>{label}</Link>;
  return (
    <>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold text-slate-900">Bank Soal</h1><Link href={`/admin/questions/new${sp.module ? `?module=${sp.module}` : ''}`} className={btnCls()}>+ Soal baru</Link></div>
      <div className="flex flex-wrap gap-2">
        {chip('/admin/questions', 'Semua', !sp.module && !sp.purpose)}
        {chip('/admin/questions?purpose=pre_test', 'Pre-Test', sp.purpose === 'pre_test')}
        {chip('/admin/questions?purpose=post_test', 'Post-Test', sp.purpose === 'post_test')}
        {(mods ?? []).map((m: any) => chip(`/admin/questions?module=${m.id}`, m.title, sp.module === m.id))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500"><tr><th className="p-3">#</th><th>Tujuan</th><th>Modul</th><th>Tipe</th><th>Soal</th><th /></tr></thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="p-3">{r.order_index}</td><td>{(PURPOSE_LABEL as any)[r.purpose]}</td><td>{title[r.module_id] ?? '-'}</td><td>{(QUESTION_TYPE_LABEL as any)[r.question_type]}</td>
                <td className="max-w-md truncate">{r.question_text}</td><td className="p-3"><Link href={`/admin/questions/${r.id}`} className={btnCls('ghost')}>Edit</Link></td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Belum ada soal.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}