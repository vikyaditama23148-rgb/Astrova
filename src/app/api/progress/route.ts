import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase/admin';
import { getStudentId } from '@/lib/session';

const schema = z.object({
  moduleId: z.string().min(1).max(50),
  action: z.enum(['learn_complete', 'explore_heartbeat', 'explore_complete']),
  seconds: z.number().int().min(0).max(30).optional(),
});

export async function POST(req: Request) {
  const userId = await getStudentId();
  if (!userId) return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  const { moduleId, action, seconds } = parsed.data;
  const sb = db();

  const { data: mod } = await sb.from('modules').select('id').eq('id', moduleId).eq('is_published', true).maybeSingle();
  if (!mod) return NextResponse.json({ error: 'Modul tidak ditemukan' }, { status: 404 });

  if (action === 'explore_heartbeat') {
    // Durasi dibatasi 30 dtk/permintaan agar log tidak membengkak.
    const { error } = await sb.rpc('increment_explore_time', { p_user: userId, p_module: moduleId, p_seconds: seconds ?? 10 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const patch = action === 'learn_complete' ? { learn_completed: true } : { explore_completed: true };
  const { error } = await sb
    .from('student_module_progress')
    .upsert({ user_id: userId, module_id: moduleId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id,module_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
