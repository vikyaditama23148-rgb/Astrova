import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import type { StudentSession } from '@/lib/types';

export const SESSION_COOKIE = 'ts_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET wajib diisi (minimal 32 karakter).');
  return new TextEncoder().encode(s);
}

export async function createStudentSession(p: { id: string; name: string; avatar: string }) {
  const token = await new SignJWT({ name: p.name, avatar: p.avatar, role: 'student' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(p.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearStudentSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Baca sesi dari cookie (tanpa cek database). Untuk Route Handler. */
export async function getStudentId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/** Untuk halaman siswa: pastikan login dan akun masih ada. */
export async function requireStudent(): Promise<StudentSession> {
  const id = await getStudentId();
  if (!id) redirect('/login');
  const { data } = await db()
    .from('profiles')
    .select('id, full_name, avatar_id, class_name, role')
    .eq('id', id)
    .eq('role', 'student')
    .maybeSingle();
  if (!data) redirect('/api/auth/logout?next=/login');
  return { id: data.id, name: data.full_name, avatar: data.avatar_id ?? 'astro-1', className: data.class_name };
}
