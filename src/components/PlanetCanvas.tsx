'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getPlanet, type PlanetHotspot } from '@/lib/planets';
import { getTexture, TEX_H, TEX_W } from '@/lib/planet-texture';

interface Props {
  planetId: string;
  /** Resolusi internal kanvas (px). Kecil untuk ikon, 360 untuk viewer. */
  size?: number;
  interactive?: boolean;
  autoRotate?: boolean;
  initialRotation?: number;
  hotspots?: PlanetHotspot[];
  activeHotspot?: string | null;
  onHotspot?: (h: PlanetHotspot) => void;
  showControls?: boolean;
  className?: string;
  label?: string;
}

const LIGHT = (() => { const v = [-0.55, 0.45, 0.7]; const n = Math.hypot(...v); return v.map((x) => x / n); })();

/**
 * Planet berputar: bola dirender per-piksel dari tekstur prosedural.
 * Geser dengan jari/mouse (gestur drag) untuk memutar 360° dan memiringkan pandangan.
 */
export default function PlanetCanvas({
  planetId, size = 360, interactive = true, autoRotate = true, initialRotation = 0.6,
  hotspots = [], activeHotspot = null, onHotspot, showControls = false, className = '', label,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const offRef = useRef<{ D: number; c: HTMLCanvasElement; cc: CanvasRenderingContext2D; img: ImageData } | null>(null);
  const st = useRef({ rot: initialRotation, pitch: 0.15, vel: 0, dragging: false, lx: 0, ly: 0, dirty: true, interacted: false });
  const planet = getPlanet(planetId);

  useEffect(() => { st.current.dirty = true; }, [planetId, hotspots, activeHotspot]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const S = size, cx = S / 2, cy = S / 2, R = S * planet.scale;
    const { rot, pitch } = st.current;
    const tex = getTexture(planet);
    const D = Math.ceil(R * 2) + 2;
    if (!offRef.current || offRef.current.D !== D) {
      const c = document.createElement('canvas'); c.width = D; c.height = D;
      const cc = c.getContext('2d')!;
      offRef.current = { D, c, cc, img: cc.createImageData(D, D) };
    }
    const { c: off, cc: octx, img } = offRef.current;
    const out = img.data;
    const cT = Math.cos((planet.tilt * Math.PI) / 180), sT = Math.sin((planet.tilt * Math.PI) / 180);
    const cP = Math.cos(pitch), sP = Math.sin(pitch);
    const emissive = planet.texture === 'sun';

    for (let py = 0; py < D; py++) {
      const ny = -((py - D / 2 + 0.5) / R);
      for (let px = 0; px < D; px++) {
        const nx = (px - D / 2 + 0.5) / R;
        const r2 = nx * nx + ny * ny;
        const k = (py * D + px) * 4;
        if (r2 >= 1) { out[k + 3] = 0; continue; }
        const nz = Math.sqrt(1 - r2);
        const y1 = ny * cP + nz * sP;
        const z1 = -ny * sP + nz * cP;
        const x2 = nx * cT + y1 * sT;
        const y2 = -nx * sT + y1 * cT;
        const lon = Math.atan2(x2, z1) + rot;
        const lat = Math.asin(y2 > 1 ? 1 : y2 < -1 ? -1 : y2);
        let u = lon / (2 * Math.PI) + 0.5; u -= Math.floor(u);
        const tx = Math.min(TEX_W - 1, (u * TEX_W) | 0);
        const ty = Math.min(TEX_H - 1, Math.max(0, ((0.5 - lat / Math.PI) * TEX_H) | 0));
        const t = (ty * TEX_W + tx) * 4;
        let shade: number;
        if (emissive) shade = 0.72 + 0.4 * nz;
        else {
          const dot = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
          shade = Math.min(1.08, Math.max(0.16, 0.16 + 0.98 * dot));
        }
        out[k] = Math.min(255, tex[t] * shade);
        out[k + 1] = Math.min(255, tex[t + 1] * shade);
        out[k + 2] = Math.min(255, tex[t + 2] * shade);
        const rr = Math.sqrt(r2);
        out[k + 3] = rr > 0.985 ? Math.round(((1 - rr) / 0.015) * 255) : 255;
      }
    }
    octx.putImageData(img, 0, 0);

    ctx.clearRect(0, 0, S, S);
    // halo
    const glow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * (emissive ? 1.7 : 1.25));
    const halo = emissive ? '255,179,0' : planet.texture === 'earth' ? '90,160,255' : planet.texture === 'venus' ? '255,220,140' : '160,180,255';
    glow.addColorStop(0, `rgba(${halo},${emissive ? 0.55 : 0.25})`);
    glow.addColorStop(1, `rgba(${halo},0)`);
    ctx.fillStyle = glow; ctx.fillRect(0, 0, S, S);

    const drawRing = (front: boolean) => {
      if (!planet.rings) return;
      const squish = Math.min(0.6, Math.max(0.08, 0.3 - pitch * 0.25));
      const ringRot = -(planet.tilt * Math.PI) / 180;
      const bands: [number, string, number][] = [[1.4, 'rgba(120,100,70,0.55)', 0.07], [1.52, 'rgba(232,213,163,0.95)', 0.1], [1.66, 'rgba(201,178,122,0.9)', 0.09], [1.8, 'rgba(246,235,203,0.95)', 0.1], [1.95, 'rgba(168,139,84,0.7)', 0.06], [2.05, 'rgba(232,213,163,0.85)', 0.07]];
      ctx.save();
      bands.forEach(([m, color, w]) => {
        ctx.beginPath();
        ctx.strokeStyle = color; ctx.lineWidth = R * w;
        ctx.ellipse(cx, cy, R * m, R * m * squish, ringRot, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();
    };
    drawRing(false);
    ctx.drawImage(off, cx - D / 2, cy - D / 2);
    drawRing(true);

    // titik hotspot mengikuti rotasi (posisi diperbarui langsung di DOM, tanpa re-render React)
    hotspots.forEach((h, i) => {
      const el = dotRefs.current[i];
      if (!el) return;
      const la = (h.lat * Math.PI) / 180, lo = (h.lon * Math.PI) / 180 - rot;
      const x = Math.cos(la) * Math.sin(lo), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo);
      const xr = x * cT - y * sT, yr = x * sT + y * cT;
      const yp = yr * cP - z * sP, zp = yr * sP + z * cP;
      el.style.left = `${((cx + xr * R) / S) * 100}%`;
      el.style.top = `${((cy - yp * R) / S) * 100}%`;
      const vis = zp > 0.12;
      el.style.opacity = vis ? '1' : '0';
      el.style.pointerEvents = vis ? 'auto' : 'none';
    });
  }, [planet, size, hotspots]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      const s = st.current;
      const moving = s.dragging || Math.abs(s.vel) > 0.0004 || (interactive && autoRotate && !s.interacted) || (!interactive && autoRotate);
      if (moving && t - last > 24) {
        last = t;
        if (!s.dragging) {
          if (Math.abs(s.vel) > 0.0004) { s.rot += s.vel; s.vel *= 0.94; }
          else if (autoRotate && !s.interacted) s.rot -= 0.006;
          else if (!interactive && autoRotate) s.rot -= 0.006;
        }
        s.dirty = true;
      }
      if (s.dirty) { s.dirty = false; render(); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [render, interactive, autoRotate]);

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    const s = st.current;
    s.dragging = true; s.interacted = true; s.lx = e.clientX; s.ly = e.clientY; s.vel = 0;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.dragging) return;
    const w = wrapRef.current?.clientWidth || size;
    const k = size / w;
    const dx = (e.clientX - s.lx) * k, dy = (e.clientY - s.ly) * k;
    s.lx = e.clientX; s.ly = e.clientY;
    s.rot -= dx * 0.011; s.vel = -dx * 0.011;
    s.pitch = Math.max(-0.9, Math.min(0.9, s.pitch + dy * 0.006));
    s.dirty = true;
  };
  const onUp = () => { st.current.dragging = false; };
  const nudge = (d: number) => { st.current.interacted = true; st.current.vel = d; };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') nudge(0.08);
    if (e.key === 'ArrowRight') nudge(-0.08);
    if (e.key === 'ArrowUp') { st.current.pitch = Math.max(-0.9, st.current.pitch - 0.15); st.current.dirty = true; }
    if (e.key === 'ArrowDown') { st.current.pitch = Math.min(0.9, st.current.pitch + 0.15); st.current.dirty = true; }
  };

  return (
    <div className={`relative select-none ${className}`}>
      <div
        ref={wrapRef}
        className={`relative mx-auto aspect-square w-full ${interactive ? 'cursor-grab active:cursor-grabbing touch-none' : ''}`}
        style={{ maxWidth: size }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        role="img" aria-label={label ?? `Model ${planet.name}. ${interactive ? 'Geser untuk memutar.' : ''}`}
        tabIndex={interactive ? 0 : -1} onKeyDown={interactive ? onKey : undefined}
      >
        <canvas ref={canvasRef} width={size} height={size} className="h-full w-full" />
        {hotspots.map((h, i) => (
          <button
            key={h.id} ref={(el) => { dotRefs.current[i] = el; }}
            type="button" aria-label={`Fakta: ${h.label}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onHotspot?.(h)}
            className={`hotspot-dot ${activeHotspot === h.id ? 'is-active' : ''}`}
            style={{ left: '50%', top: '50%' }}
          />
        ))}
      </div>
      {interactive && showControls && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudge(0.09)} aria-label="Putar ke kiri">◀ Putar</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudge(-0.09)} aria-label="Putar ke kanan">Putar ▶</button>
        </div>
      )}
    </div>
  );
}
