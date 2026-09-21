'use client';

import './solar.css';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import RobotMascot from '@/components/RobotMascot';
import { PLANET_MAP } from '@/lib/planets';

const C = 320; // pusat viewBox 640x640

const ORBITS = [
  { id: 'merkurius', r: 76, size: 6, dur: 14, start: 20 },
  { id: 'venus', r: 108, size: 9, dur: 22, start: 140 },
  { id: 'bumi', r: 140, size: 10, dur: 30, start: 250 },
  { id: 'mars', r: 172, size: 8, dur: 42, start: 60 },
  { id: 'jupiter', r: 212, size: 21, dur: 70, start: 300 },
  { id: 'saturnus', r: 250, size: 15, dur: 100, start: 190 },
  { id: 'uranus', r: 278, size: 11, dur: 130, start: 100 },
  { id: 'neptunus', r: 302, size: 10, dur: 160, start: 330 },
];

const FILL: Record<string, [string, string]> = {
  matahari: ['#fff3b0', '#ff8a00'], merkurius: ['#d6d0c8', '#5e5a57'], venus: ['#f7e7b4', '#c9974a'], bumi: ['#8fd0ff', '#1748a8'],
  mars: ['#f0a878', '#8e3b24'], jupiter: ['#f6e9d6', '#b5763f'], saturnus: ['#f6ebcb', '#a88b54'], uranus: ['#d9f8f8', '#5fbfcc'], neptunus: ['#7fa3ff', '#1b3ba8'],
};

const FACT: Record<string, string> = {
  matahari: 'Bintang pusat Tata Surya. Cahayanya menghangatkan semua planet!',
  merkurius: 'Tahunnya cuma 88 hari. Paling cepat mengelilingi Matahari!',
  venus: 'Planet terpanas di Tata Surya, sekitar 464°C!',
  bumi: 'Rumah kita! Ada air, udara, dan kehidupan.',
  mars: 'Si Planet Merah. Gunung berapinya tinggi banget!',
  jupiter: 'Planet terbesar, punya badai raksasa berumur ratusan tahun.',
  saturnus: 'Cincinnya cantik, terbuat dari kepingan es dan batu.',
  uranus: 'Berputar miring, seperti sedang rebahan!',
  neptunus: 'Paling jauh dari Matahari. Anginnya super kencang!',
};

