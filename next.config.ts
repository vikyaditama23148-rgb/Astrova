import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },
  serverExternalPackages: ['exceljs'],
  // Tanpa ini, kompilasi pertama halaman yang memuat Three.js bisa sangat lama:
  // three-stdlib (dipakai @react-three/drei) mengekspor >60 modul dari satu
  // "barrel file", dan bundler memproses semuanya walau cuma OrbitControls
  // yang dipakai. Opsi ini membuat Next.js hanya mengambil bagian yang dipakai.
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'three-stdlib', '@react-three/fiber'],
  },
};

export default nextConfig;