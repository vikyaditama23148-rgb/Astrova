'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lightbulb, Rocket } from 'lucide-react';
import AudioReader from '@/components/learn/AudioReader';
import type { LearnCard } from '@/lib/types';

export default function LearnCarousel({ cards, done, onComplete }: { cards: LearnCard[]; done: boolean; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  if (!cards.length) return <p className="card-night p-6 text-center">Materi belum tersedia.</p>;
  const c = cards[i];
  const last = i === cards.length - 1;

  const go = (d: number) => {
    const n = i + d;
    if (n < 0 || n >= cards.length) return;
    setDir(d); setI(n);
  };
  const narration = [c.title + '.', c.body, c.analogy ?? ''].join(' ');

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative min-h-[380px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.article
            key={i} custom={dir}
            initial={{ opacity: 0, x: dir * 60, rotate: dir * 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: dir * -60, rotate: dir * -2 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.35}
            onDragEnd={(_, info) => { if (info.offset.x < -70) go(1); else if (info.offset.x > 70) go(-1); }}
            className="card-paper touch-pan-y p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-3">
              <motion.span key={`e${i}`} initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }} className="text-6xl" aria-hidden>{c.emoji ?? '⭐'}</motion.span>
              <AudioReader text={narration} audioUrl={c.audio_url} />
            </div>
            {c.image_url && <img src={c.image_url} alt="" className="mx-auto mt-4 max-h-48 rounded-2xl object-contain" />}
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{c.title}</h2>
            <p className="mt-3 text-xl leading-relaxed">{c.body}</p>
            {c.analogy && (
              <div className="mt-5 flex gap-3 rounded-2xl border-[3px] border-dashed border-[#1b1440]/40 bg-white/70 p-4">
                <Lightbulb className="mt-0.5 shrink-0 text-sun-700" />
                <p className="text-lg font-semibold leading-snug">{c.analogy}</p>
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" className="btn btn-ghost" onClick={() => go(-1)} disabled={i === 0} aria-label="Kartu sebelumnya"><ChevronLeft /> Kembali</button>
        <div className="flex items-center gap-2" aria-label={`Kartu ${i + 1} dari ${cards.length}`}>
          {cards.map((_, k) => <span key={k} className={`h-3 rounded-full transition-all ${k === i ? 'w-8 bg-sun-400' : 'w-3 bg-white/30'}`} />)}
        </div>
        {last ? (
          <button type="button" className="btn btn-primary" onClick={onComplete}><Rocket size={20} /> {done ? 'Ke Explore' : 'Selesai Belajar'}</button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => go(1)} aria-label="Kartu berikutnya">Lanjut <ChevronRight /></button>
        )}
      </div>
    </div>
  );
}
