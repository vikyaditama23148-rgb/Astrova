'use client';

import Link from 'next/link';
import { Award, ChevronRight, Rocket, Sparkles, Star, TrendingDown, TrendingUp } from 'lucide-react';
import RobotMascotStatic from '@/components/RobotMascotStatic';
import Reveal from '@/components/Reveal';
import type { EvaluationReport } from '@/lib/report';

const nf = (n: number | null) => (n == null ? '-' : Math.round(n));
const catColor: Record<string, string> = { Tinggi: 'text-mint-400 border-mint-400', Sedang: 'text-sun-400 border-sun-400', Rendah: 'text-coral-500 border-coral-500', '-': 'text-indigo-200 border-white/30' };

export default function EvaluationView({ report, narrative, source }: { report: EvaluationReport; narrative: string; source: 'ai' | 'template' }) {
  const r = report;
  const naik = r.preScore != null && r.postScore != null ? r.postScore - r.preScore : null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-4">
      <Reveal immediate className="text-center">
        <span className="chip mb-3"><Sparkles size={15} /> Laporan Belajarmu</span>
        <h1 className="text-3xl font-semibold sm:text-4xl">Kerja bagus, {r.studentName.split(' ')[0]}! 🎉</h1>
        <p className="mt-1 text-indigo-100/90">Ini rangkuman perjalanan belajarmu dari awal sampai Ujian Akhir.</p>
      </Reveal>

      <Reveal immediate delay={0.1} className="mt-6">
        <div className="card-night flex gap-4 p-5">
          <div className="shrink-0"><RobotMascotStatic size={64} /></div>
          <div>
            <p className="font-display text-lg font-semibold text-sun-300">AstroBot bercerita</p>
            <p className="mt-1 text-lg leading-relaxed">{narrative}</p>
            {source === 'template' && <p className="mt-2 text-xs text-indigo-200/60">Dibuat otomatis dari data belajarmu.</p>}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-5">
        <div className={`card-night flex flex-wrap items-center justify-between gap-4 border-2 p-5 ${catColor[r.nGainCat]}`}>
          <div>
            <p className="text-sm text-indigo-200/80">Pre-Test → Post-Test</p>
            <p className="font-display text-3xl font-bold">{nf(r.preScore)} → {nf(r.postScore)}</p>
          </div>
          {naik != null && (
            <div className="flex items-center gap-2">
              {naik >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
              <div>
                <p className="text-sm text-indigo-200/80">Peningkatan (N-Gain)</p>
                <p className="font-display text-xl font-bold">{naik >= 0 ? '+' : ''}{naik} poin · {r.nGainCat}</p>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.2} className="mt-5 grid grid-cols-3 gap-3">
        <div className="card-night p-4 text-center"><Star className="mx-auto mb-1 fill-sun-400 text-sun-400" size={22} /><p className="font-display text-xl font-bold">{r.totalStars}/{r.maxStars}</p><p className="text-xs text-indigo-200/70">Bintang</p></div>
        <div className="card-night p-4 text-center"><Award className="mx-auto mb-1 text-secondary" size={22} /><p className="font-display text-xl font-bold">{r.badgesEarned}/{r.badgesTotal}</p><p className="text-xs text-indigo-200/70">Lencana</p></div>
        <div className="card-night p-4 text-center"><Rocket className="mx-auto mb-1 text-grape-300" size={22} /><p className="font-display text-xl font-bold">{r.exploreMinutesTotal}</p><p className="text-xs text-indigo-200/70">Menit Explore</p></div>
      </Reveal>

      {(r.strongModules.length > 0 || r.strongestType) && (
        <Reveal delay={0.25} className="mt-6">
          <h2 className="mb-3 text-xl font-semibold text-mint-400">🌟 Yang sudah kamu kuasai</h2>
          <ul className="space-y-2">
            {r.strongModules.map((m) => (
              <li key={m.id} className="card-night flex items-center justify-between p-3.5">
                <span>{m.title}</span><span className="chip !border-mint-400 !text-mint-400">Skor {m.score}</span>
              </li>
            ))}
            {r.strongestType && r.strongestType.total >= 2 && (
              <li className="card-night flex items-center justify-between p-3.5">
                <span>Soal tipe {r.strongestType.label}</span>
                <span className="chip !border-mint-400 !text-mint-400">{r.strongestType.correct}/{r.strongestType.total} benar</span>
              </li>
            )}
          </ul>
        </Reveal>
      )}

      <Reveal delay={0.3} className="mt-6">
        <h2 className="mb-3 text-xl font-semibold text-grape-300">🔍 Yang perlu diperdalam</h2>
        {r.weakModules.length === 0 && (!r.weakestType || r.weakestType.accuracy >= 0.7) ? (
          <p className="card-night p-4 text-indigo-100/90">Tidak ada yang perlu dikhawatirkan — semua modul kamu kerjakan dengan baik! Tetap semangat menjelajah, ya.</p>
        ) : (
          <ul className="space-y-2">
            {r.weakModules.map((m) => (
              <li key={m.id} className="card-night flex items-center justify-between p-3.5">
                <span>{m.title}</span>
                <Link href={`/module/${m.id}`} className="btn btn-ghost btn-sm">Ulas lagi <ChevronRight size={16} /></Link>
              </li>
            ))}
            {r.weakestType && r.weakestType.total >= 2 && r.weakestType.accuracy < 0.7 && (
              <li className="card-night p-3.5">Soal tipe <b>{r.weakestType.label}</b> ({r.weakestType.correct}/{r.weakestType.total} benar) — coba latihan lagi di modul manapun ya.</li>
            )}
          </ul>
        )}
      </Reveal>

      <Reveal delay={0.35} className="mt-8 text-center">
        <Link href="/hub" className="btn btn-primary">Kembali ke Markas</Link>
      </Reveal>
    </div>
  );
}