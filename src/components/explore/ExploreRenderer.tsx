'use client';

import { useState } from 'react';
import DayNightSim from '@/components/explore/DayNightSim';
import PlanetViewer from '@/components/explore/PlanetViewer';
import SpaceCalculator from '@/components/explore/SpaceCalculator';
import type { ExploreConfig } from '@/lib/types';

/** Merender simulasi berdasarkan explore_config.type (dipakai di fase Explore dan popup Hint). */
export default function ExploreRenderer({ config, avatar, compact }: { config: ExploreConfig | null | undefined; avatar?: string; compact?: boolean }) {
  const [hour, setHour] = useState(6);
  if (!config) return <p className="card-night p-6 text-center">Simulasi belum diatur untuk modul ini.</p>;
  switch (config.type) {
    case 'planet_viewer':
      return <PlanetViewer planets={config.planets} compact={compact} />;
    case 'day_night':
      return <DayNightSim value={hour} onChange={setHour} avatar={avatar} />;
    case 'space_calculator':
      return <SpaceCalculator planets={'planets' in config ? config.planets : undefined} />;
    default:
      return <p className="card-night p-6 text-center">Jenis simulasi tidak dikenal.</p>;
  }
}
