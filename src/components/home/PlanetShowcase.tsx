'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import PlanetCanvas from '@/components/PlanetCanvas';
import PlanetViewer from '@/components/explore/PlanetViewer';
import Reveal from '@/components/Reveal';

type Group = 'bintang' | 'batuan' | 'raksasa';
interface Card { id: string; name: string; group: Group; badge: string; order: string; sub: string; text: string; foot: string }

const CARDS: Card[] = [
  { id: 'matahari', name: 'Matahari', group: 'bintang', badge: 'Bintang Induk', order: 'Pusat Orbit', sub: 'Suhu inti: 15 juta °C', text: 'Bintang raksasa yang memberi cahaya dan panas. Gravitasinya menahan semua planet tetap berputar teratur.', foot: 'Lebar: 1.392.700 km' },
  { id: 'merkurius', name: 'Merkurius', group: 'batuan', badge: 'Planet Batuan', order: 'Urutan 1', sub: 'Revolusi: 88 hari', text: 'Planet paling dekat dengan Matahari. Ukurannya kecil dan larinya super cepat!', foot: 'Tidak punya bulan' },
  { id: 'venus', name: 'Venus', group: 'batuan', badge: 'Bintang Kejora', order: 'Urutan 2', sub: 'Suhu rata-rata: 464 °C', text: 'Planet terpanas di Tata Surya karena atmosfernya tebal menahan panas seperti selimut raksasa.', foot: 'Berputar berlawanan arah' },
  { id: 'bumi', name: 'Bumi', group: 'batuan', badge: 'Planet Kehidupan', order: 'Urutan 3', sub: 'Rotasi: 24 jam', text: 'Rumah kita tercinta! Punya air cair, udara yang bisa kita hirup, dan satu bulan setia.', foot: '1 bulan: Bulan' },
  { id: 'mars', name: 'Mars', group: 'batuan', badge: 'Planet Merah', order: 'Urutan 4', sub: 'Punya gunung tertinggi', text: 'Tanahnya merah karena mengandung besi berkarat. Banyak robot penjelajah (rover) mendarat di sini!', foot: '2 bulan: Phobos & Deimos' },
  { id: 'jupiter', name: 'Jupiter', group: 'raksasa', badge: 'Raksasa Gas', order: 'Urutan 5', sub: 'Planet terbesar', text: 'Raja planet yang muat sekitar 1.300 Bumi! Punya badai raksasa bernama Bintik Merah.', foot: 'Lebih dari 90 bulan' },
  { id: 'saturnus', name: 'Saturnus', group: 'raksasa', badge: 'Cincin Spektakuler', order: 'Urutan 6', sub: 'Kepadatan sangat rendah', text: 'Cincinnya dari es dan batu berkilau. Saking ringannya, ia akan mengapung kalau ada kolam raksasa!', foot: 'Lebih dari 140 bulan' },
  { id: 'uranus', name: 'Uranus', group: 'raksasa', badge: 'Raksasa Es', order: 'Urutan 7', sub: 'Berputar miring', text: 'Planet dingin berwarna biru kehijauan. Sumbunya sangat miring, seperti bola yang menggelinding!', foot: 'Lebih dari 25 bulan' },
  { id: 'neptunus', name: 'Neptunus', group: 'raksasa', badge: 'Planet Terluar', order: 'Urutan 8', sub: 'Angin hingga 2.000 km/jam', text: 'Planet biru pekat yang paling jauh. Butuh sekitar 165 tahun Bumi untuk mengitari Matahari sekali!', foot: 'Bulan terbesar: Triton' },
];

const TONE: Record<Group, string> = { bintang: 'bg-primary-container text-on-primary', batuan: 'bg-secondary/15 text-secondary', raksasa: 'bg-tertiary-container text-[#381385]' };
const FILTERS: [Group | 'semua', string][] = [['semua', 'Semua (9)'], ['batuan', 'Planet Batuan'], ['raksasa', 'Raksasa Gas & Es']];

function PlanetCard({ c, onOpen }: { c: Card; onOpen: (id: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '300px' });
  const [hot, setHot] = useState(false);
  return (
    <motion.article
      ref={ref} layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)}
      className="card-night flex min-w-[82%] snap-center flex-col justify-between p-5 transition-shadow hover:shadow-[0_16px_40px_rgba(64,219,216,0.18)] md:min-w-0"
    >
      <div>
        <div className="mb-3 flex items-center justify-between text-xs font-extrabold">
          <span className={`rounded-full px-3 py-1 ${TONE[c.group]}`}>{c.badge}</span>
          <span className="text-on-surface-variant">{c.order}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-[72px] w-[72px] shrink-0">
            {inView ? <PlanetCanvas planetId={c.id} size={150} interactive={false} autoRotate={hot} initialRotation={0.9} /> : <div className="h-full w-full rounded-full bg-white/10" />}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-primary">{c.name}</h3>
            <span className="text-sm font-bold text-secondary">{c.sub}</span>
          </div>
        </div>
        <p className="mt-3 text-base leading-6 text-on-surface-variant">{c.text}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
        <span className="text-sm font-bold text-on-surface">{c.foot}</span>
        <button type="button" onClick={() => onOpen(c.id)} className="btn btn-ghost btn-sm !min-h-10 whitespace-nowrap">Lihat dekat <ArrowRight size={16} /></button>
      </div>
    </motion.article>
  );
}

export default function PlanetShowcase() {
  const [filter, setFilter] = useState<Group | 'semua'>('semua');
  const [open, setOpen] = useState<string | null>(null);
  const list = CARDS.filter((c) => filter === 'semua' || c.group === filter);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  const cur = CARDS.find((c) => c.id === open);
  return (
    <section id="planet" className="scroll-mt-24 py-16" aria-labelledby="planet-h">
      <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="chip !bg-secondary/10 !text-secondary">Album Antariksa</span>
          <h2 id="planet-h" className="mt-3 text-4xl font-bold text-primary lg:text-[42px] lg:leading-[48px]">Kenalan dengan Keluarga Matahari</h2>
          <p className="mt-1 text-lg text-on-surface-variant">Pilih salah satu anggota tata surya untuk melihatnya lebih dekat.</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Saring planet">
          {FILTERS.map(([k, label]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
              className={`rounded-full px-4 py-2 font-display text-sm font-bold transition ${filter === k ? 'bg-primary-container text-on-primary shadow-[0_3px_0_#b57a00]' : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest'}`}>{label}</button>
          ))}
        </div>
      </Reveal>

      <motion.div layout className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">{list.map((c) => <PlanetCard key={c.id} c={c} onOpen={setOpen} />)}</AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {cur && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Profil ${cur.name}`}>
            <motion.div initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }} onClick={(e) => e.stopPropagation()}
              className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-3xl border-2 border-white/20 bg-[#0e1226] p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-3xl font-bold text-primary">Kenalan dengan {cur.name}</h3>
                <button type="button" autoFocus onClick={() => setOpen(null)} className="btn btn-ghost btn-sm" aria-label="Tutup"><X size={18} /> Tutup</button>
              </div>
              <PlanetViewer planets={[cur.id]} />
              <div className="mt-5 text-center"><Link href="/login" className="btn btn-primary">Mulai belajar bersama {cur.name} 🚀</Link></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}