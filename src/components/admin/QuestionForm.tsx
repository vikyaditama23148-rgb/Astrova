'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteQuestion, saveQuestion } from '@/app/admin/actions';
import { btnCls, Card, Confirm, inputCls, labelCls, Msg, useRun } from '@/components/admin/ui';
import { PURPOSE_LABEL, QUESTION_TYPE_LABEL, type QuestionType, type QuizPurpose } from '@/lib/types';

const TEMPLATES: Record<QuestionType, { data: object; key: object; help: string }> = {
  multiple_choice: {
    data: { options: [{ id: 'a', text: 'Opsi A' }, { id: 'b', text: 'Opsi B' }, { id: 'c', text: 'Opsi C' }, { id: 'd', text: 'Opsi D' }] },
    key: { optionId: 'a' }, help: 'Untuk Pre/Post-Test. Kunci: {"optionId":"a"}',
  },
  scenario: {
    data: { story: 'Cerita singkat...', choices: [{ id: 'a', text: 'Pilihan A', emoji: '🚀' }, { id: 'b', text: 'Pilihan B', emoji: '🌍' }], hint: 'Petunjuk untuk siswa', hint_sim: { type: 'planet_viewer', planets: ['mars'] } },
    key: { choiceId: 'a' }, help: 'Kunci: {"choiceId":"a"} (atau "choiceIds":["a","b"] bila lebih dari satu benar)',
  },
  drag_drop: {
    data: { items: [{ id: 'i1', label: 'Item 1', emoji: '🔴' }, { id: 'i2', label: 'Item 2', emoji: '🔵' }], categories: [{ id: 'c1', label: 'Kelompok 1', emoji: '🔥' }, { id: 'c2', label: 'Kelompok 2', emoji: '❄️' }], hint: 'Petunjuk' },
    key: { mapping: { i1: 'c1', i2: 'c2' } }, help: 'Kunci: {"mapping":{"idItem":"idKategori"}} — semua item wajib ada.',
  },
  ordering: {
    data: { items: [{ id: 'x', label: 'B', emoji: '🔵' }, { id: 'y', label: 'A', emoji: '🔴' }], top_label: 'Paling ...', bottom_label: 'Paling ...', hint: 'Petunjuk' },
    key: { order: ['y', 'x'] }, help: 'Susun item di data secara ACAK. Kunci: urutan benar dari atas ke bawah.',
  },
  hotspot: {
    data: { planet: 'mars', hotspots: [{ id: 'h1', x: 36, y: 45, label: 'Fakta benar' }, { id: 'h2', x: 60, y: 60, label: 'Fakta SALAH' }], hint: 'Petunjuk' },
    key: { hotspotId: 'h2' }, help: 'x,y = posisi titik dalam % (planet berada di sekitar 25–75). Kunci: id hotspot yang salah.',
  },
  simulation_driven: {
    data: { sim: 'day_night', slider: { min: 0, max: 24, step: 0.5, initial: 6 }, hint: 'Petunjuk', hint_sim: { type: 'day_night' } },
    key: { ranges: [[11.5, 12.5]] }, help: 'Kunci: {"ranges":[[min,max],...]} — nilai slider (jam) yang dianggap benar.',
  },
};

interface Init { id?: string; purpose: QuizPurpose; module_id: string | null; question_type: QuestionType; question_text: string; explanation: string | null; order_index: number; question_data_json: any; correct_answer_json: any }

