import Link from 'next/link';
import { Award, Compass, Globe2, GraduationCap, Rocket, User } from 'lucide-react';

const NAV: [string, string][] = [['#atas', 'Penjelajahan'], ['#planet', 'Daftar Planet'], ['#cara-belajar', 'Cara Belajar'], ['#lencana', 'Lencana']];
const TABS = [
  { href: '#atas', label: 'Jelajah', Icon: Compass }, { href: '#planet', label: 'Planet', Icon: Globe2 },
  { href: '#cara-belajar', label: 'Misi', Icon: Rocket }, { href: '#lencana', label: 'Bintang', Icon: Award },
];

export function HomeHeader() {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface-lowest/80 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:h-20 lg:px-10">
        <a href="#atas" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-on-primary shadow-[0_0_16px_rgba(255,201,60,0.35)]" aria-hidden><Globe2 size={22} /></span>
          <span className="flex flex-col">
            <span className="font-display text-xl font-bold leading-none text-primary">Astrova</span>
            <span className="mt-1 hidden text-[11px] font-extrabold uppercase leading-none tracking-wider text-secondary sm:block">Penjelajah IPAS 5</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Menu utama">
          {NAV.map(([href, label], i) => (
            <a key={href} href={href} className={`rounded-full px-4 py-1.5 font-display text-base font-semibold transition-all ${i === 0 ? 'bg-surface-high text-secondary shadow-[0_0_12px_rgba(64,219,216,0.2)]' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}>{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/admin/login" className="hidden items-center gap-1.5 text-sm font-bold text-on-surface-variant underline-offset-4 hover:text-secondary hover:underline sm:inline-flex"><GraduationCap size={17} /> Masuk guru / peneliti</Link>
          <Link href="/admin/login" className="inline-flex items-center gap-1 rounded-full bg-surface-high px-3 py-1.5 text-sm font-bold text-on-surface sm:hidden"><GraduationCap size={16} /> Masuk Guru</Link>
          <Link href="/login" aria-label="Masuk siswa" className="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary shadow-[0_0_8px_rgba(255,235,196,0.3)] transition-transform hover:scale-110"><User size={18} /></Link>
        </div>
      </div>
    </header>
  );
}

export function HomeTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-surface-lowest/90 backdrop-blur-xl md:hidden" aria-label="Navigasi cepat">
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, Icon }) => (
          <li key={href}><a href={href} className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-xs font-bold text-on-surface-variant active:text-secondary"><Icon size={22} />{label}</a></li>
        ))}
      </ul>
    </nav>
  );
}