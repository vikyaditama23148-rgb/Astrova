'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import PlanetCanvas from '@/components/PlanetCanvas';
import { starsFromScore } from '@/lib/stars';
import type { Badge } from '@/lib/badges';

export interface HubModule {
  id: string; title: string; description: string | null; planetId: string;
  learn: boolean; explore: boolean; test: boolean; score: number; locked: boolean;
}

function Phase({ done, label }: { done: boolean; label: string }) {
  return <span className={`chip ${done ? '!border-mint-400 !bg-mint-400/20 !text-mint-400' : ''}`}>{done ? '✓' : '○'} {label}</span>;
}

export default function HubView({ name, preDone, postDone, postOpen, modules, badges }: {
  name: string; preDone: boolean; postDone: boolean; postOpen: boolean; modules: HubModule[]; badges: Badge[];
}) {
  const doneCount = modules.filter((m) => m.test).length;
  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-2">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Halo, {name.split(' ')[0]}!</h1>
        <p className="mt-2 text-xl text-indigo-100">
          {!preDone ? 'Mulai dari Misi Pemanasan dulu ya, lalu semua planet akan terbuka.' : postDone ? 'Semua misi selesai. Kamu hebat!' : `${doneCount} dari ${modules.length} planet sudah kamu taklukkan.`}
        </p>
      </motion.section>

      <ol className="relative space-y-5 border-l-4 border-dashed border-white/20 pl-6 sm:pl-10">
        <li className="relative">
          <span className="absolute -left-[38px] top-6 grid h-8 w-8 place-items-center rounded-full bg-night-800 text-lg sm:-left-[54px]" aria-hidden>🎒</span>
          <div className="card-night flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Misi Pemanasan</h2>
              <p className="text-indigo-100/90">Soal singkat untuk melihat seberapa jauh kamu sudah tahu tentang Tata Surya.</p>
            </div>
            {preDone ? <span className="chip !border-mint-400 !text-mint-400">✓ Selesai</span> : <Link href="/pretest" className="btn btn-primary">Mulai</Link>}
          </div>
        </li>

        {modules.map((m, i) => (
          <motion.li key={m.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }} className="relative">
            <span className="absolute -left-[38px] top-8 h-6 w-6 rounded-full border-4 border-night-900 bg-sun-400 sm:-left-[50px]" aria-hidden />
            <div className={`card-night flex items-center gap-4 p-4 sm:gap-6 sm:p-5 ${m.locked ? 'opacity-60' : ''}`}>
              <div className="w-24 shrink-0 sm:w-32"><PlanetCanvas planetId={m.planetId} size={200} interactive={false} autoRotate={!m.locked} /></div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-semibold leading-tight">{m.title}</h2>
                {m.description && <p className="mt-1 text-indigo-100/90">{m.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Phase done={m.learn} label="Learn" /><Phase done={m.explore} label="Explore" /><Phase done={m.test} label="Test" />
                  {m.test && <span className="ml-1 flex" aria-label={`${starsFromScore(m.score)} bintang`}>{[1, 2, 3].map((k) => <Star key={k} size={22} className={k <= starsFromScore(m.score) ? 'fill-sun-400 text-sun-400' : 'text-white/25'} />)}</span>}
                </div>
              </div>
              {m.locked ? <Lock aria-label="Terkunci" className="shrink-0 text-white/60" /> : (
                <Link href={`/module/${m.id}`} className="btn btn-primary shrink-0">{m.test ? 'Ulas' : m.learn ? 'Lanjut' : 'Mulai'}</Link>
              )}
            </div>
          </motion.li>
        ))}

        <li className="relative">
          <span className="absolute -left-[38px] top-6 grid h-8 w-8 place-items-center rounded-full bg-night-800 text-lg sm:-left-[54px]" aria-hidden>👑</span>
          <div className={`card-night flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center ${postOpen || postDone ? '' : 'opacity-60'}`}>
            <div>
              <h2 className="text-2xl font-semibold">Ujian Akhir Kapten</h2>
              <p className="text-indigo-100/90">{postOpen || postDone ? 'Buktikan semua yang sudah kamu pelajari!' : 'Selesaikan semua planet dulu untuk membukanya.'}</p>
            </div>
            {postDone ? <span className="chip !border-mint-400 !text-mint-400">✓ Selesai</span> : postOpen ? <Link href="/posttest" className="btn btn-primary">Mulai</Link> : <Lock aria-label="Terkunci" className="text-white/60" />}
          </div>
        </li>
      </ol>

      <section className="mt-12" aria-labelledby="badge-h">
        <h2 id="badge-h" className="mb-4 text-3xl font-semibold">Lencana Penjelajah</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((b) => (
            <li key={b.id} className={`card-night p-4 text-center ${b.earned ? '' : 'opacity-40 grayscale'}`}>
              <p className="text-4xl" aria-hidden>{b.emoji}</p>
              <p className="mt-1 font-display text-lg font-semibold leading-tight">{b.title}</p>
              <p className="mt-1 text-xs text-indigo-100/80">{b.earned ? b.desc : `Terkunci: ${b.desc}`}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
