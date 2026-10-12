import Link from 'next/link';
import { BookOpen, HelpCircle, Table2, Users } from 'lucide-react';
import { Card } from '@/components/admin/ui';
import { loadResearchData, summarize } from '@/lib/research';

export const metadata = { title: 'Dashboard' };

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const d = await loadResearchData();
  const s = summarize(d);
  const { totals } = s;

  const preDone = s.rows.filter((r) => r.pre != null).length;
  const postDone = s.rows.filter((r) => r.post != null).length;

  const quickLinks = [
    { href: '/admin/students', label: 'Siswa', icon: Users },
    { href: '/admin/modules', label: 'Modul', icon: BookOpen },
    { href: '/admin/questions', label: 'Bank Soal', icon: HelpCircle },
    { href: '/admin/gradebook', label: 'Buku Nilai', icon: Table2 },
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Siswa" value={totals.students} />
        <Stat label="Pre-Test Selesai" value={`${preDone}/${totals.students}`} hint={totals.pre != null ? `Rata-rata: ${totals.pre}` : undefined} />
        <Stat label="Post-Test Selesai" value={`${postDone}/${totals.students}`} hint={totals.post != null ? `Rata-rata: ${totals.post}` : undefined} />
        <Stat
          label="Rata-rata N-Gain"
          value={totals.gain != null ? totals.gain.toFixed(2) : '-'}
          hint={totals.gain != null ? `Avg. durasi Explore: ${Math.round((totals.exploreAvg ?? 0) / 60)} mnt` : 'Belum ada data'}
        />
      </div>

      <Card title="Sebaran Kategori N-Gain">
        {preDone + postDone > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {(['Tinggi', 'Sedang', 'Rendah'] as const).map((cat) => (
              <div key={cat} className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{totals.cat[cat]}</p>
                <p className="text-sm text-slate-500">{cat}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada siswa yang menyelesaikan post-test.</p>
        )}
      </Card>

      <Card title="Progres per Modul">
        <div className="space-y-3">
          {s.byModule.map((m) => {
            const pct = totals.students ? Math.round((m.completed / totals.students) * 100) : 0;
            return (
              <div key={m.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{m.title}</span>
                  <span className="text-slate-500">
                    {m.completed}/{totals.students} selesai{m.avgScore != null ? ` · rata-rata skor ${m.avgScore}` : ''}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {!s.byModule.length && <p className="text-sm text-slate-500">Belum ada modul.</p>}
        </div>
      </Card>

      {s.classes.length > 1 && (
        <Card title="Per Kelas">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-slate-500">
                <tr><th className="py-2">Kelas</th><th>Siswa</th><th>Rata-rata Pre</th><th>Rata-rata Post</th><th>Rata-rata N-Gain</th></tr>
              </thead>
              <tbody>
                {s.classes.map((c) => (
                  <tr key={c.name} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{c.name}</td><td>{c.n}</td><td>{c.pre ?? '-'}</td><td>{c.post ?? '-'}</td><td>{c.gain ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="Jalan pintas">
        <div className="flex flex-wrap gap-2">
          {quickLinks.map(({ href, label, icon: I }) => (
            <Link key={href} href={href} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <I size={16} />{label}
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}