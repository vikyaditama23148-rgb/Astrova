export type TextureKind = 'sun' | 'rocky' | 'venus' | 'earth' | 'mars' | 'bands' | 'ice';

export interface PlanetHotspot {
  id: string;
  label: string;
  text: string;
  lon: number; // derajat, 0 = meridian awal
  lat: number; // derajat, + utara
}

export interface PlanetInfo {
  id: string;
  name: string;
  kind: 'bintang' | 'dalam' | 'luar';
  emoji: string;
  texture: TextureKind;
  palette: string[];
  tilt: number; // kemiringan sumbu (derajat) — hanya visual
  scale: number; // radius relatif terhadap kanvas
  rings?: boolean;
  spot?: { lon: number; lat: number; color: string; size: number };
  diameterEarth: number; // × Bumi
  distanceMkm: number | null; // juta km dari Matahari
  gravity: number; // × Bumi (g permukaan)
  periodYears: number; // lama 1 revolusi (tahun Bumi)
  avgTempC: number;
  moons: string;
  summary: string;
  hotspots: PlanetHotspot[];
}

export const PLANETS: PlanetInfo[] = [
  {
    id: 'matahari', name: 'Matahari', kind: 'bintang', emoji: '☀️', texture: 'sun',
    palette: ['#FFB300', '#FF6D00', '#FFF3B0'], tilt: 7, scale: 0.4,
    diameterEarth: 109, distanceMkm: 0, gravity: 27.9, periodYears: 0, avgTempC: 5500, moons: '-',
    summary: 'Bintang di pusat Tata Surya. Permukaannya sekitar 5.500°C dan memberi cahaya serta panas untuk semua planet.',
    hotspots: [
      { id: 'bintik', label: 'Bintik Matahari', text: 'Bintik gelap ini lebih dingin daripada area di sekitarnya, tetapi tetap sangat panas!', lon: 30, lat: 15 },
      { id: 'ukuran', label: 'Ukuran raksasa', text: 'Lebar Matahari sekitar 109 kali lebar Bumi. Sekitar 1,3 juta Bumi muat di dalamnya!', lon: -35, lat: -20 },
    ],
  },
  {
    id: 'merkurius', name: 'Merkurius', kind: 'dalam', emoji: '⚪', texture: 'rocky',
    palette: ['#8C8C8C', '#5E5A57', '#BDB6AE'], tilt: 0, scale: 0.24,
    diameterEarth: 0.38, distanceMkm: 57.9, gravity: 0.38, periodYears: 0.24, avgTempC: 167, moons: 'Tidak punya bulan',
    summary: 'Planet terkecil dan terdekat dengan Matahari. Satu tahunnya hanya 88 hari Bumi.',
    hotspots: [
      { id: 'kawah', label: 'Kawah', text: 'Permukaannya penuh kawah bekas tabrakan meteor, mirip Bulan.', lon: 20, lat: 10 },
      { id: 'tahun', label: 'Tahun singkat', text: 'Merkurius mengelilingi Matahari hanya dalam 88 hari Bumi.', lon: -30, lat: -25 },
    ],
  },
  {
    id: 'venus', name: 'Venus', kind: 'dalam', emoji: '🟡', texture: 'venus',
    palette: ['#E8C97A', '#C9974A', '#F7E7B4'], tilt: 3, scale: 0.3,
    diameterEarth: 0.95, distanceMkm: 108.2, gravity: 0.91, periodYears: 0.615, avgTempC: 464, moons: 'Tidak punya bulan',
    summary: 'Planet terpanas! Atmosfer tebalnya menahan panas seperti selimut raksasa.',
    hotspots: [
      { id: 'awan', label: 'Awan tebal', text: 'Awan Venus tebal dan menutupi seluruh permukaan planet.', lon: 25, lat: 20 },
      { id: 'panas', label: 'Terpanas', text: 'Suhunya sekitar 464°C, cukup panas untuk melelehkan timbal!', lon: -30, lat: -15 },
    ],
  },
  {
    id: 'bumi', name: 'Bumi', kind: 'dalam', emoji: '🌍', texture: 'earth',
    palette: ['#1E5BB8', '#2E9A4A', '#8A6B3E'], tilt: 23, scale: 0.3,
    diameterEarth: 1, distanceMkm: 149.6, gravity: 1, periodYears: 1, avgTempC: 15, moons: '1 bulan: Bulan',
    summary: 'Rumah kita! Satu-satunya planet yang kita tahu memiliki kehidupan dan air cair di permukaannya.',
    hotspots: [
      { id: 'laut', label: 'Lautan', text: 'Sekitar 71% permukaan Bumi tertutup air, makanya Bumi tampak biru.', lon: -40, lat: 5 },
      { id: 'rotasi', label: 'Rotasi 24 jam', text: 'Bumi berputar sekali setiap 24 jam. Karena itu ada siang dan malam.', lon: 30, lat: 25 },
      { id: 'kutub', label: 'Kutub es', text: 'Di kutub utara dan selatan, suhunya sangat dingin dan tertutup es.', lon: 0, lat: 70 },
    ],
  },
  {
    id: 'mars', name: 'Mars', kind: 'dalam', emoji: '🔴', texture: 'mars',
    palette: ['#C1502E', '#8E3B24', '#E39A6B'], tilt: 25, scale: 0.26,
    diameterEarth: 0.53, distanceMkm: 227.9, gravity: 0.38, periodYears: 1.881, avgTempC: -65, moons: '2 bulan kecil: Phobos & Deimos',
    summary: 'Si Planet Merah. Warna merahnya berasal dari karat besi di tanahnya.',
    hotspots: [
      { id: 'karat', label: 'Karat besi', text: 'Tanah Mars mengandung besi berkarat, sehingga tampak merah.', lon: 20, lat: 0 },
      { id: 'olympus', label: 'Olympus Mons', text: 'Gunung berapi tertinggi di Tata Surya, sekitar 2,5 kali tinggi Gunung Everest!', lon: -35, lat: 15 },
      { id: 'kutub', label: 'Kutub es', text: 'Kutub Mars tertutup es air dan es kering (karbon dioksida beku).', lon: 0, lat: 68 },
    ],
  },
  {
    id: 'jupiter', name: 'Jupiter', kind: 'luar', emoji: '🟠', texture: 'bands',
    palette: ['#D8B48A', '#B5763F', '#F1E3CF', '#8B4E2B'], tilt: 3, scale: 0.4,
    spot: { lon: 30, lat: -22, color: '#B4432A', size: 0.13 },
    diameterEarth: 11.2, distanceMkm: 778.6, gravity: 2.53, periodYears: 11.86, avgTempC: -110, moons: 'Lebih dari 90 bulan (Ganymede, Europa, Io, ...)',
    summary: 'Planet terbesar. Tubuhnya raksasa gas dengan badai yang sudah berlangsung ratusan tahun.',
    hotspots: [
      { id: 'bintik', label: 'Bintik Merah Raksasa', text: 'Badai raksasa yang lebarnya bisa memuat sekitar satu Bumi!', lon: 30, lat: -22 },
      { id: 'terbesar', label: 'Planet terbesar', text: 'Lebar Jupiter sekitar 11 kali lebar Bumi.', lon: -40, lat: 20 },
    ],
  },
  {
    id: 'saturnus', name: 'Saturnus', kind: 'luar', emoji: '🪐', texture: 'bands',
    palette: ['#E8D5A3', '#C9B27A', '#F6EBCB', '#A88B54'], tilt: 27, scale: 0.21, rings: true,
    diameterEarth: 9.45, distanceMkm: 1433.5, gravity: 1.06, periodYears: 29.45, avgTempC: -140, moons: 'Lebih dari 140 bulan (Titan, Enceladus, ...)',
    summary: 'Terkenal karena cincinnya yang indah, tersusun dari kepingan es dan batu.',
    hotspots: [
      { id: 'cincin', label: 'Cincin', text: 'Cincin Saturnus terbuat dari jutaan keping es dan batu yang mengorbit.', lon: 0, lat: 0 },
      { id: 'ringan', label: 'Sangat ringan', text: 'Kepadatannya lebih kecil daripada air. Kalau ada kolam raksasa, Saturnus akan mengapung!', lon: 40, lat: 20 },
    ],
  },
  {
    id: 'uranus', name: 'Uranus', kind: 'luar', emoji: '🔵', texture: 'ice',
    palette: ['#9EE6E8', '#6CC7D4', '#D3F6F6'], tilt: 82, scale: 0.28,
    diameterEarth: 4, distanceMkm: 2872.5, gravity: 0.9, periodYears: 84, avgTempC: -195, moons: 'Lebih dari 25 bulan',
    summary: 'Raksasa es berwarna biru kehijauan yang berputar hampir "rebahan" di sisinya.',
    hotspots: [
      { id: 'miring', label: 'Berputar miring', text: 'Sumbu Uranus sangat miring, seakan planet ini berguling di orbitnya.', lon: 20, lat: 10 },
      { id: 'metana', label: 'Gas metana', text: 'Gas metana menyerap cahaya merah sehingga Uranus tampak biru kehijauan.', lon: -30, lat: -15 },
    ],
  },
  {
    id: 'neptunus', name: 'Neptunus', kind: 'luar', emoji: '🔵', texture: 'ice',
    palette: ['#2E5BE6', '#1B3BA8', '#6D93FF'], tilt: 28, scale: 0.28,
    diameterEarth: 3.9, distanceMkm: 4495.1, gravity: 1.14, periodYears: 164.8, avgTempC: -200, moons: 'Belasan bulan (Triton, dll.)',
    summary: 'Planet paling jauh dari Matahari. Dingin, gelap, dan berangin sangat kencang.',
    hotspots: [
      { id: 'angin', label: 'Angin super', text: 'Angin di Neptunus bisa lebih dari 2.000 km/jam, yang tercepat di Tata Surya.', lon: 25, lat: 10 },
      { id: 'jauh', label: 'Paling jauh', text: 'Cahaya Matahari perlu sekitar 4 jam untuk sampai ke Neptunus.', lon: -30, lat: -20 },
    ],
  },
];

export const PLANET_MAP: Record<string, PlanetInfo> = Object.fromEntries(PLANETS.map((p) => [p.id, p]));
export const getPlanet = (id: string) => PLANET_MAP[id] ?? PLANETS[4];

/** Planet yang punya data gravitasi/periode untuk Kalkulator Antariksa (tanpa Matahari). */
export const CALC_PLANETS = PLANETS.filter((p) => p.kind !== 'bintang');
