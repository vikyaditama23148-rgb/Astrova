'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const FACES = [
  { v: 1, e: '😞', l: 'Tidak suka' }, { v: 2, e: '🙁', l: 'Kurang suka' }, { v: 3, e: '😐', l: 'Biasa saja' },
  { v: 4, e: '🙂', l: 'Suka' }, { v: 5, e: '🤩', l: 'Suka sekali' },
];

export default function UsabilitySurvey({ show }: { show: boolean }) {
  const [open, setOpen] = useState(show);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    await fetch('/api/survey', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating, text }) }).catch(() => {});
    setBusy(false); setSent(true);
    setTimeout(() => setOpen(false), 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Survei kepuasan">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="card-paper w-full max-w-lg p-6 text-center">
            {sent ? (
              <p className="py-8 font-display text-3xl">Terima kasih, Kapten! 🚀</p>
            ) : (
              <>
                <h2 className="text-3xl font-semibold">Bagaimana belajar di Astrova?</h2>
                <p className="mt-1 text-lg">Pilih wajah yang paling cocok dengan perasaanmu.</p>
                <div role="radiogroup" className="mt-5 grid grid-cols-5 gap-2">
                  {FACES.map((f) => (
                    <button key={f.v} type="button" role="radio" aria-checked={rating === f.v} onClick={() => setRating(f.v)}
                      className={`flex flex-col items-center rounded-2xl border-[3px] p-2 transition ${rating === f.v ? 'border-night-900 bg-sun-400' : 'border-transparent bg-white/70 hover:bg-white'}`}>
                      <span className="text-4xl sm:text-5xl">{f.e}</span><span className="mt-1 text-[11px] font-bold leading-tight sm:text-xs">{f.l}</span>
                    </button>
                  ))}
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={3} placeholder="Ada cerita atau saran? (boleh dikosongkan)" aria-label="Saran"
                  className="mt-4 w-full rounded-2xl border-[3px] border-night-900/30 bg-white p-3 text-lg text-night-900" />
                <div className="mt-4 flex justify-center gap-3">
                  <button type="button" className="btn btn-primary" disabled={!rating || busy} onClick={submit}>Kirim</button>
                  <button type="button" className="btn btn-ghost !text-night-900 !border-night-900/30" onClick={() => setOpen(false)}>Nanti saja</button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
