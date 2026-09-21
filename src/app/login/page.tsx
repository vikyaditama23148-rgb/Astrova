'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Delete, Loader2 } from 'lucide-react';
import { avatarEmoji } from '@/lib/types';

interface S { id: string; full_name: string; class_name: string | null; avatar_id: string }

export default function LoginPage() {
  const router = useRouter();
  const [students, setStudents] = useState<S[] | null>(null);
  const [cls, setCls] = useState('');
  const [uid, setUid] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/auth/students').then((r) => r.json()).then((j) => setStudents(j.students ?? [])).catch(() => { setStudents([]); setErr('Daftar siswa gagal dimuat.'); });
  }, []);

  const classes = useMemo(() => Array.from(new Set((students ?? []).map((s) => s.class_name ?? 'Tanpa kelas'))).sort(), [students]);
  const names = useMemo(() => (students ?? []).filter((s) => (s.class_name ?? 'Tanpa kelas') === cls), [students, cls]);
  const me = students?.find((s) => s.id === uid);

  useEffect(() => { if (classes.length === 1) setCls(classes[0]); }, [classes]);

  const press = (d: string) => { setErr(''); setPin((p) => (p.length < 4 ? p + d : p)); };
  const submit = async (code = pin) => {
    if (!uid || code.length !== 4) return;
    setBusy(true); setErr('');
    const res = await fetch('/api/auth/student-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, pin: code }) });
    if (res.ok) { router.replace('/hub'); router.refresh(); return; }
    const j = await res.json().catch(() => ({}));
    setErr(j.error ?? 'Gagal masuk. Coba lagi.'); setPin(''); setBusy(false);
  };
  useEffect(() => { if (pin.length === 4) submit(pin); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pin]);

  const sel = 'mt-1 h-14 w-full rounded-2xl border-2 border-white/25 bg-night-800 px-4 text-lg text-white';
  return (
    <div className="space-bg grid place-items-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-night w-full max-w-md space-y-5 p-6">
        <div className="text-center">
          <p className="text-5xl" aria-hidden>{me ? avatarEmoji(me.avatar_id) : '🧑‍🚀'}</p>
          <h1 className="mt-2 text-3xl font-semibold">Absen Penjelajah</h1>
          <p className="text-indigo-100">Pilih namamu, lalu ketik PIN 4 angka.</p>
        </div>

        {students === null ? <p className="text-center"><Loader2 className="mx-auto animate-spin" /></p> : students.length === 0 ? (
          <p className="rounded-2xl bg-white/10 p-4 text-center">Belum ada siswa terdaftar. Minta gurumu menambahkannya di panel admin.</p>
        ) : (
          <>
            {classes.length > 1 && (
              <label className="block font-display text-lg">Kelas
                <select className={sel} value={cls} onChange={(e) => { setCls(e.target.value); setUid(''); setPin(''); }}>
                  <option value="">Pilih kelas...</option>{classes.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            )}
            <label className="block font-display text-lg">Namaku
              <select className={sel} value={uid} disabled={!cls} onChange={(e) => { setUid(e.target.value); setPin(''); setErr(''); }}>
                <option value="">Pilih namamu...</option>{names.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </label>

            {uid && (
              <div>
                <div className="mb-3 flex justify-center gap-3" aria-label={`PIN terisi ${pin.length} dari 4 angka`}>
                  {[0, 1, 2, 3].map((i) => <span key={i} className={`h-5 w-5 rounded-full border-2 ${i < pin.length ? 'border-sun-400 bg-sun-400' : 'border-white/40'}`} />)}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} type="button" disabled={busy} onClick={() => press(d)} className="btn btn-ghost !min-h-16 !text-2xl">{d}</button>)}
                  <span />
                  <button type="button" disabled={busy} onClick={() => press('0')} className="btn btn-ghost !min-h-16 !text-2xl">0</button>
                  <button type="button" disabled={busy} onClick={() => setPin((p) => p.slice(0, -1))} className="btn btn-ghost !min-h-16" aria-label="Hapus"><Delete /></button>
                </div>
              </div>
            )}
          </>
        )}
        {busy && <p className="text-center"><Loader2 className="mx-auto animate-spin" /></p>}
        {err && <p role="alert" className="rounded-2xl border-2 border-coral-500 bg-coral-500/15 p-3 text-center">{err}</p>}
        <p className="text-center text-sm"><Link href="/" className="text-indigo-200 underline">Kembali</Link></p>
      </motion.div>
    </div>
  );
}
