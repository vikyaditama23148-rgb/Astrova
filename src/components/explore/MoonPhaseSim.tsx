'use client';

import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface Props {
  value: number; // hari ke-0 s.d. 29 dalam siklus Bulan (0 = Bulan Baru)
  onChange: (v: number) => void;
  quiet?: boolean;
  min?: number; max?: number; step?: number;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const DAYS_IN_CYCLE = 29.5;

function phaseInfo(day: number) {
  const angle = (day / DAYS_IN_CYCLE) * 360; // 0° = segaris Matahari (Bulan Baru), 180° = berlawanan (Purnama)
  const a = ((angle % 360) + 360) % 360;
  if (a < 11 || a > 349) return { name: 'Bulan Baru', emoji: '🌑', note: 'Sisi terang Bulan membelakangi Bumi. Bulan hampir tak terlihat dari Bumi.' };
  if (a < 80) return { name: 'Sabit Awal', emoji: '🌒', note: 'Sedikit demi sedikit sisi terang Bulan mulai terlihat dari Bumi.' };
  if (a < 100) return { name: 'Kuartal Awal', emoji: '🌓', note: 'Separuh permukaan Bulan yang menghadap Bumi tampak terang.' };
  if (a < 169) return { name: 'Cembung Awal', emoji: '🌔', note: 'Sisi terang Bulan makin banyak yang terlihat dari Bumi.' };
  if (a < 191) return { name: 'Purnama', emoji: '🌕', note: 'Seluruh sisi Bulan yang menghadap Bumi terlihat terang!' };
  if (a < 260) return { name: 'Cembung Akhir', emoji: '🌖', note: 'Cahaya terang di Bulan mulai berkurang dari satu sisi.' };
  if (a < 280) return { name: 'Kuartal Akhir', emoji: '🌗', note: 'Separuh Bulan lainnya kini yang tampak terang.' };
  return { name: 'Sabit Akhir', emoji: '🌘', note: 'Bulan hampir kembali gelap sebelum siklus dimulai lagi.' };
}

function eclipseHint(day: number) {
  const a = (((day / DAYS_IN_CYCLE) * 360) % 360 + 360) % 360;
  if (a < 8 || a > 352) return { kind: 'sun', text: 'Bumi, Bulan, dan Matahari SEGARIS! Ini posisi Gerhana Matahari (Bulan menutupi Matahari).' };
  if (a > 172 && a < 188) return { kind: 'moon', text: 'Matahari, Bumi, dan Bulan SEGARIS! Ini posisi Gerhana Bulan (bayangan Bumi menutupi Bulan).' };
  return null;
}

/**
 * Simulasi Fase Bulan & Gerhana. Tampak dari atas Kutub Utara: Matahari tetap di
 * kanan, Bulan bisa digeser mengelilingi Bumi, dan panel kanan menampilkan wujud
 * Bulan yang dilihat dari Bumi (fase) sesuai posisinya.
 */
export default function MoonPhaseSim({ value, onChange, quiet = false, min = 0, max = 29.5, step = 0.5 }: Props) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => onChange((value + 0.3) % max), 90);
    return () => clearInterval(id);
  }, [playing, value, onChange, max]);

  const day = value;
  const angleDeg = (day / DAYS_IN_CYCLE) * 360;
  const rad = (angleDeg * Math.PI) / 180;
  const phase = phaseInfo(day);
  const eclipse = eclipseHint(day);

  // posisi Bulan pada orbit (tampak-atas): 0° dekat Matahari (kanan), berlawanan arah jarum jam
  const cx = 150, cy = 130, orbitR = 78, moonR = 9;
  const mx = cx + orbitR * Math.cos(rad);
  const my = cy - orbitR * Math.sin(rad) * 0.55; // orbit dipipihkan sedikit agar terlihat "dari atas"

  // fase Bulan dilihat dari Bumi: dihitung dari pertidaksamaan geometris
  // (BUKAN arc SVG yang gampang salah arah), sudah diverifikasi luasnya
  // cocok persis dengan rumus fisis (1 − cos θ) / 2 untuk semua sudut.
  const R = 46;
  const k = Math.cos(rad);
  const waxing = Math.sin(rad) >= 0;
  const N = 40;
  const litPoints: string = (() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const y = -R + (2 * R * i) / N;
      const half = Math.sqrt(Math.max(0, R * R - y * y));
      pts.push([waxing ? half : -half, y]);
    }
    for (let i = N; i >= 0; i--) {
      const y = -R + (2 * R * i) / N;
      const half = Math.sqrt(Math.max(0, R * R - y * y));
      pts.push([waxing ? k * half : -k * half, y]);
    }
    return pts.map(([x, y]) => `${(110 + x).toFixed(1)},${(100 + y).toFixed(1)}`).join(' ');
  })();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tampak dari luar angkasa: Bumi, orbit Bulan, arah Matahari */}
        <figure className="card-night overflow-hidden p-3">
          <svg viewBox="0 0 300 260" className="h-auto w-full" role="img" aria-label="Bumi dan orbit Bulan dilihat dari atas, Matahari di sebelah kanan">
            <defs>
              <radialGradient id="mp-earth" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#5fb0ff" /><stop offset="1" stopColor="#1748a8" /></radialGradient>
            </defs>
            {[-30, 0, 30].map((dy) => <line key={dy} x1="300" y1={cy + dy} x2={cx + orbitR + 20} y2={cy + dy * 0.7} stroke="#ffe08a" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="5 7" />)}
            <ellipse cx={cx} cy={cy} rx={orbitR} ry={orbitR * 0.55} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.5" strokeDasharray="3 6" />
            <circle cx={cx} cy={cy} r="22" fill="url(#mp-earth)" />
            <circle cx={mx} cy={my} r={moonR} fill={waxing ? '#e8e4d8' : '#8b8a86'} stroke="#fff" strokeWidth="1.2" />
            <circle cx={mx} cy={my} r={moonR} fill="#050512" opacity={1 - ((1 - Math.cos(rad)) / 2) * 0.85} />
            <text x={cx} y="240" textAnchor="middle" fill="#cfe3ff" fontSize="12">Bumi &amp; orbit Bulan dilihat dari atas</text>
            <text x="270" y="30" fill="#ffe08a" fontSize="12" fontWeight="700">☀️ Matahari</text>
          </svg>
        </figure>

        {/* Wujud Bulan dilihat dari Bumi */}
        <figure className="card-night overflow-hidden p-3">
          <svg viewBox="0 0 220 220" className="mx-auto h-auto w-4/5 max-w-[220px]" role="img" aria-label={`Bulan tampak dari Bumi: fase ${phase.name}`}>
            <circle cx="110" cy="100" r={R} fill="#3a3a42" />
            <polygon points={litPoints} fill="#f4f1de" />
            {Array.from({ length: 5 }).map((_, i) => (
              <circle key={i} cx={70 + i * 25} cy={70 + (i % 3) * 30} r={4 + (i % 2)} fill="#00000022" />
            ))}
          </svg>
          {!quiet && (
            <figcaption className="px-2 pt-2 text-center">
              <span className="font-display text-2xl font-semibold text-sun-300">{phase.emoji} {phase.name}</span>
              <p className="mt-1 text-sm text-indigo-100/90">{phase.note}</p>
            </figcaption>
          )}
        </figure>
      </div>

      {!quiet && eclipse && (
        <div className={`rounded-2xl border-2 px-4 py-3 text-center font-semibold ${eclipse.kind === 'sun' ? 'border-coral-500 bg-coral-500/15 text-coral-400' : 'border-grape-400 bg-grape-400/15 text-grape-300'}`}>
          🌘✨ {eclipse.text}
        </div>
      )}

      <div className="card-night p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <label htmlFor="moon-slider" className="font-display text-lg">Geser posisi Bulan</label>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
            {playing ? <><Pause size={18} /> Jeda</> : <><Play size={18} /> Putar</>}
          </button>
        </div>
        <input
          id="moon-slider" type="range" className="big-range" min={min} max={max} step={step} value={value}
          onChange={(e) => { setPlaying(false); onChange(Number(e.target.value)); }}
          aria-valuetext={`Hari ke-${value.toFixed(1)} dari siklus Bulan`}
        />
        <div className="mt-2 flex justify-between text-sm text-indigo-100/70"><span>🌑 Hari 0</span><span>🌓</span><span>🌕 Hari ~15</span><span>🌗</span><span>🌑 Hari ~29,5</span></div>
      </div>
    </div>
  );
}