import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/** Daftar siswa untuk dropdown login (hanya id, nama, kelas, avatar — TANPA PIN). */
export async function GET() {
  const { data, error } = await db()
    .from('profiles')
    .select('id, full_name, class_name, avatar_id')
    .eq('role', 'student')
    .order('class_name', { nullsFirst: false })
    .order('full_name');
  if (error) return NextResponse.json({ error: 'Gagal memuat daftar siswa.' }, { status: 500 });
  return NextResponse.json({ students: data ?? [] });
}
