'use client';

import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  avatar?: string;
  name?: string;
  /** Sembunyikan keterangan aktivitas (dipakai di soal agar tidak membocorkan jawaban). */
  quiet?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

type RGB = [number, number, number];
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;
const css = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export const formatHour = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}.${String(mm).padStart(2, '0')}`;
};

function activity(h: number) {
  if (h < 4.5) return { part: 'Malam', text: 'tidur nyenyak' };
  if (h < 6.5) return { part: 'Subuh', text: 'bersiap-siap bangun' };
  if (h < 11) return { part: 'Pagi', text: 'belajar di sekolah' };
  if (h < 13) return { part: 'Siang', text: 'makan siang' };
  if (h < 17) return { part: 'Siang menjelang sore', text: 'bermain bersama teman' };
  if (h < 19) return { part: 'Sore', text: 'melihat Matahari terbenam' };
  if (h < 21) return { part: 'Malam', text: 'makan malam bersama keluarga' };
  return { part: 'Malam', text: 'tidur nyenyak' };
}

/**
 * Simulasi rotasi Bumi. Tampak atas dari Kutub Utara: Matahari di kanan, Bumi berputar
 * berlawanan arah jarum jam (barat → timur). Marker 🇮🇩 menunjukkan posisi Indonesia.
 */
export default function DayNightSim({ value, onChange, avatar = '🧒', name = 'Rani', quiet = false, min = 0, max = 24, step = 0.5 }: Props) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => onChange(((value + 0.25) % 24)), 60);
    return () => clearInterval(id);
  }, [playing, value, onChange]);

  const h = value;
  const phi = (h - 12) * 15; // derajat CCW dari arah Matahari
  const rad = (phi * Math.PI) / 180;
  const alt = Math.cos(rad); // ketinggian Matahari (−1..1)
  const daylight = smooth(-0.12, 0.3, alt);
  const glow = 1 - smooth(0.05, 0.4, Math.abs(alt)); // fajar/senja

  // langit
  const night: RGB = [8, 12, 45], day: RGB = [92, 184, 255], dusk: RGB = [255, 144, 96];
  const sky = mix(mix(night, day, daylight), dusk, glow * 0.65 * (alt > -0.2 ? 1 : 0));
  const skyTop = mix(sky, [10, 14, 50], 0.35);

  // posisi Matahari/Bulan di panel langit (timur di kiri → barat di kanan)
  const sunT = (h - 6) / 12; // 0..1 saat siang
  const moonH = h < 6 ? h + 24 : h;
  const moonT = (moonH - 18) / 12;
  const arc = (t: number) => ({ x: 40 + 280 * t, y: 128 - 100 * Math.sin(Math.PI * clamp(t, 0, 1)) });
  const sunPos = arc(sunT);
  const moonPos = arc(moonT);
  const sunVisible = sunT >= -0.02 && sunT <= 1.02;
  const moonVisible = moonT >= -0.02 && moonT <= 1.02;

  const cx = 150, cy = 130, R = 78;
  const act = activity(h);
  const isNight = daylight < 0.15;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tampak dari luar angkasa */}
        <figure className="card-night overflow-hidden p-3">
          <svg viewBox="0 0 360 260" className="h-auto w-full" role="img" aria-label="Bumi dilihat dari atas Kutub Utara dengan Matahari di sebelah kanan">
            <defs>
              <radialGradient id="dn-sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff3b0" /><stop offset="0.5" stopColor="#ffc93c" /><stop offset="1" stopColor="#ff8a00" stopOpacity="0" /></radialGradient>
              <clipPath id="dn-clip"><circle cx={cx} cy={cy} r={R} /></clipPath>
              <radialGradient id="dn-earth" cx="0.65" cy="0.4" r="0.8"><stop offset="0" stopColor="#5fb0ff" /><stop offset="1" stopColor="#1748a8" /></radialGradient>
            </defs>
            <circle cx="345" cy={cy} r="70" fill="url(#dn-sun)" />
            {[-40, -20, 0, 20, 40].map((dy) => (
              <line key={dy} x1="290" y1={cy + dy} x2={cx + R + 8} y2={cy + dy * 0.9} stroke="#ffe08a" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="6 8" />
            ))}
            <circle cx={cx} cy={cy} r={R} fill="url(#dn-earth)" />
            <g clipPath="url(#dn-clip)">
              <g transform={`rotate(${-phi} ${cx} ${cy})`}>
                <ellipse cx={cx + 40} cy={cy - 12} rx="22" ry="12" fill="#3f9d5b" />
                <ellipse cx={cx + 52} cy={cy + 14} rx="14" ry="8" fill="#3f9d5b" />
                <ellipse cx={cx - 18} cy={cy - 42} rx="24" ry="14" fill="#4aa866" />
                <ellipse cx={cx - 40} cy={cy + 30} rx="20" ry="11" fill="#3f9d5b" />
                <ellipse cx={cx + 6} cy={cy + 52} rx="16" ry="8" fill="#4aa866" />
                <ellipse cx={cx + 66} cy={cy} rx="10" ry="6" fill="#2f7d47" />
              </g>
              {/* sisi malam */}
              <rect x={cx - R} y={cy - R} width={R} height={R * 2} fill="#050826" opacity="0.72" />
              <rect x={cx - 6} y={cy - R} width="12" height={R * 2} fill="#ff9a5c" opacity="0.18" />
            </g>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="#9fd0ff" strokeOpacity="0.45" strokeWidth="2" />
            {/* rotasi */}
            <path d={`M ${cx - 40} ${cy - 88} A 96 96 0 0 0 ${cx - 96} ${cy - 20}`} fill="none" stroke="#8ff0ee" strokeWidth="3" markerEnd="url(#dn-arrow)" opacity="0.9" />
            <defs><marker id="dn-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#8ff0ee" /></marker></defs>
            <circle cx={cx} cy={cy} r="3" fill="#fff" />
            {/* marker Indonesia */}
            <g transform={`translate(${cx + R * 0.86 * Math.cos(rad)} ${cy - R * 0.86 * Math.sin(rad)})`}>
              <circle r="13" fill="#ff6b4a" stroke="#fff" strokeWidth="3" />
              <text textAnchor="middle" dy="4.5" fontSize="12">📍</text>
            </g>
            <text x="345" y="234" textAnchor="middle" fill="#ffe08a" fontSize="13" fontWeight="700">Matahari</text>
            <text x={cx} y="240" textAnchor="middle" fill="#cfe3ff" fontSize="12">Bumi dilihat dari atas Kutub Utara</text>
            <text x={cx - R - 6} y={cy - R + 8} textAnchor="end" fill="#9aa6ff" fontSize="11">sisi malam</text>
            <text x={cx + R + 4} y={cy - R - 2} fill="#ffe08a" fontSize="11">sisi siang</text>
          </svg>
          <figcaption className="px-2 pt-1 text-center text-sm text-indigo-100/80">📍 = tempat {name} tinggal di Indonesia</figcaption>
        </figure>

        {/* Pemandangan dari tempat Rani */}
        <figure className="card-night overflow-hidden p-3">
          <svg viewBox="0 0 360 200" className="h-auto w-full rounded-2xl" role="img" aria-label={`Langit di Indonesia pukul ${formatHour(h)}`}>
            <defs>
              <linearGradient id="dn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={css(skyTop)} /><stop offset="1" stopColor={css(sky)} /></linearGradient>
            </defs>
            <rect width="360" height="200" fill="url(#dn-sky)" />
            {[[30, 30], [80, 60], [140, 25], [210, 50], [260, 20], [320, 45], [175, 78], [300, 88], [55, 100]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.2} fill="#fff" opacity={clamp(1 - daylight * 1.6) * 0.95} />
            ))}
            {sunVisible && <g transform={`translate(${sunPos.x} ${sunPos.y})`}><circle r="26" fill="#ffd54a" opacity="0.28" /><circle r="16" fill="#ffc93c" /></g>}
            {moonVisible && <g transform={`translate(${moonPos.x} ${moonPos.y})`} opacity={clamp(1 - daylight * 1.5)}><circle r="13" fill="#f4f1de" /><circle cx="5" cy="-3" r="12" fill={css(sky)} opacity="0.85" /></g>}
            <text x="10" y="18" fill="#fff" opacity="0.7" fontSize="11">Timur</text>
            <text x="350" y="18" fill="#fff" opacity="0.7" fontSize="11" textAnchor="end">Barat</text>
            {/* tanah + rumah */}
            <path d="M0 150 Q90 132 180 146 T360 140 V200 H0 Z" fill={css(mix([22, 60, 36], [70, 176, 96], daylight))} />
            <g transform="translate(232 108)">
              <rect x="0" y="22" width="56" height="34" fill={css(mix([70, 50, 44], [255, 224, 178], daylight))} />
              <path d="M-6 24 L28 0 L62 24 Z" fill={css(mix([60, 30, 30], [215, 88, 58], daylight))} />
              <rect x="22" y="34" width="12" height="22" fill="#5b3a29" />
              <rect x="6" y="30" width="10" height="10" fill={isNight ? '#ffe08a' : '#a8d8ff'} />
            </g>
            <text x="120" y="152" fontSize="38" textAnchor="middle">{isNight ? '😴' : avatar}</text>
          </svg>
          <figcaption className="px-2 pt-2 text-center">
            <span className="font-display text-2xl font-semibold text-sun-300">Pukul {formatHour(h)} WIB</span>
            {!quiet && <p className="text-sm text-indigo-100/90">{act.part}: {name} {act.text}</p>}
          </figcaption>
        </figure>
      </div>

      <div className="card-night p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <label htmlFor="hour-slider" className="font-display text-lg">Geser jam</label>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
            {playing ? <><Pause size={18} /> Jeda</> : <><Play size={18} /> Putar</>}
          </button>
        </div>
        <input
          id="hour-slider" type="range" className="big-range" min={min} max={max} step={step} value={value}
          onChange={(e) => { setPlaying(false); onChange(Number(e.target.value)); }}
          aria-valuetext={`Pukul ${formatHour(value)}`}
        />
        <div className="mt-2 flex justify-between text-sm text-indigo-100/70"><span>00.00</span><span>06.00</span><span>12.00</span><span>18.00</span><span>24.00</span></div>
      </div>
    </div>
  );
}
