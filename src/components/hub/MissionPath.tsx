'use client';

import Link from 'next/link';
import { Check, Crown, Lock, RefreshCcw, Star } from 'lucide-react';
import PlanetCanvas from '@/components/PlanetCanvas';
import Reveal from '@/components/Reveal';
import { starsFromScore } from '@/lib/stars';
import type { HubModule } from '@/components/HubView';

function Marker({ children, tone }: { children: React.ReactNode; tone: 'done' | 'active' | 'locked' | 'idle' }) {
  const cls = tone === 'done' ? 'bg-secondary-container text-on-secondary-container' : tone === 'active' ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(255,201,60,0.55)]' : tone === 'locked' ? 'bg-surface-highest text-on-surface-variant' : 'bg-surface-high text-on-surface';
  return <div className={`absolute left-6 top-8 z-10 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full sm:left-1/2 ${cls}`}>{children}</div>;
}

function Side({ i, children }: { i: number; children: React.ReactNode }) {
  // desktop: kartu berselang-seling kiri/kanan dari garis tengah; mobile: selalu di kanan garis
  const right = i % 2 === 0;
  return <div className={`ml-14 w-full sm:ml-0 sm:w-[calc(50%-2.25rem)] ${right ? 'sm:mr-auto' : 'sm:ml-auto'}`}>{children}</div>;
}

function PhasePill({ done, active, icon, label }: { done: boolean; active?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span className={`flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${done ? 'bg-secondary-container/25 text-secondary' : active ? 'bg-secondary text-on-secondary shadow-md' : 'bg-surface-high text-on-surface-variant'}`}>
      {done ? <Check size={13} /> : icon} {label}
    </span>
  );
}

export function PretestNode({ i, done }: { i: number; done: boolean }) {
  return (
    <Reveal delay={i * 0.05} className="relative">
      <Marker tone={done ? 'done' : 'active'}>{done ? <Check size={18} /> : <span className="text-lg">🎒</span>}</Marker>
      <Side i={i}>
        <div className="card-night flex flex-col gap-2.5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">Tahap 00 • Pemanasan</span>
            {done && <span className="flex items-center gap-1 rounded-full bg-secondary-container/20 px-2.5 py-0.5 text-xs font-bold text-secondary"><Check size={13} /> Selesai</span>}
          </div>
          <h3 className="font-display text-xl font-bold text-primary">Misi Pemanasan</h3>
          <p className="text-on-surface-variant">Soal singkat untuk melihat seberapa jauh kamu sudah tahu tentang Tata Surya.</p>
          <div className="flex justify-end pt-1">{!done && <Link href="/pretest" className="btn btn-primary btn-sm">Mulai</Link>}</div>
        </div>
      </Side>
    </Reveal>
  );
}

