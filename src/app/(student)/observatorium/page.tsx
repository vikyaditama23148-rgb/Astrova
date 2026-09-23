import type { Metadata } from 'next';
import Observatorium from '@/components/solar3d/Observatorium';

export const metadata: Metadata = { title: 'Observatorium 3D' };

/** Halaman bebas menjelajah tata surya secara 3D: kamera bebas, zoom ke tiap planet, lihat rotasi & revolusi. */
export default function ObservatoriumPage() {
  return <Observatorium />;
}