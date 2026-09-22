'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Award, Compass, Crown, PartyPopper, Pause, Play, Radio, Rocket, Sparkles, Star } from 'lucide-react';
import PlanetSpotlight from '@/components/solar3d/PlanetSpotlight';
import RobotMascot from '@/components/RobotMascot';
import Reveal from '@/components/Reveal';
import { PLANET_MAP } from '@/lib/planets';
import type { HubModule } from '@/components/HubView';

export type Spotlight =
  | { kind: 'pretest' }
  | { kind: 'module'; m: HubModule; phase: 1 | 2 | 3 }
  | { kind: 'posttest' }
  | { kind: 'done' };

const TIP: Record<Spotlight['kind'], (label: string) => string> = {
  pretest: () => 'Yuk, mulai dari Misi Pemanasan dulu supaya semua planet terbuka!',
  module: (label) => `Giliran ${label} menantimu! Ketuk planetnya untuk lihat dari dekat, ya.`,
  posttest: () => 'Kamu sudah menaklukkan semua planet! Saatnya Ujian Akhir Kapten 👑',
  done: () => 'Semua misi selesai. Kamu benar-benar Kapten Antariksa sejati! 🎉',
};

export default function HubHero({ name, totalStars, badgeCount, totalBadges, spotlight }: {
  name: string; totalStars: number; badgeCount: number; totalBadges: number; spotlight: Spotlight;
}) {
  const reduce = !!useReducedMotion();
  const [run, setRun] = useState(!reduce);
  const first = name.trim().split(' ')[0] || name;

  const planetId = spotlight.kind === 'module' ? (PLANET_MAP[spotlight.m.planetId] ? spotlight.m.planetId : 'bumi') : null;
  const label = spotlight.kind === 'module' ? spotlight.m.title : spotlight.kind === 'pretest' ? 'Misi Pemanasan' : spotlight.kind === 'posttest' ? 'Ujian Akhir Kapten' : 'Semua Misi';
  const href = spotlight.kind === 'module' ? `/module/${spotlight.m.id}` : spotlight.kind === 'pretest' ? '/pretest' : spotlight.kind === 'posttest' ? '/posttest' : '/hub';
  const cta = spotlight.kind === 'module' ? (spotlight.m.learn ? 'Lanjutkan Misi Sekarang' : 'Mulai Misi Sekarang') : spotlight.kind === 'done' ? null : 'Lanjutkan Misi Sekarang';

  return (
    <section className="grid gap-8 pb-10 pt-6 lg:grid-cols-12 lg:items-center">
      {/* Kiri: sapaan + AstroBot + statistik */}
      <div className="flex flex-col items-start gap-5 lg:col-span-7">
        <Reveal immediate>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-high/90 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-secondary backdrop-blur-md">
            <Radio size={14} className="animate-pulse" /> Sinyal Radar Aktif
          </span>
        </Reveal>
        <Reveal immediate delay={0.08}>
          <h1 className="text-4xl font-bold leading-tight text-primary sm:text-5xl">
            Halo, <span className="text-primary-container drop-shadow-[0_0_20px_rgba(255,201,60,0.5)]">{first}</span>! 🧑‍🚀
          </h1>
        </Reveal>
        <Reveal immediate delay={0.16}><p className="text-lg font-medium text-on-surface-variant sm:text-xl">{TIP[spotlight.kind](label)}</p></Reveal>

        <Reveal immediate delay={0.24} className="flex flex-wrap items-center gap-2.5">
          <span className="chip !bg-surface-high/90 !text-primary"><Star size={18} className="fill-primary-container text-primary-container" /> {totalStars} Bintang Terkumpul</span>
          <span className="chip !bg-surface-high/90"><Award size={18} className="text-secondary" /> {badgeCount} / {totalBadges} Lencana</span>
          {spotlight.kind === 'module' && <span className="chip !bg-surface-high/90"><Compass size={18} className="text-primary-container" /> Misi: {label}</span>}
        </Reveal>

        <Reveal immediate delay={0.32} className="w-full rounded-2xl bg-surface-low/95 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <RobotMascot size={56} wave={false} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-base font-bold text-secondary">AstroBot Sahabat Misi</span>
                <span className="rounded-full bg-primary-container/20 px-2 py-0.5 text-xs font-bold text-primary">Pendamping Belajar</span>
              </div>
              <p className="mt-0.5 text-base leading-snug text-on-surface">“{TIP[spotlight.kind](label)}”</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Kanan: sorotan misi saat ini */}
      <Reveal immediate delay={0.2} y={0} className="lg:col-span-5">
        <div className="relative overflow-hidden rounded-3xl bg-surface-container/80 p-7 text-center shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-container/10 via-transparent to-surface-container-lowest" aria-hidden />
          <div className="relative z-10 flex flex-col items-center">
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary-container px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-on-primary shadow-md">
              <Sparkles size={15} /> Misi Saat Ini
            </span>

            <div className="relative my-2">
              {planetId ? <PlanetSpotlight planetId={planetId} run={run} /> : (
                <div className="grid h-44 w-44 place-items-center sm:h-48 sm:w-48">
                  {spotlight.kind === 'pretest' && <Rocket size={72} className="text-secondary" />}
                  {spotlight.kind === 'posttest' && <Crown size={76} className="text-primary-container drop-shadow-[0_0_18px_rgba(255,201,60,0.5)]" />}
                  {spotlight.kind === 'done' && <PartyPopper size={76} className="text-primary-container" />}
                </div>
              )}
            </div>

            <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">{label}</h2>
            {spotlight.kind === 'module' && (
              <p className="mt-1 max-w-xs text-base text-on-surface-variant">
                {spotlight.phase === 1 ? 'Tahap Belajar: kenali ceritanya dulu' : spotlight.phase === 2 ? 'Tahap Jelajah: coba simulasinya' : 'Tahap Uji Misi: buktikan kemampuanmu'}
              </p>
            )}

            {cta && (
              <Link href={href} className="btn btn-primary mt-6 w-full !min-h-14 !text-lg">
                {cta} <Rocket size={20} />
              </Link>
            )}
            {planetId && (
              <button type="button" onClick={() => setRun((r) => !r)} aria-pressed={run} className="btn btn-ghost btn-sm mt-3 !min-h-9">
                {run ? <><Pause size={14} /> Jeda putaran</> : <><Play size={14} /> Putar planet</>}
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}