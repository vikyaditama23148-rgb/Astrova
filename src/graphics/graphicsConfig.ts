/**
 * Satu sumber kebenaran untuk kualitas grafis Observatorium 3D.
 * Semua angka yang memengaruhi performa (jumlah bintang, kehalusan bola
 * planet, resolusi render, dsb.) hidup DI SINI SAJA — komponen lain cukup
 * membaca satu objek profil ini, bukan menyebar `if (quality === 'high')`
 * ke banyak file.
 */
export type GraphicsQuality = 'easy' | 'normal' | 'high';

export interface GraphicsProfile {
  label: string;
  description: string;
  /** Batas device-pixel-ratio untuk <Canvas dpr={...}> — paling berpengaruh ke beban GPU. */
  dpr: [number, number];
  stars: { count: number; factor: number };
  /** Jumlah segmen bola: planet jauh (tampilan keseluruhan) vs. sedang difokuskan (dekat). */
  planetSegments: { far: number; near: number };
  sunSegments: number;
  orbitLineSegments: number;
  atmosphere: boolean;
  /** Opacity atmosfer dikalikan faktor ini (High sedikit lebih tebal/"glow"). */
  atmosphereBoost: number;
  antialias: boolean;
}

export const GRAPHICS_PROFILES: Record<GraphicsQuality, GraphicsProfile> = {
  easy: {
    label: 'Hemat',
    description: 'Mengutamakan performa pada perangkat dengan kemampuan terbatas.',
    dpr: [1, 1],
    stars: { count: 900, factor: 1.8 },
    planetSegments: { far: 20, near: 36 },
    sunSegments: 36,
    orbitLineSegments: 48,
    atmosphere: false,
    atmosphereBoost: 1,
    antialias: false,
  },
  normal: {
    label: 'Normal',
    description: 'Keseimbangan antara kualitas visual dan performa. Direkomendasikan untuk kebanyakan perangkat.',
    dpr: [1, 1.6],
    stars: { count: 2000, factor: 2.2 },
    planetSegments: { far: 32, near: 56 },
    sunSegments: 48,
    orbitLineSegments: 96,
    atmosphere: true,
    atmosphereBoost: 1,
    antialias: true,
  },
  high: {
    label: 'Tinggi',
    description: 'Kualitas visual lebih detail untuk perangkat dengan kemampuan grafis tinggi.',
    dpr: [1, 2],
    stars: { count: 3600, factor: 2.6 },
    planetSegments: { far: 48, near: 84 },
    sunSegments: 72,
    orbitLineSegments: 160,
    atmosphere: true,
    atmosphereBoost: 1.3,
    antialias: true,
  },
};

export const DEFAULT_QUALITY: GraphicsQuality = 'normal';
export const QUALITY_STORAGE_KEY = 'astrova:observatorium-quality';

export function getGraphicsProfile(q: GraphicsQuality): GraphicsProfile {
  return GRAPHICS_PROFILES[q] ?? GRAPHICS_PROFILES[DEFAULT_QUALITY];
}