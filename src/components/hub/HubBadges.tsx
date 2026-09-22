'use client';

import '@/components/home.css';
import { Award, Compass, Globe2, Lock, Rocket, ShieldCheck, Star, Telescope } from 'lucide-react';
import Reveal from '@/components/Reveal';
import type { Badge } from '@/lib/badges';

const ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  start: Compass, first: Rocket, curious: Telescope, star: Star, explorer: Globe2, master: ShieldCheck,
};
const GRAD: Record<string, string> = {
  start: 'from-secondary to-secondary-container', first: 'from-primary-container to-[#ff9d2d]', curious: 'from-[#65f8f4] to-[#3b7dff]',
  star: 'from-primary-fixed-dim to-primary-container', explorer: 'from-tertiary-container to-[#8b6be6]', master: 'from-[#ffe7e2] to-[#ff6b4a]',
};

export default function HubBadges({ badges }: { badges: Badge[] }) {
  const earned = badges.filter((b) => b.earned).length;
  return (
    <section id="lencana" className="scroll-mt-24 py-10" aria-labelledby="badge-h">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip !bg-secondary/10 !text-secondary"><Award size={15} className="mr-1 inline" /> Koleksi Lencana Penjelajah</span>
          <h2 id="badge-h" className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Lencana Penjelajah</h2>
          <p className="mt-1 text-lg text-on-surface-variant">Kumpulkan medali kehormatan sebagai bukti petualangan ilmiahmu!</p>
        </div>
        <span className="font-display text-base font-bold text-secondary">Total Didapat: {earned} / {badges.length}</span>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {badges.map((b, i) => {
          const Icon = ICON[b.id] ?? Star;
          return (
            <Reveal key={b.id} delay={i * 0.06}>
              <article className={`badge-card card-night flex h-full flex-col items-center p-5 text-center transition-transform duration-300 ${b.earned ? 'hover:-translate-y-2' : ''}`}>
                <div className="medal-wrap relative mb-3">
                  <div className={`medal grid h-16 w-16 place-items-center rounded-full text-[#1b1440] ring-4 ring-white/15 sm:h-20 sm:w-20 ${b.earned ? `bg-gradient-to-br ${GRAD[b.id]} shadow-[0_0_22px_rgba(255,201,60,0.35)]` : 'bg-surface-highest grayscale'}`}>
                    <Icon size={30} />
                  </div>
                  {!b.earned && <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-surface-high ring-2 ring-white/25" aria-label="Terkunci"><Lock size={14} /></span>}
                </div>
                <h3 className="font-display text-base font-bold text-primary sm:text-lg">{b.title}</h3>
                <p className="mt-1 text-xs leading-snug text-on-surface-variant sm:text-sm">{b.earned ? b.desc : `Terkunci: ${b.desc}`}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}