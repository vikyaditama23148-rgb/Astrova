export interface P3D {
  id: string; name: string; color: string; emissive?: string; size: number; distance: number; speed: number; rotSpeed: number; rings?: boolean; tilt?: number;
}

/** Jarak & ukuran diperkecil dan dirapatkan (bukan skala nyata) supaya enak dilihat & disentuh. */
export const PLANETS_3D: P3D[] = [
  { id: 'merkurius', name: 'Merkurius', color: '#8c8c8c', size: 0.34, distance: 3.6, speed: 0.9, rotSpeed: 0.4 },
  { id: 'venus', name: 'Venus', color: '#e8c97a', size: 0.5, distance: 4.8, speed: 0.72, rotSpeed: 0.15 },
  { id: 'bumi', name: 'Bumi', color: '#2e7fd8', size: 0.54, distance: 6.1, speed: 0.6, rotSpeed: 1.1, tilt: 0.41 },
  { id: 'mars', name: 'Mars', color: '#c1502e', size: 0.42, distance: 7.4, speed: 0.5, rotSpeed: 1 },
  { id: 'jupiter', name: 'Jupiter', color: '#d8b48a', size: 1.15, distance: 9.6, speed: 0.32, rotSpeed: 2.2 },
  { id: 'saturnus', name: 'Saturnus', color: '#e8d5a3', size: 1, distance: 11.9, speed: 0.24, rotSpeed: 2, rings: true, tilt: 0.47 },
  { id: 'uranus', name: 'Uranus', color: '#9ee6e8', size: 0.75, distance: 13.8, speed: 0.18, rotSpeed: 1.4, tilt: 1.4 },
  { id: 'neptunus', name: 'Neptunus', color: '#2e5be6', size: 0.72, distance: 15.6, speed: 0.14, rotSpeed: 1.3 },
];

export const FACT_3D: Record<string, string> = {
  matahari: 'Bintang pusat Tata Surya. Cahayanya menghangatkan semua planet!',
  merkurius: 'Tahunnya cuma 88 hari. Paling cepat mengelilingi Matahari!',
  venus: 'Planet terpanas di Tata Surya, sekitar 464°C!',
  bumi: 'Rumah kita! Ada air, udara, dan kehidupan.',
  mars: 'Si Planet Merah. Gunung berapinya paling tinggi!',
  jupiter: 'Planet terbesar, punya badai raksasa berumur ratusan tahun.',
  saturnus: 'Cincinnya cantik, terbuat dari kepingan es dan batu.',
  uranus: 'Berputar miring, seperti sedang rebahan!',
  neptunus: 'Paling jauh dari Matahari. Anginnya super kencang!',
};