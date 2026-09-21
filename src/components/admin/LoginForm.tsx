'use client';

import { useActionState } from 'react';
import { adminLogin, type Result } from '@/app/admin/actions';
import { btnCls, inputCls, labelCls } from '@/components/admin/ui';

export default function LoginForm({ forbidden }: { forbidden?: boolean }) {
  const [state, action, pending] = useActionState<Result | null, FormData>(adminLogin, null);
  return (
    <form action={action} className="space-y-4">
      {forbidden && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Akun ini belum memiliki peran admin.</p>}
      <div><label className={labelCls} htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="password">Kata sandi</label><input id="password" name="password" type="password" required autoComplete="current-password" className={inputCls} /></div>
      {state && !state.ok && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{state.message}</p>}
      <button className={`${btnCls()} w-full`} disabled={pending}>{pending ? 'Memeriksa...' : 'Masuk'}</button>
    </form>
  );
}
