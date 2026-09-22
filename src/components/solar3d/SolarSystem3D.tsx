'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2, Move3d, Pause, Play } from 'lucide-react';
import RobotMascot from '@/components/RobotMascot';
import { FACT_3D, PLANETS_3D } from '@/components/solar3d/data';

// three.js hanya boleh berjalan di browser.
const Scene = dynamic(() => import('@/components/solar3d/Scene'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-indigo-200"><Loader2 className="animate-spin" size={28} /></div>
  ),
});

const NAMES: Record<string, string> = { matahari: 'Matahari', ...Object.fromEntries(PLANETS_3D.map((p) => [p.id, p.name])) };

export default function SolarSystem3D() {
  const reduce = !!useReducedMotion();
  const [sel, setSel] = useState<string | null>(null);
  const [run, setRun] = useState(!reduce);

  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="relative aspect-square overflow-hidden rounded-[28px] border-2 border-white/15 bg-gradient-to-b from-[#0b1030] to-[#131a45] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <Suspense fallback={<div className="grid h-full place-items-center text-indigo-200"><Loader2 className="animate-spin" size={28} /></div>}>
          <Scene selected={sel} running={run} onSelect={(id) => setSel(id || null)} />
        </Suspense>

        <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold text-indigo-100 backdrop-blur-sm">
          <Move3d size={14} /> Geser untuk putar tampilan • Cubit untuk zoom
        </span>
        <button type="button" onClick={() => setRun((r) => !r)} aria-pressed={run}
          className="btn btn-ghost btn-sm absolute right-3 top-3 !min-h-9 !bg-black/40 backdrop-blur-sm">
          {run ? <><Pause size={15} /> Jeda</> : <><Play size={15} /> Putar</>}
        </button>
      </div>

      <div className="mt-3 flex max-w-full items-end gap-3">
        <RobotMascot size={72} />
        <AnimatePresence mode="wait">
          <motion.div key={sel ?? 'hi'} initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="relative mb-1 min-w-0 rounded-2xl border-[2.5px] border-[#1b1440] bg-paper px-4 py-2.5 text-[#1b1440] shadow-[4px_4px_0_#ffc93c]" role="status">
            <span className="absolute -left-2 bottom-4 h-3.5 w-3.5 rotate-45 border-b-[2.5px] border-l-[2.5px] border-[#1b1440] bg-paper" />
            {sel ? (<><p className="font-display text-lg font-semibold leading-tight">{NAMES[sel]}</p><p className="text-sm font-semibold leading-snug">{FACT_3D[sel]}</p></>) : (
              <p className="font-display text-base font-semibold leading-snug">Halo! Ketuk planet 3D-nya untuk kenalan 👆</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}