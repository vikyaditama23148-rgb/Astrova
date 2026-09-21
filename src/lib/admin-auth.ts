import 'server-only';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { db } from '@/lib/supabase/admin';

export interface AdminUser { id: string; name: string }

/** Pastikan pemanggil adalah admin (Supabase Auth + profiles.role = 'admin'). */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/admin/login');
  const { data: p } = await db().from('profiles').select('id, full_name, role').eq('id', data.user.id).maybeSingle();
  if (!p || p.role !== 'admin') redirect('/admin/login?error=forbidden');
  return { id: p.id, name: p.full_name };
}

/** Versi untuk Route Handler: kembalikan null (bukan redirect). */
export async function getAdminOrNull(): Promise<AdminUser | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await db().from('profiles').select('id, full_name, role').eq('id', data.user.id).maybeSingle();
  if (!p || p.role !== 'admin') return null;
  return { id: p.id, name: p.full_name };
}
