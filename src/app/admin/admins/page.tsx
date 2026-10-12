import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/supabase/admin';
import AdminsManager, { type AdminRow } from '@/components/admin/AdminsManager';

export const metadata = { title: 'Kelola Admin' };

export default async function AdminsPage() {
  const me = await requireAdmin();
  // Halaman ini hanya untuk super admin. Admin biasa yang mencoba membuka URL-nya langsung
  // akan dilempar balik ke dashboard (menunya pun memang tidak ditampilkan untuk mereka).
  if (!me.isSuperAdmin) redirect('/admin');

  const sb = db();
  const [{ data: profiles }, { data: userList }] = await Promise.all([
    sb.from('profiles').select('id, full_name, is_super_admin, is_active, created_at').eq('role', 'admin').order('created_at'),
    sb.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const emailById = Object.fromEntries((userList?.users ?? []).map((u) => [u.id, u.email ?? '-']));

  const rows: AdminRow[] = (profiles ?? []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    email: emailById[p.id] ?? '-',
    is_super_admin: !!p.is_super_admin,
    is_active: p.is_active !== false,
    created_at: p.created_at,
  }));

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">Kelola Admin</h1>
      <p className="text-sm text-slate-600">Hanya super admin yang bisa menambah akun admin baru, mereset kata sandi, atau menonaktifkan admin lain. Super admin sendiri tidak bisa dinonaktifkan.</p>
      <AdminsManager rows={rows} selfId={me.id} />
    </>
  );
}