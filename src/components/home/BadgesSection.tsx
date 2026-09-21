import '../home.css';
import { Compass, Globe2, Lock, ShieldCheck, Star } from 'lucide-react';
import Reveal from '@/components/Reveal';

const BADGES = [
  { Icon: Compass, title: 'Kadet Baru', tier: 'Tingkat 1', text: 'Selesaikan Misi Pemanasan untuk meraih lencana pertamamu.', grad: 'from-secondary to-secondary-container', glow: 'shadow-[0_0_28px_rgba(64,219,216,0.5)]' },
  { Icon: Star, title: 'Bintang Emas', tier: 'Tingkat 2', text: 'Raih 3 bintang sempurna di salah satu modul.', grad: 'from-primary-container to-[#ff9d2d]', glow: 'shadow-[0_0_28px_rgba(255,201,60,0.55)]' },
  { Icon: Globe2, title: 'Astrova Explorer', tier: 'Tingkat 3', text: 'Tuntaskan semua modul dan jelajahi seluruh planet.', grad: 'from-[#65f8f4] to-[#3b7dff]', glow: 'shadow-[0_0_28px_rgba(101,248,244,0.45)]' },
  { Icon: ShieldCheck, title: 'Kapten Antariksa', tier: 'Gelar Tertinggi', text: 'Selesaikan Ujian Akhir dan jadilah kapten!', grad: 'from-tertiary-container to-[#8b6be6]', glow: 'shadow-[0_0_28px_rgba(216,201,255,0.4)]', locked: true },
];

export default function BadgesSection() {
  return (
    <section id="lencana" className="scroll-mt-24 py-16" aria-labelledby="badge-h">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <span className="chip !bg-secondary/10 !text-secondary">Pencapaian Kadet</span>
        <h2 id="badge-h" className="mt-3 text-4xl font-bold text-primary lg:text-[42px] lg:leading-[48px]">Kumpulkan 4 Lencana Kehormatan</h2>
        <p className="mt-2 text-lg text-on-surface-variant">Setiap kali kamu menyelesaikan misi, lencana akan menyala dan tersimpan di Markas Penjelajahmu!</p>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {BADGES.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.1}>
            <article className="badge-card card-night flex h-full flex-col items-center p-5 text-center transition-transform duration-300 hover:-translate-y-2">
              <div className="medal-wrap relative mb-4">
                <div className={`medal grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${b.grad} ${b.glow} ring-4 ring-white/20 text-[#1b1440] sm:h-24 sm:w-24`}><b.Icon size={40} strokeWidth={2.4} /></div>
                {b.locked && <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-surface-high ring-2 ring-white/30" aria-label="Terkunci"><Lock size={16} /></span>}
              </div>
              <h3 className="text-xl font-bold text-primary">{b.title}</h3>
              <span className="mt-1 text-xs font-extrabold uppercase tracking-wider text-secondary">{b.tier}</span>
              <p className="mt-2 text-sm leading-5 text-on-surface-variant sm:text-base sm:leading-6">{b.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}