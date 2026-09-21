import type { PlanetInfo } from '@/lib/planets';

export const TEX_W = 512;
export const TEX_H = 256;

type RGB = [number, number, number];
const cache = new Map<string, Uint8ClampedArray>();

function hex(c: string): RGB {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (a: RGB, b: RGB, t: number): RGB => {
  const k = Math.min(1, Math.max(0, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function hash3(ix: number, iy: number, iz: number) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(iz, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
const fade = (t: number) => t * t * (3 - 2 * t);
function vnoise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c000 = hash3(xi, yi, zi), c100 = hash3(xi + 1, yi, zi), c010 = hash3(xi, yi + 1, zi), c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1), c101 = hash3(xi + 1, yi, zi + 1), c011 = hash3(xi, yi + 1, zi + 1), c111 = hash3(xi + 1, yi + 1, zi + 1);
  return l(l(l(c000, c100, xf), l(c010, c110, xf), yf), l(l(c001, c101, xf), l(c011, c111, xf), yf), zf);
}
function fbm(x: number, y: number, z: number, oct = 4) {
  let a = 0.5, f = 1, s = 0, norm = 0;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(x * f, y * f, z * f);
    norm += a; f *= 2; a *= 0.5;
  }
  return s / norm;
}

function colorAt(p: PlanetInfo, x: number, y: number, z: number, lon: number, lat: number): RGB {
  const pal = p.palette.map(hex);
  switch (p.texture) {
    case 'sun': {
      const n = fbm(x * 3, y * 3, z * 3, 5);
      const g = fbm(x * 9 + 5, y * 9, z * 9, 3);
      let c = mix(pal[1], pal[0], n * 1.3);
      c = mix(c, pal[2], smoothstep(0.58, 0.78, g) * 0.75);
      const dark = fbm(x * 2.4 + 9, y * 2.4, z * 2.4, 3);
      c = mix(c, [120, 40, 0], smoothstep(0.66, 0.78, dark) * 0.7);
      return c;
    }
    case 'rocky': {
      const n = fbm(x * 4, y * 4, z * 4, 5);
      let c = mix(pal[1], pal[0], n);
      const h = vnoise(x * 13, y * 13, z * 13);
      if (h > 0.8) c = mix(c, pal[1], 0.65);
      else if (h < 0.16) c = mix(c, pal[2], 0.4);
      return c;
    }
    case 'venus': {
      const w = fbm(x * 2, y * 2, z * 2, 3) * 2.2;
      const b = fbm(x * 2 + w, y * 6, z * 2 + w, 4);
      return mix(mix(pal[1], pal[0], b * 1.2), pal[2], smoothstep(0.55, 0.8, b));
    }
    case 'earth': {
      const land = fbm(x * 1.7 + 3, y * 1.7, z * 1.7, 5);
      const depth = fbm(x * 3, y * 3, z * 3, 3);
      let c = mix([14, 60, 138], [44, 123, 224], depth);
      if (land > 0.55) {
        const elev = (land - 0.55) * 6;
        c = elev < 0.12 ? [214, 196, 132] : mix([46, 154, 74], [138, 107, 62], elev - 0.12);
      }
      const cl = fbm(x * 3 + 11, y * 5, z * 3, 4);
      if (cl > 0.58) c = mix(c, [255, 255, 255], Math.min(0.8, (cl - 0.58) * 4));
      if (Math.abs(y) > 0.86) c = mix(c, [250, 252, 255], smoothstep(0.86, 0.92, Math.abs(y)));
      return c;
    }
    case 'mars': {
      const n = fbm(x * 2.6, y * 2.6, z * 2.6, 5);
      let c = mix(pal[1], pal[0], n * 1.2);
      const m = fbm(x * 1.6 + 7, y * 1.6, z * 1.6, 4);
      c = mix(c, [86, 38, 24], smoothstep(0.55, 0.7, m) * 0.7);
      if (Math.abs(y) > 0.9) c = mix(c, [245, 240, 235], smoothstep(0.9, 0.95, Math.abs(y)));
      return c;
    }
    case 'bands': {
      const w = fbm(x * 3, y * 8, z * 3, 3) * 0.35;
      const b = Math.sin((y + w) * 22) * 0.5 + 0.5;
      const b2 = Math.sin((y + w) * 9 + 1) * 0.5 + 0.5;
      let c = mix(pal[0], pal[1], b * 0.75);
      c = mix(c, pal[2], b2 * 0.4);
      c = mix(c, pal[3], smoothstep(0.62, 0.9, fbm(x * 6, y * 14, z * 6, 3)) * 0.45);
      if (p.spot) {
        let dl = lon - (p.spot.lon * Math.PI) / 180;
        while (dl > Math.PI) dl -= 2 * Math.PI;
        while (dl < -Math.PI) dl += 2 * Math.PI;
        const dt = lat - (p.spot.lat * Math.PI) / 180;
        const e = (dl / (p.spot.size * 1.7)) ** 2 + (dt / p.spot.size) ** 2;
        if (e < 1) c = mix(c, hex(p.spot.color), smoothstep(1, 0.4, e));
      }
      return c;
    }
    case 'ice':
    default: {
      const b = Math.sin((y + fbm(x * 2, y * 2, z * 2, 3) * 0.25) * 10) * 0.5 + 0.5;
      let c = mix(pal[1], pal[0], b * 0.6 + 0.2);
      c = mix(c, pal[2], smoothstep(0.62, 0.9, fbm(x * 4, y * 10, z * 4, 3)) * 0.35);
      return c;
    }
  }
}

/** Tekstur equirectangular prosedural (dibuat sekali per planet lalu di-cache). */
export function getTexture(p: PlanetInfo): Uint8ClampedArray {
  const hit = cache.get(p.id);
  if (hit) return hit;
  const data = new Uint8ClampedArray(TEX_W * TEX_H * 4);
  for (let j = 0; j < TEX_H; j++) {
    const lat = Math.PI / 2 - ((j + 0.5) / TEX_H) * Math.PI;
    const cl = Math.cos(lat), y = Math.sin(lat);
    for (let i = 0; i < TEX_W; i++) {
      const lon = ((i + 0.5) / TEX_W) * 2 * Math.PI - Math.PI;
      const [r, g, b] = colorAt(p, cl * Math.sin(lon), y, cl * Math.cos(lon), lon, lat);
      const k = (j * TEX_W + i) * 4;
      data[k] = r; data[k + 1] = g; data[k + 2] = b; data[k + 3] = 255;
    }
  }
  cache.set(p.id, data);
  return data;
}
