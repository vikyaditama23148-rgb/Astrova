import 'server-only';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { db } from '@/lib/supabase/admin';

export interface AdminUser { id: string; name: string; isSuperAdmin: boolean }

/** Pastikan pemanggil adalah admin aktif (Supabase Auth + profiles.role = 'admin' + is_active). */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/admin/login');
  const { data: p } = await db().from('profiles').select('id, full_name, role, is_super_admin, is_active').eq('id', data.user.id).maybeSingle();
  if (!p || p.role !== 'admin' || p.is_active === false) redirect('/admin/login?error=forbidden');
  return { id: p.id, name: p.full_name, isSuperAdmin: !!p.is_super_admin };
}

/** Pastikan pemanggil adalah SUPER admin. Dipakai di dalam server action (bukan halaman) —
 *  melempar Error biasa (bukan redirect) supaya ditangkap `useRun` dan tampil sebagai pesan error. */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const me = await requireAdmin();
  if (!me.isSuperAdmin) throw new Error('Hanya super admin yang bisa mengelola akun admin lain.');
  return me;
}

/** Versi untuk Route Handler: kembalikan null (bukan redirect). */
export async function getAdminOrNull(): Promise<AdminUser | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await db().from('profiles').select('id, full_name, role, is_super_admin, is_active').eq('id', data.user.id).maybeSingle();
  if (!p || p.role !== 'admin' || p.is_active === false) return null;
  return { id: p.id, name: p.full_name, isSuperAdmin: !!p.is_super_admin };
}