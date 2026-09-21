import AstroForm from '@/components/admin/AstroForm';
import { Card } from '@/components/admin/ui';
import { getAstroSettings } from '@/lib/astrobot';
import { db } from '@/lib/supabase/admin';

export const metadata = { title: 'AstroBot' };

export default async function AstroPage() {
  const sb = db();
  const settings = await getAstroSettings();
  const { data: logs } = await sb.from('chat_logs').select('id, user_id, module_id, user_message, bot_message, tokens_used, created_at').order('created_at', { ascending: false }).limit(100);
  const ids = Array.from(new Set((logs ?? []).map((l: any) => l.user_id)));
  const { data: ps } = ids.length ? await sb.from('profiles').select('id, full_name').in('id', ids) : { data: [] as any[] };
  const name = Object.fromEntries((ps ?? []).map((p: any) => [p.id, p.full_name]));
  const since = new Date(); since.setHours(0, 0, 0, 0);
  const { count: today } = await sb.from('chat_logs').select('id', { count: 'exact', head: true }).gte('created_at', since.toISOString());
  const tokens = (logs ?? []).reduce((a: number, l: any) => a + (l.tokens_used ?? 0), 0);
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">AstroBot</h1>
      <p className="text-sm text-slate-600">Pesan hari ini: <b>{today ?? 0}</b> · Token pada 100 percakapan terakhir: <b>{tokens.toLocaleString('id-ID')}</b></p>
      <AstroForm initial={settings} />
      <Card title="Log percakapan terbaru (100)">
        <div className="space-y-3">
          {(logs ?? []).map((l: any) => (
            <div key={l.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="mb-1 text-xs text-slate-500">{new Date(l.created_at).toLocaleString('id-ID')} · {name[l.user_id] ?? 'siswa dihapus'}{l.module_id ? ` · ${l.module_id}` : ''} · {l.tokens_used} token</p>
              <p><b>Siswa:</b> {l.user_message}</p><p className="text-indigo-800"><b>AstroBot:</b> {l.bot_message}</p>
            </div>
          ))}
          {!logs?.length && <p className="text-sm text-slate-500">Belum ada percakapan.</p>}
        </div>
      </Card>
    </>
  );
}