export default function SolarSystemHero() {
  const reduce = !!useReducedMotion();
  const [sel, setSel] = useState<string | null>(null);
  const [run, setRun] = useState(!reduce);
  useEffect(() => { setRun(!reduce); }, [reduce]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg?.pauseAnimations) return;
    if (sel || !run) svg.pauseAnimations(); else svg.unpauseAnimations();
  }, [sel, run]);

  const pick = (id: string) => setSel((s) => (s === id ? null : id));
  const onKey = (id: string) => (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(id); } };
  const info = sel ? PLANET_MAP[sel] : null;

  return (
    <div className="solar relative mx-auto w-full max-w-[600px]" data-paused={sel ? 'true' : 'false'} data-run={run ? 'true' : 'false'} data-force={run && reduce ? 'true' : 'false'}>
      <span className="comet" aria-hidden />
      <svg ref={svgRef} viewBox="0 0 640 640" className="h-auto w-full overflow-visible" role="group" aria-label="Tata Surya yang bergerak. Ketuk planet untuk berkenalan.">
        <defs>
          {Object.entries(FILL).map(([id, [a, b]]) => (
            <radialGradient key={id} id={`sg-${id}`} cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>
          ))}
          <radialGradient id="sun-halo"><stop offset="0" stopColor="#ffc93c" stopOpacity="0.9" /><stop offset="1" stopColor="#ff8a00" stopOpacity="0" /></radialGradient>
        </defs>

        {ORBITS.map((o) => <circle key={o.id} cx={C} cy={C} r={o.r} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" strokeDasharray="3 8" />)}
        <circle cx={C} cy={C} r={192} fill="none" stroke="#9b8f7a" strokeOpacity="0.55" strokeWidth="3" strokeDasharray="1 11" strokeLinecap="round"><title>Sabuk asteroid</title></circle>

        {/* Matahari */}
        <g className="planet" role="button" tabIndex={0} aria-label="Matahari" onClick={() => pick('matahari')} onKeyDown={onKey('matahari')}>
          <circle className="sun-glow" cx={C} cy={C} r="84" fill="url(#sun-halo)" />
          <circle cx={C} cy={C} r="44" fill="url(#sg-matahari)" />
          {sel === 'matahari' && <circle className="sel-ring" cx={C} cy={C} r="54" fill="none" stroke="#ffc93c" strokeWidth="3" strokeDasharray="6 6" />}
          <circle className="focus-ring" cx={C} cy={C} r="58" fill="none" stroke="#3dd9d6" strokeWidth="3" />
        </g>

        {ORBITS.map((o) => {
          const p = PLANET_MAP[o.id];
          return (
            <g key={o.id} className="orbit" style={{ ['--d' as string]: `${o.dur}s`, animationDelay: `-${(o.dur * o.start) / 360}s` }}>
              <g className="planet" transform={`translate(${C + o.r} ${C})`} role="button" tabIndex={0} aria-label={p.name} onClick={() => pick(o.id)} onKeyDown={onKey(o.id)}>
                <circle r={o.size + 14} fill="transparent" />
                {o.id === 'saturnus' && <ellipse rx={o.size * 2.1} ry={o.size * 0.62} fill="none" stroke="#e8d5a3" strokeWidth="3.2" opacity="0.9" transform="rotate(-24)" />}
                <circle r={o.size} fill={`url(#sg-${o.id})`} />
                {o.id === 'jupiter' && <><rect x={-o.size * 0.9} y={-3} width={o.size * 1.8} height="2.6" rx="1.3" fill="#8b4e2b" opacity=".45" /><rect x={-o.size * 0.8} y={4} width={o.size * 1.6} height="2.2" rx="1.1" fill="#8b4e2b" opacity=".35" /></>}
                {o.id === 'saturnus' && <path d={`M ${-o.size * 2.05} ${o.size * 0.55} A ${o.size * 2.1} ${o.size * 0.62} -24 0 0 ${o.size * 2.05} ${-o.size * 0.55}`} fill="none" stroke="#f6ebcb" strokeWidth="3.2" opacity="0.95" transform="rotate(0)" />}
                {o.id === 'bumi' && (
                  <g><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="5s" repeatCount="indefinite" /><circle cx="19" cy="0" r="3" fill="#e9e6df" /></g>
                )}
                {sel === o.id && <circle className="sel-ring" r={o.size + 9} fill="none" stroke="#ffc93c" strokeWidth="3" strokeDasharray="6 6" />}
                <circle className="focus-ring" r={o.size + 12} fill="none" stroke="#3dd9d6" strokeWidth="3" />
              </g>
            </g>
          );
        })}
      </svg>

      <motion.div className="pointer-events-none absolute -top-2 right-2 select-none text-4xl" aria-hidden
        animate={reduce ? undefined : { y: [0, -12, 0], rotate: [12, 4, 12] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>🚀</motion.div>

      <button type="button" onClick={() => setRun((r) => !r)} aria-pressed={run} className="btn btn-ghost btn-sm absolute -bottom-2 right-0 z-10 !min-h-10">
        {run ? <><Pause size={16} /> Jeda animasi</> : <><Play size={16} /> Putar animasi</>}
      </button>

      <div className="absolute -bottom-2 left-0 flex max-w-[92%] items-end gap-3 sm:-bottom-4 sm:-left-2">
        <RobotMascot size={84} />
        <AnimatePresence mode="wait">
          <motion.div key={sel ?? 'hi'} initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="relative mb-3 rounded-2xl border-[2.5px] border-[#1b1440] bg-paper px-4 py-2.5 text-[#1b1440] shadow-[4px_4px_0_#ffc93c]" role="status">
            <span className="absolute -left-2 bottom-4 h-3.5 w-3.5 rotate-45 border-b-[2.5px] border-l-[2.5px] border-[#1b1440] bg-paper" />
            {info ? (<><p className="font-display text-lg font-semibold leading-tight">{info.name}</p><p className="text-sm font-semibold leading-snug">{FACT[info.id]}</p></>) : (<p className="font-display text-base font-semibold leading-snug">Halo! Ketuk planetnya untuk kenalan 👆</p>)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}