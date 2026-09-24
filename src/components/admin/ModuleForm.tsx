'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveModule, uploadMedia } from '@/app/admin/actions';
import { btnCls, Card, inputCls, labelCls, Msg, useRun } from '@/components/admin/ui';
import { PLANETS } from '@/lib/planets';
import type { ExploreConfig, LearnCard, ModuleRow } from '@/lib/types';

const DEFAULT_EXPLORE: Record<string, ExploreConfig> = {
  planet_viewer: { type: 'planet_viewer', planets: ['bumi', 'mars'], min_seconds: 20, instruction: 'Geser planet dan ketuk titik kuning untuk fakta!' },
  day_night: { type: 'day_night', min_seconds: 25, instruction: 'Geser slider jam dan perhatikan perubahan siang dan malam.' },
  space_calculator: { type: 'space_calculator', min_seconds: 25, instruction: 'Masukkan berat dan umurmu, lalu bandingkan antarplanet.' },
  moon_phases: { type: 'moon_phases', min_seconds: 25, instruction: 'Geser posisi Bulan dan amati perubahan fase serta kapan gerhana bisa terjadi!' },
};

function Upload({ onDone }: { onDone: (url: string) => void }) {
  const { run, pending, msg } = useRun();
  return (
    <div className="text-xs">
      <label className={`${btnCls('ghost')} cursor-pointer`}>
        {pending ? 'Mengunggah...' : 'Unggah SVG/WebP/MP3'}
        <input type="file" className="hidden" accept=".svg,.webp,.png,.jpg,.jpeg,.mp3,image/*,audio/mpeg"
          onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const fd = new FormData(); fd.append('file', f); run(() => uploadMedia(fd), (r) => r.ok && onDone(r.data.url)); e.target.value = ''; }} />
      </label>
      {msg && !msg.ok && <span className="ml-2 text-rose-700">{msg.message}</span>}
    </div>
  );
}

export default function ModuleForm({ initial, isNew }: { initial: ModuleRow | null; isNew: boolean }) {
  const router = useRouter();
  const { run, pending, msg } = useRun();
  const [id, setId] = useState(initial?.id ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [planet, setPlanet] = useState(initial?.planet_name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [order, setOrder] = useState(initial?.order_index ?? 10);
  const [pub, setPub] = useState(initial?.is_published ?? false);
  const [cards, setCards] = useState<LearnCard[]>(initial?.learn_content?.length ? initial.learn_content : [{ title: '', body: '', emoji: '⭐' }]);
  const [explore, setExplore] = useState(JSON.stringify(initial?.explore_config ?? DEFAULT_EXPLORE.planet_viewer, null, 2));
  const [exploreErr, setExploreErr] = useState('');

  const patch = (i: number, p: Partial<LearnCard>) => setCards((cs) => cs.map((c, k) => (k === i ? { ...c, ...p } : c)));
  const move = (i: number, d: number) => setCards((cs) => { const n = [...cs]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j], n[i]]; return n; });

  const submit = () => {
    let cfg: unknown;
    try { cfg = JSON.parse(explore); setExploreErr(''); } catch { setExploreErr('JSON konfigurasi Explore tidak valid.'); return; }
    const clean = cards.map((c) => Object.fromEntries(Object.entries(c).filter(([, v]) => v !== '' && v != null)));
    run(() => saveModule({ id, title, planet_name: planet || null, description: desc || null, order_index: Number(order), is_published: pub, learn_content: clean, explore_config: cfg }, isNew),
      (r) => { if (r.ok && isNew) router.push(`/admin/modules/${id}`); else if (r.ok) router.refresh(); });
  };

  return (
    <div className="space-y-6">
      <Card title="Informasi modul">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelCls} htmlFor="mid">ID modul (slug)</label><input id="mid" className={`${inputCls} font-mono`} value={id} disabled={!isNew} onChange={(e) => setId(e.target.value)} placeholder="mars" /></div>
          <div><label className={labelCls} htmlFor="mt">Judul</label><input id="mt" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className={labelCls} htmlFor="mp">Planet ikon</label>
            <select id="mp" className={inputCls} value={planet} onChange={(e) => setPlanet(e.target.value)}><option value="">(Bumi)</option>{PLANETS.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
          <div><label className={labelCls} htmlFor="mo">Urutan tampil</label><input id="mo" type="number" className={inputCls} value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
          <div className="sm:col-span-2"><label className={labelCls} htmlFor="md">Deskripsi singkat</label><input id="md" className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} /> Terbitkan untuk siswa</label>
        </div>
      </Card>

      <Card title="Phase 1 — Learn (kartu cerita)" actions={<button className={btnCls('ghost')} onClick={() => setCards([...cards, { title: '', body: '', emoji: '⭐' }])}>+ Kartu</button>}>
        <div className="space-y-4">
          {cards.map((c, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">Kartu {i + 1}</p>
                <div className="space-x-1"><button className={btnCls('ghost')} onClick={() => move(i, -1)} aria-label="Naik">↑</button><button className={btnCls('ghost')} onClick={() => move(i, 1)} aria-label="Turun">↓</button>
                  <button className={btnCls('danger')} onClick={() => setCards(cards.filter((_, k) => k !== i))} disabled={cards.length === 1}>Hapus</button></div></div>
              <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                <div><label className={labelCls}>Emoji</label><input className={inputCls} value={c.emoji ?? ''} onChange={(e) => patch(i, { emoji: e.target.value })} /></div>
                <div><label className={labelCls}>Judul</label><input className={inputCls} value={c.title} onChange={(e) => patch(i, { title: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Isi materi</label><textarea className={`${inputCls} h-24`} value={c.body} onChange={(e) => patch(i, { body: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Analogi dunia nyata (opsional)</label><input className={inputCls} value={c.analogy ?? ''} onChange={(e) => patch(i, { analogy: e.target.value })} /></div>
                <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                  <div><label className={labelCls}>URL gambar (SVG/WebP)</label><input className={inputCls} value={c.image_url ?? ''} onChange={(e) => patch(i, { image_url: e.target.value })} /><div className="mt-1"><Upload onDone={(u) => patch(i, { image_url: u })} /></div></div>
                  <div><label className={labelCls}>URL audio MP3 (opsional; jika kosong pakai suara browser)</label><input className={inputCls} value={c.audio_url ?? ''} onChange={(e) => patch(i, { audio_url: e.target.value })} /><div className="mt-1"><Upload onDone={(u) => patch(i, { audio_url: u })} /></div></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Phase 2 — Explore (parameter simulasi)">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="text-sm text-slate-600">Isi templat:</span>
          {Object.entries(DEFAULT_EXPLORE).map(([k, v]) => <button key={k} className={btnCls('ghost')} onClick={() => setExplore(JSON.stringify(v, null, 2))}>{k}</button>)}
        </div>
        <textarea className={`${inputCls} h-48 font-mono text-xs`} value={explore} onChange={(e) => setExplore(e.target.value)} aria-label="Konfigurasi Explore JSON" spellCheck={false} />
        <p className="mt-2 text-xs text-slate-500">ID planet tersedia: {PLANETS.map((p) => p.id).join(', ')}. <code>min_seconds</code> = waktu minimal sebelum tombol “Selesai Menjelajah” aktif.</p>
        {exploreErr && <p className="mt-2 text-sm text-rose-700">{exploreErr}</p>}
      </Card>

      <div className="flex items-center gap-3"><button className={btnCls()} disabled={pending} onClick={submit}>{pending ? 'Menyimpan...' : 'Simpan modul'}</button><div className="flex-1"><Msg msg={msg} /></div></div>
    </div>
  );
}