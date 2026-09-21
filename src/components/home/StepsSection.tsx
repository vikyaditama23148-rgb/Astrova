'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, Telescope, Trophy } from 'lucide-react';
import Reveal from '@/components/Reveal';

const STEPS = [
  { n: 1, tag: 'Langkah 01', chip: 'Audio cerita', Icon: BookOpen, title: 'Belajar', cta: 'Buka kartu cerita', tone: 'text-secondary', ring: 'bg-secondary/20 shadow-[0_0_20px_rgba(64,219,216,0.3)]', tagCls: 'bg-secondary/15 text-secondary',
    text: 'Buka kartu cerita bergambar. Ada narasi suara yang ramah anak, jadi makin mudah memahami tata surya!' },
  { n: 2, tag: 'Langkah 02', chip: 'Lab simulasi', Icon: Telescope, title: 'Jelajah', cta: 'Masuk laboratorium', tone: 'text-primary-container', ring: 'bg-primary-container/20 shadow-[0_0_20px_rgba(255,201,60,0.35)]', tagCls: 'bg-primary-container text-on-primary', hi: true,
    text: 'Putar planet dengan jarimu, geser jam siang dan malam di Bumi, lalu hitung berat badanmu kalau berdiri di Mars atau Jupiter!' },
  { n: 3, tag: 'Langkah 03', chip: '⭐⭐⭐', Icon: Trophy, title: 'Uji Misi', cta: 'Buktikan kemampuanmu', tone: 'text-tertiary-container', ring: 'bg-tertiary-container/20 shadow-[0_0_20px_rgba(216,201,255,0.3)]', tagCls: 'bg-tertiary-container text-[#381385]',
    text: 'Pecahkan misi seru: seret, urutkan, dan cari fakta planet. Raih bintang sempurna untuk kelasmu!' },
];

export default function StepsSection() {
  const reduce = useReducedMotion();
  return (
    <section id="cara-belajar" className="relative scroll-mt-24 py-16" aria-labelledby="cara-h">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <span className="chip !bg-secondary/10 !text-secondary">Kurikulum Merdeka • Fase C</span>
        <h2 id="cara-h" className="mt-3 text-4xl font-bold text-primary lg:text-[42px] lg:leading-[48px]">Tiga Langkah Jadi Penjelajah</h2>
        <p className="mt-2 text-lg text-on-surface-variant">Dari rasa penasaran sampai jadi kapten antariksa cilik yang paham rotasi, revolusi, dan sifat planet!</p>
      </Reveal>

      {/* jalur misi: roket terbang dari langkah 1 ke 3 */}
      <div className="relative mb-6 hidden h-10 md:block" aria-hidden>
        <div className="absolute left-[16.6%] right-[16.6%] top-1/2 border-t-[3px] border-dashed border-white/25" />
        {['16.6%', '50%', '83.4%'].map((l, i) => (
          <span key={l} className="absolute top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary-container font-display text-sm font-bold text-on-primary" style={{ left: l }}>{i + 1}</span>
        ))}
        {!reduce && (
          <motion.span className="absolute top-0 text-2xl" initial={{ left: '16.6%' }} animate={{ left: ['16.6%', '83.4%'] }} transition={{ duration: 7, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }} style={{ rotate: 45, x: '-50%' }}>🚀</motion.span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12}>
            <article className={`group card-night flex h-full flex-col justify-between p-7 transition-all duration-300 hover:-translate-y-2 ${s.hi ? '!bg-surface-highest/80 shadow-[0_16px_40px_rgba(255,201,60,0.15)]' : ''}`}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${s.tagCls}`}>{s.tag}</span>
                  <span className="rounded-md bg-surface-highest px-2 py-1 text-xs font-extrabold text-on-surface">{s.chip}</span>
                </div>
                <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }} className={`grid h-14 w-14 place-items-center rounded-full ${s.ring} ${s.tone}`}><s.Icon size={30} /></motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">{s.n}. {s.title}</h3>
                  <p className="mt-1 text-lg leading-7 text-on-surface-variant">{s.text}</p>
                </div>
              </div>
              <Link href="/login" className={`mt-6 flex items-center justify-between font-display text-base font-bold ${s.tone}`}>
                <span className="group-hover:underline">{s.cta}</span><ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}