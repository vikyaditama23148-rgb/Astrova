'use client';

import dynamic from 'next/dynamic';
import { Suspense, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2, Orbit, Pause, Play, RotateCw, X } from 'lucide-react';
import PlanetCanvas from '@/components/PlanetCanvas';
import { PLANETS_3D } from '@/components/solar3d/data';
import { getPlanet, PLANETS, type PlanetHotspot } from '@/lib/planets';

const Scene = dynamic(() => import('@/components/solar3d/ObservatoriumScene'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-indigo-200"><Loader2 className="animate-spin" size={30} /></div>,
});

const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const DOCK = [PLANETS[0], ...PLANETS.slice(1)]; // matahari + 8 planet, urutan asli

export default function Observatorium() {
  const [focusId, setFocusId] = useState<string | null>(null);
  const [showOrbit, setShowOrbit] = useState(false);
  const [running, setRunning] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<PlanetHotspot | null>(null);
  const controlsRef = useRef<any>(null);

  const info = focusId ? getPlanet(focusId) : null;
  const pick = (id: string) => { setFocusId((cur) => (cur === id ? null : id)); setShowOrbit(false); setActiveHotspot(null); };
  const back = () => { setFocusId(null); setShowOrbit(false); setActiveHotspot(null); };

  return (
    <div className="relative h-[calc(100dvh-5rem)] w-full overflow-hidden bg-gradient-to-b from-[#070b1f] to-[#131a45]">
      <Suspense fallback={<div className="grid h-full place-items-center text-indigo-200"><Loader2 className="animate-spin" size={30} /></div>}>
        <Scene
          focusId={focusId} showOrbit={showOrbit} running={running} activeHotspot={activeHotspot?.id ?? null}
          onPickPlanet={pick} onHotspot={setActiveHotspot} controlsRef={controlsRef}
        />
      </Suspense>

      {/* Bilah atas */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
        <span className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/45 px-3.5 py-2 text-sm font-bold text-indigo-100 backdrop-blur-sm sm:text-base">
          🔭 Observatorium 3D
        </span>
        <div className="pointer-events-auto flex items-center gap-2">
          <button type="button" onClick={() => setRunning((r) => !r)} aria-pressed={running} className="btn btn-ghost btn-sm !min-h-9 !bg-black/45 backdrop-blur-sm">
            {running ? <><Pause size={15} /> Jeda</> : <><Play size={15} /> Putar</>}
          </button>
          {focusId && (
            <button type="button" onClick={() => setShowOrbit((s) => !s)} aria-pressed={showOrbit} className="btn btn-ghost btn-sm !min-h-9 !bg-black/45 backdrop-blur-sm">
              {showOrbit ? <><RotateCw size={15} /> Revolusi: Nyala</> : <><Orbit size={15} /> Lihat Revolusi</>}
            </button>
          )}
        </div>
      </div>

      {!focusId && (
        <p className="pointer-events-none absolute left-1/2 top-14 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-center text-xs font-bold text-indigo-100 backdrop-blur-sm sm:top-16 sm:text-sm">
          Geser untuk memutar tampilan • Cubit atau gulir untuk zoom • Ketuk planet untuk menjelajah dekat
        </p>
      )}

      {/* Panel info planet terfokus */}
      <AnimatePresence>
        {info && (
          <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-3 bottom-24 z-10 mx-auto max-w-md rounded-3xl border-2 border-white/15 bg-[#0e1226]/92 p-4 backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:left-4 sm:max-w-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-secondary">{info.kind === 'bintang' ? 'Bintang' : info.kind === 'dalam' ? 'Planet Dalam' : 'Planet Luar'}</span>
                <h2 className="font-display text-2xl font-bold text-primary">{info.emoji} {info.name}</h2>
              </div>
              <button type="button" onClick={back} className="btn btn-ghost btn-sm !min-h-9 !px-2.5" aria-label="Kembali ke tata surya"><ArrowLeft size={16} /></button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-indigo-100">{info.summary}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white/8 p-2"><dt className="text-indigo-200/70">Lebar</dt><dd className="font-display text-sm font-bold">{nf.format(info.diameterEarth)}× Bumi</dd></div>
              <div className="rounded-xl bg-white/8 p-2"><dt className="text-indigo-200/70">Suhu rata-rata</dt><dd className="font-display text-sm font-bold">{nf.format(info.avgTempC)}°C</dd></div>
              <div className="rounded-xl bg-white/8 p-2"><dt className="text-indigo-200/70">Jarak dari Matahari</dt><dd className="font-display text-sm font-bold">{info.distanceMkm ? `${nf.format(info.distanceMkm)} jt km` : 'Pusat'}</dd></div>
              <div className="rounded-xl bg-white/8 p-2"><dt className="text-indigo-200/70">Bulan</dt><dd className="font-display text-xs font-bold leading-tight">{info.moons}</dd></div>
            </dl>
            {activeHotspot && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-xl border-2 border-sun-400/60 bg-sun-400/10 p-2.5">
                <p className="font-display text-sm font-bold text-sun-300">💡 {activeHotspot.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-indigo-100">{activeHotspot.text}</p>
              </motion.div>
            )}
            {!activeHotspot && info.hotspots.length > 0 && (
              <p className="mt-3 text-xs text-indigo-200/70">✨ Ketuk titik kuning yang berkedip di permukaan planet untuk fakta menarik.</p>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Dock pemilih planet */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-8 sm:px-4">
        <div className="mx-auto flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          {DOCK.map((p) => (
            <button key={p.id} type="button" onClick={() => pick(p.id)} aria-pressed={focusId === p.id}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl border-2 px-2.5 py-2 transition ${focusId === p.id ? 'border-primary-container bg-primary-container/15' : 'border-white/15 bg-black/35 hover:bg-black/50'}`}>
              <div className="h-9 w-9"><PlanetCanvas planetId={p.id} size={90} interactive={false} autoRotate={focusId !== p.id} /></div>
              <span className="whitespace-nowrap text-[11px] font-bold text-indigo-100">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}