export function ModuleNode({ i, m }: { i: number; m: HubModule }) {
  const tone = m.locked ? 'locked' : m.test ? 'done' : (m.learn || m.explore) ? 'active' : 'idle';
  const stars = m.test ? starsFromScore(m.score) : 0;
  return (
    <Reveal delay={i * 0.05} className="relative">
      <Marker tone={tone}>{m.locked ? <Lock size={16} /> : m.test ? <Check size={18} /> : <span className="h-2.5 w-2.5 rounded-full bg-current" />}</Marker>
      <Side i={i}>
        <div className={`card-night flex flex-col gap-3 p-5 ${m.locked ? 'opacity-55' : ''} ${tone === 'active' ? '!bg-surface-highest/85 shadow-[0_10px_30px_rgba(255,201,60,0.12)]' : ''}`}>
          {tone === 'active' && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-on-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-on-primary" /> Misi Berlangsung
            </span>
          )}
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"><PlanetCanvas planetId={m.planetId} size={130} interactive={false} autoRotate={!m.locked} /></div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-secondary">Planet {String(i).padStart(2, '0')}</span>
              <h3 className="truncate font-display text-xl font-bold text-primary">{m.title}</h3>
              {m.description && <p className="truncate text-sm text-on-surface-variant">{m.description}</p>}
            </div>
            {stars > 0 && (
              <div className="flex shrink-0 items-center gap-0.5" aria-label={`${stars} bintang`}>
                {[1, 2, 3].map((k) => <Star key={k} size={16} className={k <= stars ? 'fill-primary-container text-primary-container' : 'text-white/20'} />)}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <PhasePill done={m.learn} icon={<span className="text-[13px]">📖</span>} label="Belajar" />
            <PhasePill done={m.explore} active={m.learn && !m.explore} icon={<span className="text-[13px]">🔭</span>} label="Jelajah" />
            <PhasePill done={m.test} active={m.explore && !m.test} icon={<span className="text-[13px]">🏆</span>} label="Uji Misi" />
          </div>
          <div className="flex justify-end">
            {m.locked ? <span className="text-sm font-bold text-on-surface-variant">Terkunci 🔒</span> : (
              <Link href={`/module/${m.id}`} className="btn btn-primary btn-sm w-full sm:w-auto">
                {m.test ? <><RefreshCcw size={15} /> Ulas Modul</> : m.learn ? 'Lanjut Jelajah' : 'Mulai Belajar'}
              </Link>
            )}
          </div>
        </div>
      </Side>
    </Reveal>
  );
}

export function PosttestNode({ i, done, open }: { i: number; done: boolean; open: boolean }) {
  const tone = done ? 'done' : open ? 'active' : 'locked';
  return (
    <Reveal delay={i * 0.05} className="relative">
      <Marker tone={tone}>{done ? <Check size={18} /> : <Crown size={17} />}</Marker>
      <Side i={i}>
        <div className={`card-night flex flex-col gap-2.5 p-5 ${!done && !open ? 'opacity-55' : ''}`}>
          <span className="w-fit rounded-full bg-tertiary-container/25 px-3 py-1 text-xs font-bold text-tertiary-container">Ujian Kelulusan Kapten</span>
          <h3 className="font-display text-xl font-bold text-primary">Ujian Akhir Kapten</h3>
          <p className="text-on-surface-variant">{open || done ? 'Buktikan semua yang sudah kamu pelajari!' : 'Selesaikan semua planet dulu untuk membukanya.'}</p>
          <div className="flex justify-end pt-1">
            {done ? <span className="chip !border-none !bg-secondary-container/20 !text-secondary">✓ Selesai</span> : open ? <Link href="/posttest" className="btn btn-primary btn-sm">Mulai</Link> : <span className="text-sm font-bold text-on-surface-variant">Terkunci 🔒</span>}
          </div>
        </div>
      </Side>
    </Reveal>
  );
}

export default function MissionPath({ preDone, modules, postOpen, postDone }: { preDone: boolean; modules: HubModule[]; postOpen: boolean; postDone: boolean }) {
  return (
    <section className="scroll-mt-24 py-10" aria-labelledby="path-h">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <span className="chip !bg-secondary/10 !text-secondary">Peta Petualangan Belajar</span>
        <h2 id="path-h" className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Jalur Misi Penjelajah Kosmik</h2>
        <p className="mt-1 text-lg text-on-surface-variant">Selesaikan tiap planet secara bertahap untuk membuka gerbang Ujian Kelulusan Kapten.</p>
      </Reveal>

      <div className="relative mx-auto max-w-4xl">
        <div className="absolute bottom-0 left-6 top-0 w-0.5 border-l-2 border-dashed border-white/15 sm:left-1/2" aria-hidden />
        <div className="flex flex-col gap-6">
          <PretestNode i={0} done={preDone} />
          {modules.map((m, i) => <ModuleNode key={m.id} i={i + 1} m={m} />)}
          <PosttestNode i={modules.length + 1} done={postDone} open={postOpen} />
        </div>
      </div>
    </section>
  );
}