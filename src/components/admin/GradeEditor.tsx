'use client';

import { Fragment, useState } from 'react';
import { clearOverride, overrideQuestion, overrideTotal, resetProgress, type ResetScope } from '@/app/admin/actions';
import { btnCls, Confirm, inputCls, Msg, useRun } from '@/components/admin/ui';

export interface TotalRow { target: 'pre_test' | 'post_test' | `module:${string}`; label: string; score: number | null; overridden: boolean; done: boolean; reset: ResetScope }

export function TotalsTable({ userId, rows }: { userId: string; rows: TotalRow[] }) {
  const { run, pending, msg } = useRun();
  const [open, setOpen] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [reason, setReason] = useState('');
  return (
    <div className="space-y-3">
      <Msg msg={msg} />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500"><tr><th className="py-2">Komponen</th><th>Status</th><th>Nilai</th><th>Aksi</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.target}>
                <tr className="border-b border-slate-100">
                  <td className="py-2 font-medium">{r.label}</td>
                  <td>{r.done ? 'Selesai' : 'Belum'}{r.overridden && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">di-override</span>}</td>
                  <td>{r.score ?? '-'}</td>
                  <td className="space-x-1 whitespace-nowrap py-2">
                    <button className={btnCls('ghost')} onClick={() => { setOpen(open === r.target ? null : r.target); setScore(String(r.score ?? '')); setReason(''); }}>Ubah nilai</button>
                    {r.overridden && <button className={btnCls('ghost')} disabled={pending} onClick={() => run(() => clearOverride(userId, r.target))}>Cabut override</button>}
                    <Confirm className={btnCls('ghost')} text={`Reset riwayat pengerjaan "${r.label}"? Siswa bisa mengerjakan ulang.`} onYes={() => run(() => resetProgress(userId, r.reset))}>Reset (re-test)</Confirm>
                  </td>
                </tr>
                {open === r.target && (
                  <tr className="bg-slate-50"><td colSpan={4} className="p-3">
                    <div className="flex flex-wrap items-end gap-3">
                      <div><label className="mb-1 block text-xs font-medium">Nilai baru (0–100)</label><input className={`${inputCls} w-28`} type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} /></div>
                      <div className="min-w-[220px] flex-1"><label className="mb-1 block text-xs font-medium">Alasan (wajib, masuk audit log)</label><input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="mis. Tablet siswa mati saat tes" /></div>
                      <button className={btnCls()} disabled={pending} onClick={() => run(() => overrideTotal(userId, r.target, Number(score), reason), (x) => x.ok && setOpen(null))}>Simpan override</button>
                    </div>
                  </td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface AttemptRow { key: string; questionId: string; purpose: string; module: string; text: string; attempts: number; correct: boolean; score: number; overridden: boolean; reason: string | null }

export function AttemptsTable({ userId, rows }: { userId: string; rows: AttemptRow[] }) {
  const { run, pending, msg } = useRun();
  const [open, setOpen] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [reason, setReason] = useState('');
  return (
    <div className="space-y-3">
      <Msg msg={msg} />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500"><tr><th className="py-2">Soal</th><th>Percobaan</th><th>Hasil</th><th>Skor</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.key}>
                <tr className="border-b border-slate-100 align-top">
                  <td className="max-w-md py-2"><p className="text-xs text-slate-500">{r.purpose} · {r.module}</p><p>{r.text}</p></td>
                  <td>{r.attempts}</td><td>{r.correct ? '✅ Benar' : '❌ Belum benar'}</td>
                  <td>{r.score}{r.overridden && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800" title={r.reason ?? ''}>override</span>}</td>
                  <td><button className={btnCls('ghost')} onClick={() => { setOpen(open === r.key ? null : r.key); setScore(String(r.score)); setReason(''); }}>Override</button></td>
                </tr>
                {open === r.key && (
                  <tr className="bg-slate-50"><td colSpan={5} className="p-3"><div className="flex flex-wrap items-end gap-3">
                    <input className={`${inputCls} w-28`} type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} aria-label="Nilai baru" />
                    <input className={`${inputCls} min-w-[220px] flex-1`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan override (wajib)" aria-label="Alasan" />
                    <button className={btnCls()} disabled={pending} onClick={() => run(() => overrideQuestion(userId, r.questionId, Number(score), reason), (x) => x.ok && setOpen(null))}>Simpan</button>
                  </div></td></tr>
                )}
              </Fragment>
            ))}
            {!rows.length && <tr><td colSpan={5} className="py-6 text-center text-slate-500">Belum ada jawaban.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}