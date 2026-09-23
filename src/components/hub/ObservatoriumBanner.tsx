import Link from 'next/link';
import { ArrowRight, Telescope } from 'lucide-react';
import Reveal from '@/components/Reveal';

export default function ObservatoriumBanner() {
  return (
    <Reveal className="py-4">
      <Link href="/observatorium" className="group flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-surface-container to-surface-high/70 p-5 transition-transform hover:-translate-y-1 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary/20 text-secondary sm:h-14 sm:w-14"><Telescope size={26} /></span>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">Bonus • Kamera Bebas 3D</span>
            <h3 className="font-display text-xl font-bold text-primary sm:text-2xl">Observatorium 3D</h3>
            <p className="text-sm text-on-surface-variant sm:text-base">Terbang bebas, zoom dekat ke tiap planet, dan lihat rotasi &amp; revolusinya langsung!</p>
          </div>
        </div>
        <ArrowRight className="hidden shrink-0 text-secondary transition-transform group-hover:translate-x-1 sm:block" size={26} />
      </Link>
    </Reveal>
  );
}