import type { GraphicsQuality } from '@/graphics/graphicsConfig';

/**
 * Deteksi kemampuan perangkat secara RINGAN (hanya baca properti bawaan
 * browser, tanpa render percobaan atau benchmark apa pun yang bisa membuat
 * halaman terasa lambat). Kalau sinyalnya tidak meyakinkan, kembalikan
 * 'normal' sebagai default yang aman — sesuai prinsip "jangan asal pilih
 * High hanya karena perangkat terlihat modern".
 */
export function detectGraphicsQuality(): GraphicsQuality {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'normal';

  const nav = navigator as Navigator & { deviceMemory?: number };
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);
  const cores = nav.hardwareConcurrency ?? 4; // tidak diketahui → anggap sedang, bukan rendah
  const mem = nav.deviceMemory; // tidak didukung semua browser (mis. Safari) → bisa undefined
  const dpr = window.devicePixelRatio || 1;

  // Coba baca info renderer WebGL (sering tersedia, sangat ringan — hanya query properti).
  let rendererInfo = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && ext) rendererInfo = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase();
    gl?.getExtension('WEBGL_lose_context')?.loseContext(); // bersihkan konteks percobaan segera
  } catch {
    // Browser yang memblokir fingerprinting WEBGL_debug_renderer_info akan sampai ke sini — tidak masalah, lanjut pakai sinyal lain.
  }
  const looksLowEndGpu = /(mali-4|adreno 3|adreno 4|powervr sgx|intel.*hd graphics [23])/i.test(rendererInfo);

  // --- Sinyal "perangkat terbatas" → EASY ---
  if (looksLowEndGpu) return 'easy';
  if (isMobile && mem != null && mem <= 2) return 'easy';
  if (isMobile && cores <= 4 && dpr <= 1.5 && mem == null) return 'easy'; // HP kelas bawah umumnya 4 core, layar dpr rendah

  // --- Sinyal "perangkat mumpuni" → HIGH (hanya jika BEBERAPA sinyal kuat sejalan, bukan satu saja) ---
  if (!isMobile && cores >= 8 && (mem == null || mem >= 8)) return 'high';

  // --- Tidak meyakinkan → NORMAL (default aman) ---
  return 'normal';
}