'use client';

import Link from 'next/link';
import { deleteModule, toggleModule } from '@/app/admin/actions';
import { btnCls, Card, Confirm, Msg, useRun } from '@/components/admin/ui';

interface M { id: string; title: string; planet_name: string | null; is_published: boolean; order_index: number; questions: number }

export default function ModuleList({ modules }: { modules: M[] }) {
  const { run, pending, msg } = useRun();
  return (
    <Card title="Modul pembelajaran" actions={<Link href="/admin/modules/new" className={btnCls()}>+ Modul baru</Link>}>
      <Msg msg={msg} />
      <div className="overflow-x-auto">
        <table className="mt-3 w-full text-left text-sm">
          <thead className="border-b text-slate-500"><tr><th className="py-2">Urutan</th><th>Modul</th><th>Planet</th><th>Soal</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-b border-slate-100">
                <td className="py-2">{m.order_index}</td>
                <td><p className="font-medium">{m.title}</p><p className="font-mono text-xs text-slate-500">{m.id}</p></td>
                <td>{m.planet_name ?? '-'}</td><td>{m.questions}</td>
                <td><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{m.is_published ? 'Terbit' : 'Draf'}</span></td>
                <td className="space-x-1 whitespace-nowrap py-2">
                  <Link href={`/admin/modules/${m.id}`} className={btnCls('ghost')}>Edit</Link>
                  <Link href={`/admin/questions?module=${m.id}`} className={btnCls('ghost')}>Soal</Link>
                  <button className={btnCls('ghost')} disabled={pending} onClick={() => run(() => toggleModule(m.id, !m.is_published))}>{m.is_published ? 'Sembunyikan' : 'Terbitkan'}</button>
                  <Confirm className={btnCls('danger')} text={`Hapus modul "${m.title}" beserta soal & progres siswa?`} onYes={() => run(() => deleteModule(m.id))}>Hapus</Confirm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
