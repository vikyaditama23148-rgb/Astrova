import * as THREE from 'three';
import { getPlanet } from '@/lib/planets';
import { getTexture, TEX_H, TEX_W } from '@/lib/planet-texture';

const cache = new Map<string, THREE.DataTexture>();

/**
 * Ambil tekstur permukaan planet sebagai THREE.DataTexture, dibangun dari
 * generator prosedural yang SAMA dengan yang dipakai kanvas 2D di fase
 * Explore (src/lib/planet-texture.ts) — supaya benua, pita awan, kawah,
 * dan tudung es benar-benar terlihat, bukan bola warna polos.
 * Hasilnya juga di-cache bersama kanvas 2D (satu Map di modul aslinya),
 * jadi tidak dihitung dua kali untuk planet yang sama.
 */
export function getPlanetTexture(id: string): THREE.DataTexture {
  const hit = cache.get(id);
  if (hit) return hit;
  const info = getPlanet(id);
  const raw = getTexture(info); // Uint8ClampedArray RGBA, TEX_W × TEX_H
  const tex = new THREE.DataTexture(new Uint8Array(raw), TEX_W, TEX_H, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  cache.set(id, tex);
  return tex;
}