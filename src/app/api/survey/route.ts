import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase/admin';
import { getStudentId } from '@/lib/session';

const schema = z.object({ rating: z.number().int().min(1).max(5), text: z.string().max(500).optional() });

export async function POST(req: Request) {
  const userId = await getStudentId();
  if (!userId) return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  const { error } = await db()
    .from('usability_feedback')
    .upsert({ user_id: userId, rating_emoji: parsed.data.rating, feedback_text: parsed.data.text?.trim() || null }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
