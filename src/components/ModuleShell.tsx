'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Compass, Lock, Trophy } from 'lucide-react';
import LearnCarousel from '@/components/learn/LearnCarousel';
import ExplorePhase from '@/components/explore/ExplorePhase';
import QuizRunner from '@/components/quiz/QuizRunner';
import PlanetCanvas from '@/components/PlanetCanvas';
import { useEffect } from 'react';
import { getPlanet } from '@/lib/planets';
import type { ModuleRow, ProgressRow, PublicQuestion, QuestionState } from '@/lib/types';

type Phase = 'learn' | 'explore' | 'test';

async function post(moduleId: string, action: string) {
  await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId, action }) });
}

export default function ModuleShell({ module: m, progress, avatar, questions, states, planetId }: {
  module: ModuleRow; progress: ProgressRow | null; avatar: string; questions: PublicQuestion[]; states: Record<string, QuestionState>; planetId: string;
}) {
  const [learnDone, setLearnDone] = useState(!!progress?.learn_completed);
  const [exploreDone, setExploreDone] = useState(!!progress?.explore_completed);
  const initial: Phase = !progress?.learn_completed ? 'learn' : !progress?.explore_completed ? 'explore' : 'test';
  const [phase, setPhase] = useState<Phase>(initial);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('astrobot:context', { detail: { moduleId: m.id, phase } }));
  }, [m.id, phase]);

  const tabs: { id: Phase; label: string; icon: React.ReactNode; locked: boolean; done: boolean }[] = [
    { id: 'learn', label: 'Learn', icon: <BookOpen size={20} />, locked: false, done: learnDone },
    { id: 'explore', label: 'Explore', icon: <Compass size={20} />, locked: !learnDone, done: exploreDone },
    { id: 'test', label: 'Test', icon: <Trophy size={20} />, locked: !exploreDone, done: !!progress?.test_completed },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-4">
      <div className="mb-5 flex items-center gap-4">
        <Link href="/hub" className="btn btn-ghost btn-sm" aria-label="Kembali ke markas"><ArrowLeft size={18} /> Markas</Link>
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-14 shrink-0"><PlanetCanvas planetId={planetId} size={110} interactive={false} autoRotate /></div>
          <h1 className="truncate text-2xl font-semibold sm:text-3xl">{m.title}</h1>
        </div>
      </div>

      <div role="tablist" aria-label="Fase belajar" className="mb-6 grid grid-cols-3 gap-2 rounded-full bg-white/8 p-1.5">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={phase === t.id} disabled={t.locked} onClick={() => setPhase(t.id)}
            className={`relative flex min-h-[48px] items-center justify-center gap-2 rounded-full font-display text-lg font-semibold transition ${phase === t.id ? 'text-night-900' : 'text-indigo-100 hover:bg-white/10'} disabled:opacity-50`}>
            {phase === t.id && <motion.span layoutId="phase-pill" className="absolute inset-0 rounded-full bg-sun-400" />}
            <span className="relative flex items-center gap-2">{t.locked ? <Lock size={18} /> : t.icon}{t.label}{t.done && ' ✓'}</span>
          </button>
        ))}
      </div>

      {phase === 'learn' && (
        <LearnCarousel cards={m.learn_content ?? []} done={learnDone} onComplete={async () => { setLearnDone(true); setPhase('explore'); await post(m.id, 'learn_complete'); }} />
      )}
      {phase === 'explore' && (
        <ExplorePhase moduleId={m.id} config={m.explore_config} avatar={avatar} done={exploreDone} initialSeconds={progress?.time_spent_explore_seconds ?? 0}
          onComplete={async () => { await post(m.id, 'explore_complete'); setExploreDone(true); setPhase('test'); }} />
      )}
      {phase === 'test' && exploreDone && (
        <QuizRunner mode="module" moduleId={m.id} title={m.title} questions={questions} initialStates={states} avatar={avatar} backHref="/hub" />
      )}
    </div>
  );
}
