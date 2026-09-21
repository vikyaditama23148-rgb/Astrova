import Link from 'next/link';
import { BarChart3, BookOpen, Bot, Download, HelpCircle, LogOut, Table2, Users } from 'lucide-react';
import { adminLogout } from '@/app/admin/actions';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/students', label: 'Siswa', icon: Users },
  { href: '/admin/modules', label: 'Modul', icon: BookOpen },
  { href: '/admin/questions', label: 'Bank Soal', icon: HelpCircle },
  { href: '/admin/gradebook', label: 'Buku Nilai', icon: Table2 },
  { href: '/admin/astrobot', label: 'AstroBot', icon: Bot },
  { href: '/admin/export', label: 'Ekspor Data', icon: Download },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-800 lg:flex">
      <aside className="bg-slate-900 p-4 text-slate-100 lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0">
        <div className="mb-4 flex items-center justify-between lg:mb-6 lg:block">
          <p className="text-lg font-semibold">🛰️ Astrova</p>
          <p className="text-xs text-slate-400">Mission Control · {me.name}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Menu admin">
          {NAV.map(({ href, label, icon: I }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-800"><I size={17} />{label}</Link>
          ))}
        </nav>
        <form action={adminLogout} className="mt-3 lg:mt-8"><button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"><LogOut size={17} />Keluar</button></form>
      </aside>
      <main className="min-w-0 flex-1 space-y-6 p-4 lg:p-8">{children}</main>
    </div>
  );
}