export default function QuestionForm({ initial, modules }: { initial: Init | null; modules: { id: string; title: string }[] }) {
  const router = useRouter();
  const { run, pending, msg } = useRun();
  const [purpose, setPurpose] = useState<QuizPurpose>(initial?.purpose ?? 'module_test');
  const [moduleId, setModuleId] = useState(initial?.module_id ?? modules[0]?.id ?? '');
  const [type, setType] = useState<QuestionType>(initial?.question_type ?? 'scenario');
  const [text, setText] = useState(initial?.question_text ?? '');
  const [expl, setExpl] = useState(initial?.explanation ?? '');
  const [order, setOrder] = useState(initial?.order_index ?? 0);
  const [data, setData] = useState(JSON.stringify(initial?.question_data_json ?? TEMPLATES.scenario.data, null, 2));
  const [key, setKey] = useState(JSON.stringify(initial?.correct_answer_json ?? TEMPLATES.scenario.key, null, 2));
  const [err, setErr] = useState('');

  const pickType = (t: QuestionType) => { setType(t); if (!initial?.id || window.confirm('Ganti tipe akan menimpa data & kunci dengan templat. Lanjutkan?')) { setData(JSON.stringify(TEMPLATES[t].data, null, 2)); setKey(JSON.stringify(TEMPLATES[t].key, null, 2)); } };
  const pickPurpose = (p: QuizPurpose) => { setPurpose(p); if (p !== 'module_test' && type !== 'multiple_choice') pickType('multiple_choice'); };

  const submit = () => {
    let d: unknown, k: unknown;
    try { d = JSON.parse(data); k = JSON.parse(key); setErr(''); } catch { setErr('JSON pada data soal atau kunci jawaban tidak valid.'); return; }
    run(() => saveQuestion({ id: initial?.id, purpose, module_id: purpose === 'module_test' ? moduleId : null, question_type: type, question_text: text, explanation: expl || null, order_index: Number(order), question_data_json: d, correct_answer_json: k }),
      (r) => { if (r.ok) { if (!initial?.id) router.push(`/admin/questions/${r.data.id}`); else router.refresh(); } });
  };

  return (
    <div className="space-y-6">
      <Card title="Detail soal">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelCls} htmlFor="qp">Tujuan</label><select id="qp" className={inputCls} value={purpose} onChange={(e) => pickPurpose(e.target.value as QuizPurpose)}>{Object.entries(PURPOSE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          {purpose === 'module_test' && <div><label className={labelCls} htmlFor="qm">Modul</label><select id="qm" className={inputCls} value={moduleId} onChange={(e) => setModuleId(e.target.value)}>{modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>}
          <div><label className={labelCls} htmlFor="qt">Tipe soal</label>
            <select id="qt" className={inputCls} value={type} onChange={(e) => pickType(e.target.value as QuestionType)}>{(Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).filter((t) => purpose === 'module_test' || t === 'multiple_choice').map((t) => <option key={t} value={t}>{QUESTION_TYPE_LABEL[t]}</option>)}</select></div>
          <div><label className={labelCls} htmlFor="qo">Urutan</label><input id="qo" type="number" className={inputCls} value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
          <div className="sm:col-span-2"><label className={labelCls} htmlFor="qq">Teks soal</label><textarea id="qq" className={`${inputCls} h-20`} value={text} onChange={(e) => setText(e.target.value)} /></div>
          <div className="sm:col-span-2"><label className={labelCls} htmlFor="qe">Penjelasan (tampil setelah benar / setelah 3 percobaan)</label><textarea id="qe" className={`${inputCls} h-16`} value={expl} onChange={(e) => setExpl(e.target.value)} /></div>
        </div>
      </Card>
      <Card title="Data soal & kunci jawaban">
        <p className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">{TEMPLATES[type].help}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div><label className={labelCls} htmlFor="qd">question_data_json <span className="font-normal text-slate-500">(dilihat siswa)</span></label><textarea id="qd" className={`${inputCls} h-80 font-mono text-xs`} spellCheck={false} value={data} onChange={(e) => setData(e.target.value)} /></div>
          <div><label className={labelCls} htmlFor="qk">correct_answer_json <span className="font-normal text-slate-500">(rahasia, hanya server)</span></label><textarea id="qk" className={`${inputCls} h-80 font-mono text-xs`} spellCheck={false} value={key} onChange={(e) => setKey(e.target.value)} /></div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Hint: tambahkan <code>"hint"</code> (teks) dan <code>"hint_sim"</code> (mis. <code>{'{"type":"planet_viewer","planets":["mars"]}'}</code>) di data soal untuk tombol “Intip Simulasi”. Bila kunci jawaban diubah, semua jawaban siswa dinilai ulang otomatis.</p>
        {err && <p className="mt-2 text-sm text-rose-700">{err}</p>}
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <button className={btnCls()} disabled={pending} onClick={submit}>{pending ? 'Menyimpan...' : 'Simpan soal'}</button>
        {initial?.id && <Confirm className={btnCls('danger')} text="Hapus soal ini? Jawaban siswa untuk soal ini ikut terhapus." onYes={() => run(() => deleteQuestion(initial.id!), (r) => r.ok && router.push('/admin/questions'))}>Hapus</Confirm>}
        <div className="min-w-0 flex-1"><Msg msg={msg} /></div>
      </div>
    </div>
  );
}
