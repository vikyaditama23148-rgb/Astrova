import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrova.vercel.app';

/**
 * Hanya mendaftarkan halaman PUBLIK. Halaman yang butuh login (Hub, Module,
 * Pre/Post-Test, Observatorium, Laporan, Admin) sengaja TIDAK dimasukkan —
 * Google tidak perlu (dan tidak akan bisa) mengindeks halaman di balik login.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/tentang`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}