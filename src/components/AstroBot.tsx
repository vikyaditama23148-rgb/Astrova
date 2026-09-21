'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Send, X } from 'lucide-react';

interface Msg { role: 'user' | 'bot'; text: string }

function RobotFace({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <line x1="32" y1="4" x2="32" y2="13" stroke="#ffc93c" strokeWidth="3" strokeLinecap="round" /><circle cx="32" cy="5" r="4" fill="#ff6b4a" />
      <rect x="9" y="13" width="46" height="38" rx="15" fill="#e9edff" stroke="#1b1440" strokeWidth="3" />
      <rect x="15" y="21" width="34" height="20" rx="10" fill="#1b1440" />
      <circle cx="26" cy="31" r="4.5" fill="#3dd9d6" /><circle cx="38" cy="31" r="4.5" fill="#3dd9d6" />
      <path d="M27 38 Q32 42 37 38" stroke="#ffc93c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="3" y="26" width="6" height="14" rx="3" fill="#a78bfa" /><rect x="55" y="26" width="6" height="14" rx="3" fill="#a78bfa" />
    </svg>
  );
}

export default function AstroBot({ initialPhase }: { initialPhase?: 'hub' | 'pretest' | 'posttest' }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: 'Halo, Penjelajah! Aku AstroBot 🤖 Tanya apa saja tentang Tata Surya ya!' }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const ctx = useRef<{ moduleId?: string; phase?: string }>({ phase: initialPhase });
  const endRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const h = (e: Event) => { ctx.current = (e as CustomEvent).detail; };
    window.addEventListener('astrobot:context', h);
    return () => window.removeEventListener('astrobot:context', h);
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const send = async () => {
    const message = text.trim();
    if (!message || busy) return;
    setText(''); setBusy(true);
    const history = msgs.slice(-6);
    setMsgs((m) => [...m, { role: 'user', text: message }]);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history, ...(pathname.startsWith('/pretest') ? { phase: 'pretest' } : pathname.startsWith('/posttest') ? { phase: 'posttest' } : ctx.current) }) });
      const j = await res.json();
      setMsgs((m) => [...m, { role: 'bot', text: j.reply ?? j.error ?? 'Hmm, coba lagi ya.' }]);
    } catch {
      setMsgs((m) => [...m, { role: 'bot', text: 'Sinyalku hilang. Coba lagi sebentar lagi ya! 📡' }]);
    } finally { setBusy(false); }
  };

  return (
    <>
      <motion.button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Tutup AstroBot' : 'Tanya AstroBot'} whileTap={{ scale: 0.92 }}
        animate={open ? {} : { y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="fixed bottom-4 right-4 z-40 grid h-20 w-20 place-items-center rounded-full border-4 border-sun-400 bg-night-800 shadow-[0_8px_30px_rgba(0,0,0,.5)]">
        {open ? <X size={30} /> : <RobotFace />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-3 z-40 flex h-[min(520px,70dvh)] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border-[3px] border-sun-400 bg-night-900 shadow-2xl" aria-label="Obrolan AstroBot">
            <header className="flex items-center gap-3 bg-night-700 px-4 py-3"><RobotFace size={36} /><div><p className="font-display text-lg leading-none">AstroBot</p><p className="text-xs text-aqua-300">Teman belajarmu</p></div></header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base leading-snug ${m.role === 'user' ? 'bg-sun-400 text-night-900' : 'bg-white/12'}`}>{m.text}</p>
                </div>
              ))}
              {busy && <p className="flex items-center gap-2 text-sm text-indigo-200"><Loader2 size={16} className="animate-spin" /> AstroBot sedang berpikir...</p>}
              <div ref={endRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-white/10 p-3">
              <input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="Tulis pertanyaanmu..." aria-label="Pertanyaan untuk AstroBot"
                className="h-12 min-w-0 flex-1 rounded-full border-2 border-white/25 bg-white/10 px-4 text-white placeholder:text-white/50" />
              <button type="submit" disabled={busy || !text.trim()} className="btn btn-primary !min-h-12 !px-4" aria-label="Kirim"><Send size={20} /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
