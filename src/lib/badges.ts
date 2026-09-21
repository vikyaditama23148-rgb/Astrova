import { starsFromScore } from '@/lib/stars';
import type { ModuleRow, ProgressRow } from '@/lib/types';

export interface Badge { id: string; emoji: string; title: string; desc: string; earned: boolean }

export function computeBadges(modules: ModuleRow[], progress: Record<string, ProgressRow>, preDone: boolean, postDone: boolean): Badge[] {
  const done = modules.filter((m) => progress[m.id]?.test_completed);
  const allDone = modules.length > 0 && done.length === modules.length;
  const threeStars = done.filter((m) => starsFromScore(progress[m.id].test_score) === 3).length;
  const totalExplore = Object.values(progress).reduce((s, p) => s + (p.time_spent_explore_seconds || 0), 0);
  return [
    { id: 'start', emoji: '🎒', title: 'Kadet Baru', desc: 'Menyelesaikan Misi Pemanasan (Pre-Test).', earned: preDone },
    { id: 'first', emoji: '🚀', title: 'Peluncuran Pertama', desc: 'Menyelesaikan satu modul.', earned: done.length >= 1 },
    { id: 'curious', emoji: '🔭', title: 'Si Rasa Ingin Tahu', desc: 'Menjelajah simulasi lebih dari 3 menit.', earned: totalExplore >= 180 },
    { id: 'star', emoji: '🌟', title: 'Bintang Emas', desc: 'Mendapat 3 bintang di satu modul.', earned: threeStars >= 1 },
    { id: 'explorer', emoji: '🏅', title: 'Astrova Explorer', desc: 'Menyelesaikan semua modul.', earned: allDone },
    { id: 'master', emoji: '👑', title: 'Kapten Antariksa', desc: 'Menyelesaikan Ujian Akhir (Post-Test).', earned: postDone },
  ];
}
