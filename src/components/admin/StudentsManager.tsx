'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addStudents, deleteStudent, resetProgress, updateStudent } from '@/app/admin/actions';
import { btnCls, Card, Confirm, inputCls, labelCls, Msg, useRun } from '@/components/admin/ui';
import { AVATARS } from '@/lib/types';

interface S { id: string; full_name: string; class_name: string | null; pin_code: string | null; avatar_id: string | null }

function Row({ s }: { s: S }) {
  const { run, pending, msg } = useRun();
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState({ full_name: s.full_name, class_name: s.class_name ?? '', avatar_id: s.avatar_id ?? 'astro-1', pin_code: s.pin_code ?? '' });
  return (
    <>
      <tr className="border-b border-slate-100 align-top">
        {edit ? (
          <>
            <td className="py-2 pr-2"><input className={inputCls} value={v.full_name} onChange={(e) => setV({ ...v, full_name: e.target.value })} aria-label="Nama" /></td>
            <td className="pr-2"><input className={inputCls} value={v.class_name} onChange={(e) => setV({ ...v, class_name: e.target.value })} aria-label="Kelas" /></td>
            <td className="pr-2"><input className={`${inputCls} w-24 font-mono`} value={v.pin_code} maxLength={4} onChange={(e) => setV({ ...v, pin_code: e.target.value.replace(/\D/g, '') })} aria-label="PIN" /></td>
            <td className="pr-2"><select className={inputCls} value={v.avatar_id} onChange={(e) => setV({ ...v, avatar_id: e.target.value })} aria-label="Avatar">{Object.entries(AVATARS).map(([k, e]) => <option key={k} value={k}>{e} {k}</option>)}</select></td>
            <td className="space-x-1 whitespace-nowrap py-2">
              <button className={btnCls()} disabled={pending} onClick={() => run(() => updateStudent(s.id, v), (r) => r.ok && setEdit(false))}>Simpan</button>
              <button className={btnCls('ghost')} onClick={() => setEdit(false)}>Batal</button>
            </td>
          </>
        ) : (
          <>
            <td className="py-2 pr-2 font-medium">{s.full_name}</td><td className="pr-2">{s.class_name ?? '-'}</td>
            <td className="pr-2 font-mono tracking-widest">{s.pin_code}</td><td className="pr-2">{AVATARS[s.avatar_id ?? ''] ?? '🧑‍🚀'}</td>
            <td className="space-x-1 whitespace-nowrap py-2 print:hidden">
              <Link href={`/admin/gradebook/${s.id}`} className={btnCls('ghost')}>Nilai</Link>
              <button className={btnCls('ghost')} onClick={() => setEdit(true)}>Ubah</button>
              <Confirm className={btnCls('ghost')} text={`Reset SEMUA progres ${s.full_name}? Riwayat kuis, pre/post-test, dan survei akan dihapus.`} onYes={() => run(() => resetProgress(s.id, 'all'))}>Reset progres</Confirm>
              <Confirm className={btnCls('danger')} text={`Hapus ${s.full_name} beserta seluruh datanya?`} onYes={() => run(() => deleteStudent(s.id))}>Hapus</Confirm>
            </td>
          </>
        )}
      </tr>
      {msg && <tr><td colSpan={5} className="pb-2"><Msg msg={msg} /></td></tr>}
    </>
  );
}

export default function StudentsManager({ students }: { students: S[] }) {
  const [text, setText] = useState('');
  const [cls, setCls] = useState('');
  const { run, pending, msg } = useRun();
  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Card title="Tambah siswa (banyak sekaligus)">
          <p className="mb-3 text-sm text-slate-600">Satu siswa per baris: <code className="rounded bg-slate-100 px-1">Nama, Kelas</code> (kelas boleh dikosongkan bila diisi di kolom bawah). PIN 4 angka dibuat otomatis.</p>
          <textarea className={`${inputCls} h-32 font-mono`} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Ahmad Rizki, 5A\nBunga Lestari, 5A\nCandra Wijaya, 5B'} aria-label="Daftar siswa" />
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div><label className={labelCls} htmlFor="dc">Kelas bawaan</label><input id="dc" className={inputCls} value={cls} onChange={(e) => setCls(e.target.value)} placeholder="5A" /></div>
            <button className={btnCls()} disabled={pending || !text.trim()} onClick={() => run(() => addStudents(text, cls), (r) => r.ok && setText(''))}>Tambah siswa</button>
          </div>
          <div className="mt-3"><Msg msg={msg} /></div>
        </Card>
      </div>
      <Card title={`Daftar siswa (${students.length})`} actions={<button className={`${btnCls('ghost')} print:hidden`} onClick={() => window.print()}>Cetak daftar PIN</button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500"><tr><th className="py-2">Nama</th><th>Kelas</th><th>PIN</th><th>Avatar</th><th className="print:hidden">Aksi</th></tr></thead>
            <tbody>{students.map((s) => <Row key={s.id} s={s} />)}{!students.length && <tr><td colSpan={5} className="py-6 text-center text-slate-500">Belum ada siswa.</td></tr>}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
