'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Loader2, RotateCcw, Send, Star, X } from 'lucide-react';
import ExploreRenderer from '@/components/explore/ExploreRenderer';
import { ChoiceQuestion, DragDropQuestion, HotspotQuestion, OrderingQuestion, SimulationQuestion, type QProps } from '@/components/quiz/questions';
import { useQuizStore } from '@/components/quiz/store';
import { starsFromScore } from '@/lib/stars';
import { MAX_ATTEMPTS, type ExploreConfig, type PublicQuestion, type QuestionState } from '@/lib/types';

interface Props {
  mode: 'module' | 'pre_test' | 'post_test';
  title: string;
  questions: PublicQuestion[];
  initialStates: Record<string, QuestionState>;
  avatar: string;
  backHref: string;
  moduleId?: string;
}

const ENCOURAGE = ['Hampir tepat! Yuk coba sekali lagi 💪', 'Tidak apa-apa, penjelajah hebat pun mencoba lagi! 🚀', 'Ayo pikirkan lagi, kamu pasti bisa! 🌟'];

function Question(props: QProps) {
  switch (props.q.type) {
    case 'drag_drop': return <DragDropQuestion {...props} />;
    case 'ordering': return <OrderingQuestion {...props} />;
    case 'hotspot': return <HotspotQuestion {...props} />;
    case 'simulation_driven': return <SimulationQuestion {...props} />;
    default: return <ChoiceQuestion {...props} />;
  }
}

function Stars({ n, big = false }: { n: number; big?: boolean }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`${n} dari 3 bintang`}>
      {[1, 2, 3].map((k) => (
        <motion.span key={k} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15 * k, type: 'spring', stiffness: 300, damping: 12 }}>
          <Star size={big ? 64 : 34} className={k <= n ? 'fill-sun-400 text-sun-400 star-glow' : 'text-white/25'} />
        </motion.span>
      ))}
    </div>
  );
}

