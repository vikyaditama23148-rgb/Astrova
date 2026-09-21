import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Astrova — Belajar Tata Surya Seru', template: '%s · Astrova' },
  description: 'Media pembelajaran interaktif IPAS Tata Surya untuk siswa Kelas V SD: Learn, Explore, Test.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1030' };

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
      </head>
      <body>{children}</body>
    </html>
  );
}