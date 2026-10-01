'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_QUALITY, QUALITY_STORAGE_KEY, type GraphicsQuality } from '@/graphics/graphicsConfig';
import { detectGraphicsQuality } from '@/graphics/graphicsDetector';

/**
 * Sumber kualitas grafis untuk satu sesi: pertama kali dibuka → deteksi
 * ringan otomatis; setelah siswa memilih manual lewat UI, pilihannya
 * disimpan di localStorage dan dipakai lagi di kunjungan berikutnya.
 */
export function useGraphicsQuality() {
  const [quality, setQualityState] = useState<GraphicsQuality>(DEFAULT_QUALITY);
  const [isAuto, setIsAuto] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(QUALITY_STORAGE_KEY) as GraphicsQuality | null;
      if (saved === 'easy' || saved === 'normal' || saved === 'high') {
        setQualityState(saved);
        setIsAuto(false);
      } else {
        setQualityState(detectGraphicsQuality());
        setIsAuto(true);
      }
    } catch {
      setQualityState(DEFAULT_QUALITY);
    } finally {
      setReady(true);
    }
  }, []);

  const setQuality = useCallback((q: GraphicsQuality) => {
    setQualityState(q);
    setIsAuto(false);
    try { localStorage.setItem(QUALITY_STORAGE_KEY, q); } catch { /* localStorage tidak tersedia — abaikan, tetap jalan di state */ }
  }, []);

  return { quality, setQuality, isAuto, ready };
}