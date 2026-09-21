'use client';

import { useState } from 'react';
import { saveAstroSettings } from '@/app/admin/actions';
import { btnCls, Card, inputCls, labelCls, Msg, useRun } from '@/components/admin/ui';
import type { AstroSettings } from '@/lib/astrobot';

export default function AstroForm({ initial }: { initial: AstroSettings }) {
  const [v, setV] = useState(initial);
  const { run, pending, msg } = useRun();
  return (
    <Card title="Pengaturan AstroBot">
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className={labelCls} htmlFor="am">Model Gemini</label><input id="am" className={`${inputCls} font-mono`} value={v.model} onChange={(e) => setV({ ...v, model: e.target.value })} /></div>
        <div><label className={labelCls} htmlFor="at">Batas token keluaran / balasan</label><input id="at" type="number" className={inputCls} value={v.max_output_tokens} onChange={(e) => setV({ ...v, max_output_tokens: Number(e.target.value) })} /></div>
        <div><label className={labelCls} htmlFor="al">Batas pesan / siswa / hari</label><input id="al" type="number" className={inputCls} value={v.daily_message_limit} onChange={(e) => setV({ ...v, daily_message_limit: Number(e.target.value) })} /></div>
        <label className="flex items-center gap-2 text-sm sm:col-span-3"><input type="checkbox" checked={v.enabled} onChange={(e) => setV({ ...v, enabled: e.target.checked })} /> AstroBot aktif</label>
        <div className="sm:col-span-3"><label className={labelCls} htmlFor="ap">System prompt</label><textarea id="ap" className={`${inputCls} h-64`} value={v.system_prompt} onChange={(e) => setV({ ...v, system_prompt: e.target.value })} /></div>
      </div>
      <div className="mt-4 flex items-center gap-3"><button className={btnCls()} disabled={pending} onClick={() => run(() => saveAstroSettings(v))}>Simpan</button><Msg msg={msg} /></div>
    </Card>
  );
}
