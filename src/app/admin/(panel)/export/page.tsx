import { btnCls } from '@/components/admin/styles';
import { Card } from '@/components/admin/ui';

export const metadata = { title: 'Ekspor Data' };

export default function ExportPage() {
  const sheets: [string, string, string][] = [
    ['nilai', 'Nilai & N-Gain', 'Pre-test, post-test, N-Gain, kategori, durasi Explore, skor tiap modul.'],
    ['aktivitas', 'Aktivitas Modul', 'Status Learn/Explore/Test dan durasi Explore per siswa per modul.'],
    ['jawaban', 'Jawaban (raw)', 'Setiap percobaan menjawab, benar/salah, skor, hint, override.'],
    ['usability', 'Survei Usability', 'Rating emotikon 1–5 dan saran siswa.'],
  ];
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Ekspor Data Penelitian</h1>
      <Card title="Satu klik — semua data">
        <p className="mb-4 text-sm text-slate-600">Satu berkas Excel berisi 4 lembar (Nilai & N-Gain, Aktivitas Modul, Jawaban, Usability). Siap diimpor ke SPSS/Excel.</p>
        <a href="/api/admin/export?type=xlsx" className={btnCls()}>⬇ Unduh Excel (.xlsx)</a>
      </Card>
      <Card title="CSV per lembar">
        <ul className="divide-y divide-slate-100">
          {sheets.map(([k, t, d]) => (
            <li key={k} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{t}</p><p className="text-sm text-slate-600">{d}</p></div><a className={btnCls('ghost')} href={`/api/admin/export?type=csv&sheet=${k}`}>Unduh CSV</a></li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">CSV memakai UTF-8 dengan BOM dan pemisah koma. Di Excel berlokal Indonesia, gunakan Data → From Text/CSV bila kolom menyatu.</p>
      </Card>
    </>
  );
}