'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CALC_PLANETS, PLANET_MAP } from '@/lib/planets';
import PlanetCanvas from '@/components/PlanetCanvas';

const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

function formatAge(years: number) {
  if (years >= 1) return `${nf.format(years)} tahun`;
  const days = years * 365.25;
  return `${nf.format(Math.max(1, Math.round(days)))} hari`;
}

export default function SpaceCalculator({ planets }: { planets?: string[] }) {
  const [weight, setWeight] = useState(35);
  const [age, setAge] = useState(10);
  const list = useMemo(() => {
    const base = planets?.length ? planets.map((id) => PLANET_MAP[id]).filter((p) => p && p.kind !== 'bintang') : CALC_PLANETS;
    return base.length ? base : CALC_PLANETS;
  }, [planets]);
  const maxW = Math.max(...list.map((p) => weight * p.gravity), 1);

  const num = (v: string, lo: number, hi: number, fallback: number) => {
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
  };

  return (
    <div className="space-y-4">
      <div className="card-night grid gap-4 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-display text-lg">⚖️ Beratmu di Bumi (kg)</span>
          <input type="number" inputMode="decimal" min={10} max={150} value={weight} onChange={(e) => setWeight(num(e.target.value, 0, 150, weight))}
            className="mt-2 h-14 w-full rounded-2xl border-2 border-white/25 bg-white/10 px-4 text-2xl font-bold text-white" />
          <input type="range" className="big-range mt-4" min={10} max={80} step={1} value={Math.min(80, weight)} onChange={(e) => setWeight(Number(e.target.value))} aria-label="Berat badan" />
        </label>
        <label className="block">
          <span className="font-display text-lg">🎂 Umurmu (tahun)</span>
          <input type="number" inputMode="decimal" min={1} max={100} value={age} onChange={(e) => setAge(num(e.target.value, 0, 100, age))}
            className="mt-2 h-14 w-full rounded-2xl border-2 border-white/25 bg-white/10 px-4 text-2xl font-bold text-white" />
          <input type="range" className="big-range mt-4" min={5} max={15} step={1} value={Math.min(15, Math.max(5, age))} onChange={(e) => setAge(Number(e.target.value))} aria-label="Umur" />
        </label>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((p) => {
          const w = weight * p.gravity;
          const a = age / p.periodYears;
          return (
            <li key={p.id} className="card-night flex items-center gap-3 p-3">
              <div className="w-[72px] shrink-0"><PlanetCanvas planetId={p.id} size={120} interactive={false} autoRotate={false} initialRotation={0.9} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <span className="text-xs text-indigo-100/70">gravitasi {nf2.format(p.gravity)}× Bumi</span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-aqua-400 to-sun-400" initial={false} animate={{ width: `${Math.max(4, (w / maxW) * 100)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
                </div>
                <p className="mt-1 text-lg font-bold"><span className="text-sun-300">{nf.format(w)} kg</span> <span className="text-sm font-semibold text-indigo-100/80">· umur {formatAge(a)}</span></p>
                <p className="text-xs text-indigo-100/70">1 tahun = {p.periodYears < 1 ? `${nf.format(p.periodYears * 365.25)} hari Bumi` : `${nf.format(p.periodYears)} tahun Bumi`}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-center text-sm text-indigo-100/70">Angka di atas adalah perkiraan timbangan di permukaan planet. Massa tubuhmu tetap sama, hanya tarikan gravitasinya yang berbeda.</p>
    </div>
  );
}
