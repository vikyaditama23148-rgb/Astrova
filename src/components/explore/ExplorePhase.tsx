'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Timer } from 'lucide-react';
import ExploreRenderer from '@/components/explore/ExploreRenderer';
import type { ExploreConfig } from '@/lib/types';

const BEAT = 10; // detik per heartbeat

/** Fase Explore + Activity Logger: mencatat detik aktif (tab terlihat) ke time_spent_explore_seconds. */
export default function ExplorePhase({
  moduleId, config, avatar, done, initialSeconds, onComplete,
}: { moduleId: string; config: ExploreConfig | null; avatar: string; done: boolean; initialSeconds: number; onComplete: () => void }) {
  const [session, setSession] = useState(0);
  const pending = useRef(0);
  const need = config?.min_seconds ?? 20;

  useEffect(() => {
    const flush = (keepalive = false) => {
      const s = Math.min(30, Math.round(pending.current));
      if (s <= 0) return;
      pending.current -= s;
      fetch('/api/progress', {
        method: 'POST', keepalive, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, action: 'explore_heartbeat', seconds: s }),
      }).catch(() => { pending.current += s; });
    };
    const tick = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setSession((x) => x + 1);
      pending.current += 1;
      if (pending.current >= BEAT) flush();
    }, 1000);
    const onHide = () => { if (document.visibilityState === 'hidden') flush(true); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', () => flush(true));
    return () => { clearInterval(tick); document.removeEventListener('visibilitychange', onHide); flush(true); };
  }, [moduleId]);

  const ready = done || session >= need;
  return (
    <div className="space-y-5">
      {config && 'instruction' in config && config.instruction && (
        <p className="card-night px-5 py-3 text-center text-lg">🧭 {config.instruction}</p>
      )}
      <ExploreRenderer config={config} avatar={avatar} />
      <div className="card-night flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
        <p className="flex items-center gap-2 text-indigo-100/90"><Timer size={20} /> {ready ? 'Kamu sudah menjelajah dengan hebat!' : `Jelajahi ${Math.max(0, need - session)} detik lagi untuk membuka Test.`}</p>
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={onComplete}><CheckCircle2 size={20} /> {done ? 'Ke Test' : 'Selesai Menjelajah'}</button>
      </div>
      <span className="sr-only">Total waktu eksplorasi tercatat {initialSeconds + session} detik</span>
    </div>
  );
}
