'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PlanetCanvas from '@/components/PlanetCanvas';
import { PLANET_MAP, type PlanetHotspot } from '@/lib/planets';

const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const kindLabel = { bintang: 'Bintang', dalam: 'Planet dalam', luar: 'Planet luar' } as const;

export default function PlanetViewer({ planets, compact = false }: { planets: string[]; compact?: boolean }) {
  const ids = useMemo(() => planets.filter((id) => PLANET_MAP[id]), [planets]);
  const [current, setCurrent] = useState(ids[0] ?? 'bumi');
  const [active, setActive] = useState<PlanetHotspot | null>(null);
  const p = PLANET_MAP[current] ?? PLANET_MAP['bumi'];

  const pick = (id: string) => { setCurrent(id); setActive(null); };

  return (
    <div className="space-y-4">
      {ids.length > 1 && (
        <div role="tablist" aria-label="Pilih planet" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {ids.map((id) => (
            <button key={id} role="tab" aria-selected={id === current} onClick={() => pick(id)}
              className={`btn btn-sm shrink-0 ${id === current ? 'btn-primary' : 'btn-ghost'}`}>
              <span aria-hidden>{PLANET_MAP[id].emoji}</span> {PLANET_MAP[id].name}
            </button>
          ))}
        </div>
      )}

      <div className={`grid gap-4 ${compact ? '' : 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'}`}>
        <div className="card-night p-3">
          <PlanetCanvas key={p.id} planetId={p.id} size={compact ? 300 : 380} hotspots={p.hotspots} activeHotspot={active?.id} onHotspot={setActive} showControls />
          <p className="mt-2 text-center text-sm text-indigo-100/80">👆 Geser planet ke segala arah. Ketuk titik kuning untuk fakta.</p>
        </div>

        <div className="card-night flex flex-col gap-3 p-5">
          <div>
            <span className="chip">{kindLabel[p.kind]}</span>
            <h3 className="mt-2 font-display text-3xl font-semibold">{p.name}</h3>
            <p className="mt-1 text-lg leading-relaxed text-indigo-50">{p.summary}</p>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-white/8 p-3"><dt className="text-indigo-200/80">Lebar</dt><dd className="font-display text-lg">{nf.format(p.diameterEarth)}× Bumi</dd></div>
            <div className="rounded-2xl bg-white/8 p-3"><dt className="text-indigo-200/80">Jarak dari Matahari</dt><dd className="font-display text-lg">{p.distanceMkm ? `${nf.format(p.distanceMkm)} juta km` : 'Pusat'}</dd></div>
            <div className="rounded-2xl bg-white/8 p-3"><dt className="text-indigo-200/80">Suhu rata-rata</dt><dd className="font-display text-lg">{nf.format(p.avgTempC)}°C</dd></div>
            <div className="rounded-2xl bg-white/8 p-3"><dt className="text-indigo-200/80">Bulan</dt><dd className="font-display text-base leading-tight">{p.moons}</dd></div>
          </dl>
          <div className="min-h-[92px]" aria-live="polite">
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border-2 border-sun-400 bg-sun-400/10 p-4">
                  <p className="font-display text-lg text-sun-300">💡 {active.label}</p>
                  <p className="mt-1 text-base">{active.text}</p>
                </motion.div>
              ) : (
                <motion.p key="tip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border-2 border-dashed border-white/20 p-4 text-indigo-100/80">
                  Belum ada titik yang diketuk. Ayo cari fakta seru tentang {p.name}!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
