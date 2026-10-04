'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, Lock, Sparkles, Telescope, X } from 'lucide-react';
import { OBSERVATORY_SITE_URL } from '@/lib/external-sites';

/**
 * Jawaban kode rahasia untuk membuka versi Observatorium performa tinggi.
 * Dicocokkan case-insensitive dan mengabaikan spasi berlebih di awal/akhir.
 */
const SECRET_ANSWER = 'viky aditama';

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

type Stage = 'idle' | 'thinking' | 'wrong' | 'correct';

export default function ObservatoriumSecretCard() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open]);

  function closeModal() {
    setOpen(false);
    setValue('');
    setStage('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function submit() {
    if (stage === 'thinking') return;
    const correct = normalize(value) === SECRET_ANSWER;
    if (correct) {
      setStage('correct');
      timerRef.current = setTimeout(() => {
        window.open(OBSERVATORY_SITE_URL, '_blank', 'noopener,noreferrer');
        closeModal();
      }, 700);
      return;
    }
    // Salah atau kosong: beri waktu berpikir 5 detik sebelum petunjuk muncul.
    setStage('thinking');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStage('wrong'), 5000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card-night group relative w-full overflow-hidden p-6 text-left transition hover:-translate-y-1 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl transition group-hover:bg-secondary/30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
              <Telescope size={28} />
            </div>
            <div>
              <div className="chip mb-2 inline-flex items-center gap-1.5">
                <Sparkles size={13} /> Fitur andalan Astrova
              </div>
              <h3 className="text-xl font-extrabold text-white sm:text-2xl">Observatorium</h3>
              <p className="mt-1 max-w-xl text-sm text-white/70 sm:text-base">
                Observatorium: alat jelajah tata surya dengan performa tinggi — jelajahi planet, cincin, dan bulan secara 3D bebas dari sudut mana pun.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full bg-black/30 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-sm sm:self-center">
            <Lock size={15} /> Perlu kode rahasia
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="card-night relative w-full max-w-md p-6 sm:p-7"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>

              <div className="mb-4 flex items-center gap-2 text-secondary">
                <KeyRound size={20} />
                <span className="font-bold">Kode Rahasia Observatorium</span>
              </div>

              {stage === 'correct' ? (
                <p className="text-sm text-mint">
                  Benar! Membuka Observatorium performa tinggi di tab baru...
                </p>
              ) : (
                <>
                  <p className="mb-4 text-sm text-white/80">
                    Siapa nama pengembang Astrova?
                  </p>
                  <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    disabled={stage === 'thinking'}
                    placeholder="Tulis jawabanmu di sini..."
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
                  />

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={submit}
                      disabled={stage === 'thinking'}
                      className="btn btn-primary flex-1 disabled:opacity-60"
                    >
                      {stage === 'thinking' ? 'Memeriksa...' : 'Kirim jawaban'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {stage === 'thinking' && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 text-xs text-white/50"
                      >
                        Pikirkan sebentar ya, petunjuk akan muncul sebentar lagi...
                      </motion.p>
                    )}
                    {stage === 'wrong' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-lg bg-coral/10 p-3 text-xs text-coral"
                      >
                        Belum tepat. Petunjuk: jawabannya bisa kamu temukan di halaman{' '}
                        <a href="/tentang" className="underline underline-offset-2 hover:text-white">
                          Tentang Pengembang
                        </a>
                        .
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}