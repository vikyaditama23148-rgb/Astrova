import Link from 'next/link';
import RecalcButton from '@/components/admin/RecalcButton';
import { btnCls } from '@/components/admin/styles';
import { loadResearchData, summarize } from '@/lib/research';

export const metadata = { title: 'Buku Nilai' };

export default async function Gradebook() {
  const d = await loadResearchData();
  const s = summarize(d);
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Buku Nilai</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm text-slate-600">Nilai dihitung otomatis di server. Klik “Detail” untuk mengubah (override) nilai, mereset pengerjaan, atau melihat jawaban per soal.</p>
        <RecalcButton />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500"><tr><th className="p-3">Nama</th><th>Kelas</th><th>Pre</th>{d.modules.map((m) => <th key={m.id}>{m.title}</th>)}<th>Post</th><th>N-Gain</th><th /></tr></thead>
          <tbody>
            {s.rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="p-3 font-medium">{r.full_name}</td><td>{r.class_name ?? '-'}</td><td>{r.pre ?? '-'}</td>
                {d.modules.map((m) => <td key={m.id}>{r.modules[m.id]?.test_completed ? r.modules[m.id].test_score : '-'}</td>)}
                <td>{r.post ?? '-'}</td><td>{r.nGain ?? '-'}</td><td className="p-3"><Link className={btnCls('ghost')} href={`/admin/gradebook/${r.id}`}>Detail</Link></td>
              </tr>
            ))}
            {!s.rows.length && <tr><td colSpan={7} className="p-6 text-center text-slate-500">Belum ada siswa.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}