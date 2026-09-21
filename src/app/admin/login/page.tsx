import Link from 'next/link';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Masuk Admin' };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-lg">
        <p className="text-3xl" aria-hidden>🛰️</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Astrova Mission Control</h1>
        <p className="mb-5 text-sm text-slate-600">Masuk untuk guru / peneliti.</p>
        <LoginForm forbidden={error === 'forbidden'} />
        <p className="mt-5 text-center text-sm"><Link href="/" className="text-indigo-600 hover:underline">Kembali ke situs siswa</Link></p>
      </div>
    </div>
  );
}
