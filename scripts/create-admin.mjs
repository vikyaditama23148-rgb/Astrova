// Pakai: npm run create-admin -- email@sekolah.id "KataSandiKuat123" "Nama Peneliti"
import { createClient } from '@supabase/supabase-js';

try { process.loadEnvFile('.env.local'); } catch { /* .env.local tidak ada — pakai env proses */ }

const [email, password, name = 'Admin Astrova'] = process.argv.slice(2);
if (!email || !password) { console.error('Pemakaian: npm run create-admin -- <email> <password> [nama]'); process.exit(1); }
if (password.length < 8) { console.error('Kata sandi minimal 8 karakter.'); process.exit(1); }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local'); process.exit(1); }

const sb = createClient(url, key, { auth: { persistSession: false } });
let userId;
const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  if (!/already|registered|exists/i.test(error.message)) { console.error('Gagal:', error.message); process.exit(1); }
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
  userId = list?.users.find((u) => u.email === email)?.id;
  if (!userId) { console.error('User sudah ada tetapi tidak ditemukan.'); process.exit(1); }
  await sb.auth.admin.updateUserById(userId, { password });
} else userId = data.user.id;

const { error: e2 } = await sb.from('profiles').upsert({ id: userId, full_name: name, role: 'admin' }, { onConflict: 'id' });
if (e2) { console.error('Gagal membuat profil admin:', e2.message, '\nPastikan schema.sql sudah dijalankan.'); process.exit(1); }
console.log(`✅ Admin siap: ${email}\nMasuk di /admin/login`);
