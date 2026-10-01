'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Gauge, X } from 'lucide-react';
import { GRAPHICS_PROFILES, type GraphicsQuality } from '@/graphics/graphicsConfig';

const ORDER: GraphicsQuality[] = ['easy', 'normal', 'high'];
const DOT: Record<GraphicsQuality, string> = { easy: '🟢', normal: '🔵', high: '🟣' };

/**
 * Panel pengaturan grafis sederhana untuk siswa — bahasa biasa, bukan
 * dashboard teknis. Cukup 3 pilihan dengan penjelasan satu baris.
 */
export default function GraphicsSettings({ quality, onChange, isAuto }: { quality: GraphicsQuality; onChange: (q: GraphicsQuality) => void; isAuto: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost btn-sm !min-h-9 !bg-black/45 backdrop-blur-sm" aria-label="Pengaturan grafis">
        <Gauge size={15} /> <span className="hidden sm:inline">Grafik</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Pengaturan kualitas grafis">
            <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border-2 border-white/15 bg-[#0e1226] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-primary">Kualitas Grafik</h2>
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm !min-h-9 !px-2.5" aria-label="Tutup"><X size={16} /></button>
              </div>
              <div className="space-y-2">
                {ORDER.map((q) => {
                  const p = GRAPHICS_PROFILES[q];
                  const active = quality === q;
                  return (
                    <button key={q} type="button" onClick={() => { onChange(q); setOpen(false); }} aria-pressed={active}
                      className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition ${active ? 'border-primary-container bg-primary-container/10' : 'border-white/12 bg-white/5 hover:bg-white/8'}`}>
                      <span className="text-xl">{DOT[q]}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-display text-base font-bold text-indigo-50">{p.label}{active && <Check size={15} className="text-primary-container" />}</span>
                        <span className="block text-xs leading-snug text-indigo-200/80">{p.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {isAuto && <p className="mt-3 text-center text-xs text-indigo-200/60">Dipilih otomatis berdasarkan perangkatmu. Pilih salah satu di atas untuk mengubahnya sendiri.</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}