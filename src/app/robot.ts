import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrova.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/tentang', '/login'],
      disallow: ['/admin', '/hub', '/module', '/observatorium', '/laporan', '/pretest', '/posttest', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}