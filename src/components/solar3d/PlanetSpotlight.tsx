'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const Spot = dynamic(() => import('@/components/solar3d/SpotlightScene'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-indigo-200"><Loader2 className="animate-spin" size={26} /></div>,
});

/**
 * Planet 3D tunggal untuk sorotan "Misi Saat Ini" di Markas Penjelajah.
 * Berputar otomatis di tempat (tanpa drag) supaya tidak mengganggu gulir halaman.
 */
export default function PlanetSpotlight({ planetId, run }: { planetId: string; run: boolean }) {
  return (
    <div className="relative mx-auto aspect-square w-44 sm:w-48">
      <span className="spot-ring" aria-hidden><span className="spot-dot spot-dot-a" /><span className="spot-dot spot-dot-b" /></span>
      <Suspense fallback={<div className="grid h-full place-items-center text-indigo-200"><Loader2 className="animate-spin" size={26} /></div>}>
        <Spot planetId={planetId} run={run} />
      </Suspense>
    </div>
  );
}