export default function QuizRunner({ mode, title, questions, initialStates, avatar, backHref, moduleId }: Props) {
  const s = useQuizStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const isModule = mode === 'module';

  useEffect(() => {
    const first = questions.findIndex((q) => !initialStates[q.id]?.resolved);
    s.init(initialStates, first === -1 ? questions.length : first);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, initialStates]);

  const total = questions.length;
  const finished = ready && s.index >= total;
  const q = questions[s.index];
  const attemptsSoFar = q ? s.states[q.id]?.attempts ?? 0 : 0;

  const finalScore = useMemo(() => {
    if (s.aggregate) return s.aggregate.score;
    const sum = questions.reduce((a, x) => a + (s.states[x.id]?.bestScore ?? 0), 0);
    return total ? Math.round(sum / total) : 0;
  }, [s.aggregate, s.states, questions, total]);

  useEffect(() => {
    if (finished && isModule && total) confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#ffc93c', '#3dd9d6', '#ff6b4a', '#a78bfa'] });
  }, [finished, isModule, total]);

  const submit = async () => {
    if (!q || !s.answer || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.id, answer: s.answer, hintUsed: s.hintUsed }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Gagal mengirim jawaban');
      if (j.aggregate) s.setAggregate(j.aggregate);
      if (!isModule) {
        s.setState(q.id, { attempts: 1, resolved: true, correct: false, bestScore: 0 });
        s.next();
        return;
      }
      s.setState(q.id, { attempts: j.attempts, resolved: j.resolved, correct: j.correct, bestScore: j.correct ? j.score : 0 });
      s.setFeedback({ correct: j.correct, resolved: j.resolved, explanation: j.explanation, score: j.score, attempts: j.attempts });
      if (j.correct) confetti({ particleCount: 50, spread: 55, origin: { y: 0.75 }, scalar: 0.8 });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <div className="grid place-items-center py-20"><Loader2 className="animate-spin" /></div>;

  if (!total) return <p className="card-night p-8 text-center text-lg">Belum ada soal untuk bagian ini. Hubungi gurumu ya.</p>;

  if (finished) {
    const stars = starsFromScore(finalScore);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-night mx-auto max-w-lg space-y-5 p-8 text-center">
        {isModule ? (
          <>
            <p className="text-6xl" aria-hidden>🏅</p>
            <h2 className="text-3xl font-semibold">Misi selesai!</h2>
            <Stars n={stars} big />
            <p className="text-xl">Skor {title}: <b className="text-sun-300">{finalScore}</b></p>
          </>
        ) : (
          <>
            <p className="text-6xl" aria-hidden>{mode === 'pre_test' ? '🎒' : '👑'}</p>
            <h2 className="text-3xl font-semibold">{mode === 'pre_test' ? 'Misi Pemanasan selesai!' : 'Ujian Akhir selesai!'}</h2>
            <p className="text-lg text-indigo-100">{mode === 'pre_test' ? 'Sekarang semua modul terbuka. Selamat menjelajah!' : 'Terima kasih sudah berjuang sampai akhir, Kapten!'}</p>
          </>
        )}
        {mode === 'post_test' ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/laporan" className="btn btn-primary">📊 Lihat Laporan Belajarmu</Link>
            <Link href={backHref} className="btn btn-ghost">Kembali ke Markas</Link>
          </div>
        ) : (
          <Link href={backHref} className="btn btn-primary">Kembali ke Markas</Link>
        )}
      </motion.div>
    );
  }

  const fb = s.feedback;
  const hintSim: ExploreConfig | undefined = q.data.hint_sim;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-indigo-100/80">
          <span>Soal {s.index + 1} dari {total}</span>
          {isModule && <span>{'⭐'.repeat(Math.max(0, 3 - attemptsSoFar))}</span>}
        </div>
        <div className="progress-track"><motion.div className="progress-fill" animate={{ width: `${Math.max(4, (s.index / total) * 100)}%` }} /></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${q.id}-${attemptsSoFar}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">{q.text}</h2>
          <Question q={q} setAnswer={s.setAnswer} disabled={!!fb} avatar={avatar} />
        </motion.div>
      </AnimatePresence>

      {error && <p role="alert" className="rounded-2xl border-2 border-coral-500 bg-coral-500/15 p-3 text-center">{error}</p>}

      {fb ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl border-[3px] p-5 ${fb.correct ? 'border-mint-400 bg-mint-400/10' : fb.resolved ? 'border-grape-400 bg-grape-400/15' : 'border-coral-500 bg-coral-500/10 shake'}`} aria-live="polite">
          {fb.correct ? (
            <>
              <p className="font-display text-2xl text-mint-400">Yeay, tepat sekali! 🎉</p>
              {q.data && fb.explanation && <p className="mt-1 text-lg">{fb.explanation}</p>}
            </>
          ) : fb.resolved ? (
            <>
              <p className="font-display text-2xl text-grape-300">Tidak apa-apa, kita pelajari bersama 💜</p>
              {fb.explanation && <p className="mt-1 text-lg">{fb.explanation}</p>}
            </>
          ) : (
            <>
              <p className="font-display text-2xl text-grape-300">{ENCOURAGE[(fb.attempts - 1) % ENCOURAGE.length]}</p>
              <p className="mt-1 text-lg">Kesempatan tersisa: {MAX_ATTEMPTS - fb.attempts}. Pakai bantuan kalau perlu.</p>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {fb.resolved ? (
              <button type="button" className="btn btn-primary" onClick={() => s.next()}>{s.index + 1 >= total ? 'Lihat hasil' : 'Soal berikutnya'}</button>
            ) : (
              <>
                <button type="button" className="btn btn-aqua" onClick={() => s.retry()}><RotateCcw size={18} /> Coba lagi</button>
                <button type="button" className="btn btn-ghost" onClick={() => { s.useHint(); setHintOpen(true); }}><Eye size={18} /> Intip Simulasi</button>
              </>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isModule && (q.data.hint || hintSim) ? (
            <button type="button" className="btn btn-ghost" onClick={() => { s.useHint(); setHintOpen(true); }}><Eye size={18} /> Intip Simulasi (Hint)</button>
          ) : <span />}
          <button type="button" className="btn btn-primary" disabled={!s.answer || busy} onClick={submit}>
            {busy ? <Loader2 className="animate-spin" /> : <Send size={18} />} {isModule ? 'Periksa jawabanku' : 'Simpan jawaban'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {hintOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label="Petunjuk">
            <motion.div initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-3xl border-2 border-white/20 bg-night-900 p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl text-sun-300">💡 Petunjuk dari AstroBot</p>
                  {q.data.hint && <p className="mt-1 text-lg">{q.data.hint}</p>}
                </div>
                <button type="button" onClick={() => setHintOpen(false)} className="btn btn-ghost btn-sm" aria-label="Tutup petunjuk"><X size={18} /> Tutup</button>
              </div>
              {hintSim && <ExploreRenderer config={hintSim} avatar={avatar} compact />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}