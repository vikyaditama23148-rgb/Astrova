import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrova.vercel.app'; // TODO: ganti dengan domain asli Anda

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Astrova — Belajar Tata Surya Seru untuk Siswa SD', template: '%s · Astrova' },
  description:
    'Astrova adalah media pembelajaran interaktif IPAS Tata Surya untuk siswa Kelas V SD (Kurikulum Merdeka Fase C): jelajahi 8 planet 3D, simulasi rotasi & revolusi, dan kuis interaktif bersama AstroBot.',
  keywords: ['Astrova', 'media pembelajaran IPAS', 'Tata Surya', 'IPAS kelas 5 SD', 'Kurikulum Merdeka Fase C', 'Viky Aditama', 'skripsi media pembelajaran interaktif'],
  authors: [{ name: 'Viky Aditama', url: `${SITE_URL}/tentang` }],
  creator: 'Viky Aditama',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'id_ID', url: SITE_URL, siteName: 'Astrova',
    title: 'Astrova — Belajar Tata Surya Seru untuk Siswa SD',
    description: 'Jelajahi 8 planet secara 3D, mainkan simulasi rotasi & revolusi, dan uji pemahamanmu bersama AstroBot.',
  },
  twitter: { card: 'summary_large_image', title: 'Astrova — Belajar Tata Surya Seru', description: 'Media pembelajaran interaktif IPAS Tata Surya untuk siswa Kelas V SD.' },
  robots: { index: true, follow: true },
  // ⚠️ ISI setelah mendaftarkan properti ini di Google Search Console:
  // Settings → Ownership verification → HTML tag → salin isi content="..." ke sini.
  verification: { google: '' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1030' };

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Viky Aditama',
  url: `${SITE_URL}/tentang`,
  jobTitle: 'Pengembang Media Pembelajaran Astrova',
  description: 'Pengembang media pembelajaran interaktif Astrova, dibuat sebagai tugas akhir/skripsi S1.',
  knowsAbout: ['Media Pembelajaran Interaktif', 'Pengembangan Web', 'Pendidikan IPAS Sekolah Dasar'],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Astrova',
  url: SITE_URL,
  description: 'Media pembelajaran interaktif IPAS Tata Surya untuk siswa Kelas V SD, Kurikulum Merdeka Fase C.',
  author: { '@type': 'Person', name: 'Viky Aditama' },
  inLanguage: 'id-ID',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Nunito+Sans:wght@400;600;700;800&display=swap"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}