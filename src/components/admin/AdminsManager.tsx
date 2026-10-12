'use client';

import { useState } from 'react';
import { createAdminAccount, resetAdminPassword, setAdminActive } from '@/app/admin/actions';
import { btnCls, Confirm, inputCls, labelCls, Msg, useRun } from '@/components/admin/ui';

export interface AdminRow {
  id: string;
  full_name: string;
  email: string;
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminsManager({ rows, selfId }: { rows: AdminRow[]; selfId: string }) {
  const { run, pending, msg } = useRun();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  function submitNew() {
    setTempPassword(null);
    run(
      () => createAdminAccount({ email, full_name: name }),
      (r) => {
        if (r.ok) {
          setEmail('');
          setName('');
          setTempPassword((r.data?.tempPassword as string) ?? null);
        }
      },
    );
  }

  function doReset(id: string) {
    setTempPassword(null);
    run(() => resetAdminPassword(id), (r) => {
      if (r.ok) setTempPassword((r.data?.tempPassword as string) ?? null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Tambah admin baru</h2>
        <Msg msg={msg} />
        {tempPassword && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Kata sandi sementara: <code className="font-mono font-bold">{tempPassword}</code>
            <br />
            Sampaikan lewat jalur aman (bukan chat/grup publik). Kata sandi ini hanya ditampilkan sekali — tidak bisa dilihat lagi setelah Anda meninggalkan halaman ini.
          </div>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nama</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama admin baru" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@sekolah.id" />
          </div>
        </div>
        <button className={`${btnCls()} mt-4`} disabled={pending || !email.trim() || !name.trim()} onClick={submitNew}>
          Buat akun admin
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">Nama</th>
              <th>Email</th>
              <th>Peran</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="p-3 font-medium">
                  {r.full_name}
                  {r.id === selfId && <span className="ml-2 text-xs text-slate-400">(Anda)</span>}
                </td>
                <td>{r.email}</td>
                <td>
                  {r.is_super_admin ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">Super Admin</span>
                  ) : (
                    'Admin'
                  )}
                </td>
                <td>
                  {r.is_active ? <span className="font-medium text-emerald-700">Aktif</span> : <span className="font-medium text-rose-700">Nonaktif</span>}
                </td>
                <td className="space-x-1 whitespace-nowrap p-3">
                  <Confirm
                    className={btnCls('ghost')}
                    text={`Reset kata sandi "${r.full_name}"? Kata sandi lama langsung tidak berlaku, dan yang baru hanya ditampilkan sekali di sini.`}
                    onYes={() => doReset(r.id)}
                  >
                    Reset Kata Sandi
                  </Confirm>
                  {!r.is_super_admin && r.id !== selfId && (
                    r.is_active ? (
                      <Confirm
                        className={btnCls('danger')}
                        text={`Nonaktifkan admin "${r.full_name}"? Admin ini tidak akan bisa login lagi sampai diaktifkan ulang.`}
                        onYes={() => run(() => setAdminActive(r.id, false))}
                      >
                        Nonaktifkan
                      </Confirm>
                    ) : (
                      <button className={btnCls('ghost')} disabled={pending} onClick={() => run(() => setAdminActive(r.id, true))}>
                        Aktifkan
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  Belum ada admin lain.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}