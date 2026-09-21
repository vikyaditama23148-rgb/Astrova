import { LogOut } from 'lucide-react';
import Link from 'next/link';
import AstroBot from '@/components/AstroBot';
import { requireStudent } from '@/lib/session';
import { avatarEmoji } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const me = await requireStudent();
  return (
    <div className="space-bg">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/hub" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-sun-400 text-xl">🪐</span> Astrova
        </Link>
        <div className="flex items-center gap-3">
          <span className="chip max-w-[46vw] truncate"><span aria-hidden>{avatarEmoji(me.avatar)}</span> {me.name}</span>
          <form action="/api/auth/logout?next=/" method="post">
            <button className="btn btn-ghost btn-sm" aria-label="Keluar"><LogOut size={18} /><span className="hidden sm:inline">Keluar</span></button>
          </form>
        </div>
      </header>
      <main>{children}</main>
      <AstroBot />
    </div>
  );
}
