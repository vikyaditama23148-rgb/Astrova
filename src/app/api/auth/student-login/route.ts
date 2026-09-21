import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase/admin';
import { createStudentSession } from '@/lib/session';

const schema = z.object({ userId: z.string().uuid(), pin: z.string().regex(/^\d{4,10}$/) });

// Pembatas percobaan sederhana (per instance server): 5 salah → tunggu 60 detik.
const fails = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Pilih namamu dan isi PIN dengan angka.' }, { status: 400 });
  const { userId, pin } = parsed.data;

  const f = fails.get(userId);
  if (f && f.n >= 5 && f.until > Date.now()) {
    const wait = Math.ceil((f.until - Date.now()) / 1000);
    return NextResponse.json({ error: `Terlalu banyak salah. Coba lagi ${wait} detik lagi ya.` }, { status: 429 });
  }

  const { data } = await db()
    .from('profiles')
    .select('id, full_name, avatar_id, pin_code, role')
    .eq('id', userId)
    .eq('role', 'student')
    .maybeSingle();

  if (!data || data.pin_code !== pin) {
    const cur = fails.get(userId);
    fails.set(userId, { n: (cur?.n ?? 0) + 1, until: Date.now() + 60_000 });
    return NextResponse.json({ error: 'PIN belum tepat. Coba lagi ya!' }, { status: 401 });
  }
  fails.delete(userId);
  await createStudentSession({ id: data.id, name: data.full_name, avatar: data.avatar_id ?? 'astro-1' });
  return NextResponse.json({ ok: true });
}
