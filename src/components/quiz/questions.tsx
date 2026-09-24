'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import DayNightSim from '@/components/explore/DayNightSim';
import MoonPhaseSim from '@/components/explore/MoonPhaseSim';
import PlanetCanvas from '@/components/PlanetCanvas';
import type { PublicQuestion } from '@/lib/types';

export interface QProps {
  q: PublicQuestion;
  setAnswer: (a: Record<string, any> | null) => void;
  disabled?: boolean;
  avatar: string;
}

/* ---------- Pilihan cerita / pilihan ganda ---------- */
export function ChoiceQuestion({ q, setAnswer, disabled }: QProps) {
  const [sel, setSel] = useState<string | null>(null);
  const isMC = q.type === 'multiple_choice';
  const options: { id: string; text: string; emoji?: string }[] = isMC ? q.data.options ?? [] : q.data.choices ?? [];
  return (
    <div className="space-y-4">
      {!isMC && q.data.story && <p className="card-night p-4 text-lg italic">{q.data.story}</p>}
      <div role="radiogroup" className="grid gap-3">
        {options.map((o, i) => {
          const on = sel === o.id;
          return (
            <motion.button
              key={o.id} type="button" role="radio" aria-checked={on} disabled={disabled} whileTap={{ scale: 0.98 }}
              onClick={() => { setSel(o.id); setAnswer(isMC ? { optionId: o.id } : { choiceId: o.id }); }}
              className={`flex min-h-[60px] items-center gap-3 rounded-2xl border-[3px] px-4 py-3 text-left text-lg font-semibold transition ${on ? 'border-sun-400 bg-sun-400/20' : 'border-white/20 bg-white/8 hover:bg-white/15'}`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-lg ${on ? 'bg-sun-400 text-night-900' : 'bg-white/15'}`}>{o.emoji ?? String.fromCharCode(65 + i)}</span>
              <span>{o.text}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Simulasi: geser slider ---------- */
export function SimulationQuestion({ q, setAnswer, disabled, avatar }: QProps) {
  const sl = q.data.slider ?? { min: 0, max: 24, step: 0.5, initial: 12 };
  const [v, setV] = useState<number>(sl.initial ?? sl.min);
  useEffect(() => { setAnswer({ value: v }); }, [v]); // eslint-disable-line react-hooks/exhaustive-deps
  if (q.data.sim === 'day_night') {
    return <DayNightSim value={v} onChange={(x) => !disabled && setV(x)} avatar={avatar} quiet min={sl.min} max={sl.max} step={sl.step} />;
  }
  if (q.data.sim === 'moon_phases') {
    return <MoonPhaseSim value={v} onChange={(x) => !disabled && setV(x)} quiet min={sl.min} max={sl.max} step={sl.step} />;
  }
  return (
    <div className="card-night p-5">
      <p className="mb-3 font-display text-2xl text-sun-300">{sl.label ?? 'Nilai'}: {v} {sl.unit ?? ''}</p>
      <input type="range" className="big-range" min={sl.min} max={sl.max} step={sl.step} value={v} disabled={disabled} onChange={(e) => setV(Number(e.target.value))} />
    </div>
  );
}

/* ---------- Mengurutkan ---------- */
export function OrderingQuestion({ q, setAnswer, disabled }: QProps) {
  const items: { id: string; label: string; emoji?: string }[] = q.data.items ?? [];
  const [order, setOrder] = useState<string[]>(items.map((i) => i.id));
  useEffect(() => { setAnswer({ order }); }, [order]); // eslint-disable-line react-hooks/exhaustive-deps
  const map = Object.fromEntries(items.map((i) => [i.id, i]));
  return (
    <div className="mx-auto max-w-md">
      <p className="mb-2 text-center font-display text-lg text-aqua-300">⬆️ {q.data.top_label ?? 'Awal'}</p>
      <Reorder.Group axis="y" values={order} onReorder={(v) => !disabled && setOrder(v)} className="space-y-3">
        {order.map((id, idx) => (
          <Reorder.Item key={id} value={id} whileDrag={{ scale: 1.05, boxShadow: '0 12px 30px rgba(0,0,0,.5)' }}
            className="no-select flex min-h-[64px] cursor-grab touch-none items-center gap-3 rounded-2xl border-[3px] border-sun-400 bg-paper px-4 py-3 text-night-900 active:cursor-grabbing">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-night-900 font-display text-lg text-sun-400">{idx + 1}</span>
            <span className="text-2xl" aria-hidden>{map[id]?.emoji}</span>
            <span className="flex-1 font-display text-xl font-semibold">{map[id]?.label}</span>
            <span aria-hidden className="text-2xl text-night-900/50">⠿</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <p className="mt-2 text-center font-display text-lg text-aqua-300">⬇️ {q.data.bottom_label ?? 'Akhir'}</p>
    </div>
  );
}

/* ---------- Seret & letakkan ---------- */
export function DragDropQuestion({ q, setAnswer, disabled }: QProps) {
  const items: { id: string; label: string; emoji?: string }[] = q.data.items ?? [];
  const cats: { id: string; label: string; emoji?: string }[] = q.data.categories ?? [];
  const [map, setMap] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  useEffect(() => { setAnswer(Object.keys(map).length === items.length ? { mapping: map } : null); }, [map]); // eslint-disable-line react-hooks/exhaustive-deps

  const assign = (itemId: string, catId: string | null) => {
    if (disabled) return;
    setMap((m) => { const n = { ...m }; if (catId) n[itemId] = catId; else delete n[itemId]; return n; });
    setPicked(null); setOver(null);
  };
  const zoneAt = (x: number, y: number) => {
    const el = document.elementsFromPoint(x, y).find((e) => (e as HTMLElement).dataset?.zone) as HTMLElement | undefined;
    return el?.dataset.zone ?? null;
  };

  const chip = (it: (typeof items)[number]) => (
    <motion.button
      key={it.id} type="button" layout drag dragSnapToOrigin dragMomentum={false} whileDrag={{ scale: 1.12, zIndex: 50 }}
      onDrag={(e) => { const ev = e as PointerEvent; if (ev.clientX != null) setOver(zoneAt(ev.clientX, ev.clientY)); }}
      onDragEnd={(e) => { const ev = e as PointerEvent; const z = ev.clientX != null ? zoneAt(ev.clientX, ev.clientY) : null; setOver(null); if (z) assign(it.id, z); }}
      onTap={() => setPicked((p) => (p === it.id ? null : it.id))}
      className={`no-select touch-none flex min-h-[52px] items-center gap-2 rounded-full border-[3px] px-4 font-display text-lg font-semibold ${picked === it.id ? 'border-coral-500 bg-sun-300 text-night-900' : 'border-sun-400 bg-paper text-night-900'}`}
      aria-pressed={picked === it.id}
    ><span aria-hidden>{it.emoji}</span>{it.label}</motion.button>
  );

  const tray = items.filter((i) => !map[i.id]);
  return (
    <div className="space-y-5">
      <div className="card-night p-4">
        <p className="mb-2 text-sm text-indigo-100/80">Seret kartu ke kelompok yang tepat, atau ketuk kartu lalu ketuk kelompoknya.</p>
        <div className="flex min-h-[64px] flex-wrap gap-3">
          {tray.length ? tray.map((it) => chip(it)) : <p className="self-center text-mint-400">Semua kartu sudah dipasang! 🎉</p>}
        </div>
      </div>
      <div className={`grid gap-4 ${cats.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {cats.map((c) => (
          <div key={c.id} data-zone={c.id} role="button" tabIndex={0}
            onClick={() => picked && assign(picked, c.id)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && picked) assign(picked, c.id); }}
            className={`min-h-[170px] rounded-3xl border-4 border-dashed p-4 transition ${over === c.id || (picked && 'border-sun-400') ? 'border-sun-400 bg-sun-400/15' : 'border-white/30 bg-white/5'}`}>
            <p className="pointer-events-none mb-3 text-center font-display text-xl font-semibold">{c.emoji} {c.label}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {items.filter((i) => map[i.id] === c.id).map((it) => (
                <span key={it.id} className="pointer-events-auto"><button type="button" onClick={(e) => { e.stopPropagation(); assign(it.id, null); }} className="flex min-h-[44px] items-center gap-1 rounded-full bg-paper px-3 font-display text-lg font-semibold text-night-900" aria-label={`Keluarkan ${it.label}`}>{it.emoji} {it.label} <span aria-hidden className="text-night-900/50">✕</span></button></span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Hotspot: cari fakta yang salah ---------- */
export function HotspotQuestion({ q, setAnswer, disabled }: QProps) {
  const spots: { id: string; x: number; y: number; label: string }[] = q.data.hotspots ?? [];
  const [sel, setSel] = useState<string | null>(null);
  const pick = (id: string) => { if (disabled) return; setSel(id); setAnswer({ hotspotId: id }); };
  return (
    <div className="grid items-center gap-5 md:grid-cols-2">
      <div className="card-night relative mx-auto w-full max-w-[360px] p-2">
        <div className="relative">
          <PlanetCanvas planetId={q.data.planet ?? 'mars'} size={360} interactive={false} autoRotate={false} initialRotation={0.9} />
          {spots.map((s, i) => (
            <button key={s.id} type="button" onClick={() => pick(s.id)} aria-label={`Fakta nomor ${i + 1}`} aria-pressed={sel === s.id}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className={`absolute -ml-5 -mt-5 grid h-10 w-10 place-items-center rounded-full border-4 border-white font-display text-lg font-bold shadow-lg ${sel === s.id ? 'bg-coral-500 text-white' : 'bg-sun-400 text-night-900'}`}>{i + 1}</button>
          ))}
        </div>
      </div>
      <ol className="space-y-3">
        {spots.map((s, i) => (
          <li key={s.id}>
            <button type="button" disabled={disabled} onClick={() => pick(s.id)} aria-pressed={sel === s.id}
              className={`flex w-full min-h-[56px] items-center gap-3 rounded-2xl border-[3px] px-4 py-2 text-left text-lg font-semibold ${sel === s.id ? 'border-coral-500 bg-coral-500/20' : 'border-white/20 bg-white/8 hover:bg-white/15'}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sun-400 font-display text-night-900">{i + 1}</span>{s.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}