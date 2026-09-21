'use client';

import { useState, useTransition } from 'react';
import type { Result } from '@/app/admin/actions';

export { btnCls, inputCls, labelCls } from '@/components/admin/styles';

/** Menjalankan server action dengan status pending + pesan hasil. */
export function useRun() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<Result | null>(null);
  const run = (fn: () => Promise<Result>, after?: (r: Result) => void) =>
    start(async () => {
      try { const r = await fn(); setMsg(r); after?.(r); } catch (e: any) { if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e; setMsg({ ok: false, message: e?.message ?? 'Terjadi kesalahan' }); }
    });
  return { run, pending, msg, clear: () => setMsg(null) };
}

export function Msg({ msg }: { msg: Result | null }) {
  if (!msg) return null;
  return <p role="status" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{msg.message}</p>;
}

export function Card({ title, children, actions }: { title?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {(title || actions) && <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">{title}</h2>{actions}</div>}
      {children}
    </section>
  );
}

export function Confirm({ text, onYes, children, className }: { text: string; onYes: () => void; children: React.ReactNode; className?: string }) {
  return <button type="button" className={className} onClick={() => { if (window.confirm(text)) onYes(); }}>{children}</button>;
}