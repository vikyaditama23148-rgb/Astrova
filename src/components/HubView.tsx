'use client';

import HubHero, { type Spotlight } from '@/components/hub/HubHero';
import ObservatoriumBanner from '@/components/hub/ObservatoriumBanner';
import HubBadges from '@/components/hub/HubBadges';
import MissionPath from '@/components/hub/MissionPath';
import { starsFromScore } from '@/lib/stars';
import type { Badge } from '@/lib/badges';

export interface HubModule {
  id: string; title: string; description: string | null; planetId: string;
  learn: boolean; explore: boolean; test: boolean; score: number; locked: boolean;
}

/** Tentukan apa yang disorot sebagai "Misi Saat Ini" di hero. */
function pickSpotlight(preDone: boolean, postDone: boolean, postOpen: boolean, modules: HubModule[]): Spotlight {
  if (!preDone) return { kind: 'pretest' };
  const current = modules.find((m) => !m.locked && !m.test);
  if (current) {
    const phase: 1 | 2 | 3 = !current.learn ? 1 : !current.explore ? 2 : 3;
    return { kind: 'module', m: current, phase };
  }
  if (postDone) return { kind: 'done' };
  if (postOpen) return { kind: 'posttest' };
  // Semua modul selesai tapi post-test belum terbuka (kasus tepi): tampilkan modul terakhir untuk diulas.
  return modules.length ? { kind: 'module', m: modules[modules.length - 1], phase: 3 } : { kind: 'pretest' };
}

export default function HubView({ name, preDone, postDone, postOpen, modules, badges }: {
  name: string; preDone: boolean; postDone: boolean; postOpen: boolean; modules: HubModule[]; badges: Badge[];
}) {
  const totalStars = modules.reduce((sum, m) => sum + (m.test ? starsFromScore(m.score) : 0), 0);
  const badgeCount = badges.filter((b) => b.earned).length;
  const spotlight = pickSpotlight(preDone, postDone, postOpen, modules);

  return (
    <div className="relative mx-auto w-full max-w-[1100px] px-4 pb-28 sm:px-6">
      <HubHero name={name} totalStars={totalStars} badgeCount={badgeCount} totalBadges={badges.length} spotlight={spotlight} />
      <ObservatoriumBanner />
      <MissionPath preDone={preDone} modules={modules} postOpen={postOpen} postDone={postDone} />
      <HubBadges badges={badges} />
    </div>
  );
}