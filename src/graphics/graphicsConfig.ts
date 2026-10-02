/**
 * Satu sumber kebenaran untuk kualitas grafis Observatorium 3D.
 * Semua angka yang memengaruhi performa DAN TAMPILAN (cahaya, atmosfer,
 * bloom, awan, dsb.) hidup DI SINI SAJA — komponen lain cukup membaca satu
 * objek profil ini, bukan menyebar `if (quality === 'high')` ke banyak file.
 *
 * Prinsip pembeda visual (bukan sekadar angka geometri lebih besar):
 * EASY   = Clean + Lightweight    → cahaya datar, tanpa atmosfer/bloom/awan
 * NORMAL = Balanced + Educational → cahaya lembut, atmosfer 1 lapis, awan tipis
 * HIGH   = Immersive + Cinematic  → cahaya kaya (sisi terang/gelap jelas),
 *          atmosfer 2 lapis + rim light, bloom Matahari, awan lebih rapat,
 *          bayangan cincin Saturnus
 */
export type GraphicsQuality = 'easy' | 'normal' | 'high';

export interface GraphicsProfile {
  label: string;
  description: string;
  dpr: [number, number];
  antialias: boolean;

  stars: { count: number; factor: number };

  planetSegments: { far: number; near: number };
  sunSegments: number;
  orbitLineSegments: number;

  /** Pencahayaan — paling berdampak ke "rasa" dimensional planet. */
  ambientIntensity: number;
  sunLightIntensity: number;
  /** Cahaya pengisi lembut dari arah berlawanan Matahari (0 = mati). Memunculkan sisi gelap tidak gelap total, tapi tetap ada kontras terminator. */
  rimLightIntensity: number;

  /** Atmosfer: 1 lapis (Normal) vs 2 lapis bertingkat + lebih tebal (High). */
  atmosphereLayers: 0 | 1 | 2;
  atmosphereOpacityMul: number;

  /** Bloom palsu murah: lapisan glow tambahan di sekitar Matahari (tanpa post-processing). */
  sunGlowLayers: { scale: number; opacity: number }[];

  /** Lapisan awan Bumi, berputar independen dari permukaan. */
  cloudLayer: boolean;
  cloudOpacity: number;

  /** Bayangan cincin Saturnus jatuh ke permukaannya (shadow map, HANYA Saturnus — scope kecil & aman). */
  ringShadow: boolean;

  /** Interpolasi kamera: lebih cepat (Easy) → lebih sinematik/lambat (High), tapi tetap responsif. */
  cameraLerp: { pos: number; look: number };

  emissiveBase: number;
}

export const GRAPHICS_PROFILES: Record<GraphicsQuality, GraphicsProfile> = {
  easy: {
    label: 'Hemat',
    description: 'Mengutamakan performa pada perangkat dengan kemampuan terbatas.',
    dpr: [1, 1],
    antialias: false,
    stars: { count: 800, factor: 1.6 },
    planetSegments: { far: 20, near: 32 },
    sunSegments: 32,
    orbitLineSegments: 48,
    ambientIntensity: 0.55,
    sunLightIntensity: 230,
    rimLightIntensity: 0,
    atmosphereLayers: 0,
    atmosphereOpacityMul: 0,
    sunGlowLayers: [{ scale: 2.1, opacity: 0.14 }],
    cloudLayer: false,
    cloudOpacity: 0,
    ringShadow: false,
    cameraLerp: { pos: 0.08, look: 0.1 },
    emissiveBase: 0.03,
  },
  normal: {
    label: 'Normal',
    description: 'Keseimbangan antara kualitas visual dan performa. Direkomendasikan untuk kebanyakan perangkat.',
    dpr: [1, 1.6],
    antialias: true,
    stars: { count: 2200, factor: 2.2 },
    planetSegments: { far: 30, near: 52 },
    sunSegments: 48,
    orbitLineSegments: 96,
    ambientIntensity: 0.32,
    sunLightIntensity: 260,
    rimLightIntensity: 0.22,
    atmosphereLayers: 1,
    atmosphereOpacityMul: 1,
    sunGlowLayers: [{ scale: 2.4, opacity: 0.16 }],
    cloudLayer: true,
    cloudOpacity: 0.45,
    ringShadow: false,
    cameraLerp: { pos: 0.05, look: 0.06 },
    emissiveBase: 0.04,
  },
  high: {
    label: 'Tinggi',
    description: 'Kualitas visual lebih detail untuk perangkat dengan kemampuan grafis tinggi.',
    dpr: [1, 2],
    antialias: true,
    stars: { count: 4200, factor: 2.6 },
    planetSegments: { far: 40, near: 72 },
    sunSegments: 64,
    orbitLineSegments: 160,
    ambientIntensity: 0.2,
    sunLightIntensity: 300,
    rimLightIntensity: 0.55,
    atmosphereLayers: 2,
    atmosphereOpacityMul: 1.7,
    sunGlowLayers: [
      { scale: 2.3, opacity: 0.22 },
      { scale: 3.2, opacity: 0.1 },
    ],
    cloudLayer: true,
    cloudOpacity: 0.72,
    ringShadow: true,
    cameraLerp: { pos: 0.035, look: 0.045 },
    emissiveBase: 0.07,
  },
};

export const DEFAULT_QUALITY: GraphicsQuality = 'normal';
export const QUALITY_STORAGE_KEY = 'astrova:observatorium-quality';

export function getGraphicsProfile(q: GraphicsQuality): GraphicsProfile {
  return GRAPHICS_PROFILES[q] ?? GRAPHICS_PROFILES[DEFAULT_QUALITY];
}