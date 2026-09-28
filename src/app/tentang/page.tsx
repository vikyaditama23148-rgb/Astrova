import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Award, Ban, BookOpenCheck, Bot, Code2, Globe2, Layers, Mail, Rocket, Sparkle, Sparkles } from 'lucide-react';
import { Github, Instagram, Linkedin } from '@/components/BrandIcons';
import DeveloperAvatar from '@/components/DeveloperAvatar';
import ParallaxStars from '@/components/ParallaxStars';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = { title: 'Tentang Pengembang' };

/**
 * ⚠️ ISI DATA ASLI DI SINI sebelum halaman ini dipublikasikan.
 * Tombol kontak otomatis TERSEMBUNYI kalau nilainya dikosongkan (''),
 * jadi aman dibiarkan kosong dulu kalau belum ingin ditampilkan.
 */
const DEV = {
  name: 'Viky Aditama',
  role: 'Pengembang Media Pembelajaran • Skripsi S1',
  subtitle: 'Mahasiswa S1 Pendidikan Guru Sekolah Dasar', // TODO: sesuaikan nama kampus/peminatan Anda
  quote:
    'Halo, penjelajah cilik dan Bapak/Ibu Guru! Saya Viky, perancang di balik Astrova. Berawal dari keinginan membuat materi Tata Surya IPAS lebih mudah dipahami dan menyenangkan bagi siswa kelas V SD, saya membangun laboratorium antariksa virtual ini sebagai tugas akhir skripsi saya. Semoga petualangan bersama AstroBot membuat sains terasa semenyenangkan bermain di taman hiburan galaksi!',
  email: 'vikyaditama23148@gmail.com', // TODO: mis. 'nama@email.com' — kosongkan untuk sembunyikan tombol
  github: 'https://github.com/vikyaditama23148-rgb', // TODO: mis. 'https://github.com/username'
  linkedin: 'https://www.linkedin.com/in/viky-aditama-55461b2b7/', // TODO
  instagram: 'https://instagram.com/vkyadtm', // TODO
  repoUrl: '', // TODO: tautan repositori (kalau ingin publik)
};

const MISSION = [
  { Icon: Globe2, title: '8 Planet 3D & Audio', text: 'Visualisasi tiga dimensi dengan kontrol rotasi bebas 360°, dilengkapi narasi ramah anak.' },
  { Icon: BookOpenCheck, title: 'Tri-Phase Learning', text: 'Alur pedagogik teruji: Belajar (materi), Jelajah (simulasi), dan Uji Misi (kuis bertingkat).' },
  { Icon: Bot, title: 'Didampingi AstroBot', text: 'Maskot robot pendamping yang memberi petunjuk kontekstual tanpa membocorkan jawaban.' },
  { Icon: Ban, title: 'Bebas Iklan', text: 'Gratis tanpa paywall, dirancang untuk kebutuhan penelitian dan pembelajaran di sekolah.' },
];

const STACK = [
  { name: 'Next.js 16', desc: 'App Router & render sisi server' },
  { name: 'TypeScript', desc: 'Penulisan kode yang aman & terstruktur' },
  { name: 'Three.js', desc: 'Render 3D tata surya & Observatorium' },
  { name: 'Tailwind CSS', desc: 'Desain kosmik yang konsisten & adaptif' },
  { name: 'Framer Motion', desc: 'Animasi & transisi antarhalaman' },
  { name: 'Google Gemini', desc: 'Otak AstroBot untuk menjawab & merangkum' },
  { name: 'Supabase', desc: 'Basis data, autentikasi, & penyimpanan aset' },
  { name: 'Zustand', desc: 'Manajemen state interaksi kuis' },
];

function ContactButton({ href, Icon, label, primary = false }: { href: string; Icon: React.ComponentType<{ size?: number }>; label: string; primary?: boolean }) {
  if (!href) return null;
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={`btn ${primary ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
      <Icon size={16} /> {label}
    </a>
  );
}

export default function DeveloperPage() {
  const hasContact = DEV.email || DEV.github || DEV.linkedin || DEV.instagram;
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: DEV.name,
    jobTitle: DEV.role,
    description: DEV.quote,
    ...(DEV.email ? { email: DEV.email } : {}),
    sameAs: [DEV.github, DEV.linkedin, DEV.instagram].filter(Boolean),
  };
  return (
    <div className="space-bg overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <div className="pointer-events-none fixed inset-0 z-0"><ParallaxStars /></div>
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:py-5">
        <span className="flex items-center gap-2 font-display text-xl font-semibold sm:text-2xl">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-sun-400 text-lg sm:h-10 sm:w-10 sm:text-xl">🪐</span> Astrova
        </span>
        <Link href="/" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Kembali ke Beranda</Link>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-20">
        {/* HERO */}
        <Reveal immediate>
          <section className="card-night flex flex-col items-center gap-6 p-6 text-center sm:p-10 md:flex-row md:text-left">
            <div className="shrink-0"><DeveloperAvatar size={150} /></div>
            <div className="min-w-0">
              <span className="chip !bg-secondary/15 !text-secondary">{DEV.role}</span>
              <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">{DEV.name}</h1>
              <p className="mt-1 font-display text-base font-semibold text-secondary sm:text-lg">{DEV.subtitle}</p>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-indigo-100/90 md:mx-0">{DEV.quote}</p>
              {hasContact && (
                <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                  <ContactButton href={DEV.email ? `mailto:${DEV.email}` : 'vikyaditama23148@gmail.com'} Icon={Mail} label={DEV.email} />
                  <ContactButton href={DEV.github} Icon={Github} label="GitHub" />
                  <ContactButton href={DEV.linkedin} Icon={Linkedin} label="LinkedIn" />
                  <ContactButton href={DEV.instagram} Icon={Instagram} label="Instagram" />
                </div>
              )}
            </div>
          </section>
        </Reveal>

        {/* MISI */}
        <Reveal delay={0.1} className="mt-14">
          <span className="chip !bg-secondary/10 !text-secondary"><Sparkle size={14} className="mr-1 inline" /> Kurikulum Merdeka • Fase C IPAS</span>
          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Misi di Balik Peluncuran Astrova 🚀</h2>
          <p className="mt-2 max-w-2xl text-lg text-indigo-100/90">Dirancang khusus menyelaraskan Capaian Pembelajaran IPAS kelas V SD — mengubah konsep abstrak rotasi, revolusi, dan gravitasi menjadi petualangan visual interaktif.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MISSION.map((m, i) => (
              <Reveal key={m.title} delay={0.1 + i * 0.08}>
                <article className="card-night h-full p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary/15 text-secondary"><m.Icon size={22} /></span>
                  <h3 className="mt-3 text-lg font-semibold text-primary">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-indigo-100/85">{m.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* TEKNOLOGI */}
        <Reveal delay={0.15} className="mt-14">
          <span className="chip !bg-sun-400/15 !text-sun-300"><Layers size={14} className="mr-1 inline" /> Arsitektur Web Ringan &amp; Responsif</span>
          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Teknologi di Ruang Mesin Astrova 🛠️</h2>
          <p className="mt-2 max-w-2xl text-lg text-indigo-100/90">Dipilih agar tetap ringan dan lancar di perangkat sekolah dasar — Chromebook, tablet kelas, hingga ponsel guru.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STACK.map((t) => (
              <div key={t.name} className="card-night flex items-start gap-3 p-4">
                <Code2 size={20} className="mt-0.5 shrink-0 text-secondary" />
                <div><p className="font-display font-semibold text-primary">{t.name}</p><p className="text-xs text-indigo-100/75">{t.desc}</p></div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CTA PENUTUP */}
        <Reveal delay={0.2} className="mt-14">
          <section className="card-night flex flex-col items-center justify-between gap-6 p-6 text-center sm:p-8 md:flex-row md:text-left">
            <div>
              <span className="chip !bg-secondary/10 !text-secondary"><Rocket size={14} className="mr-1 inline" /> Terbuka untuk kolaborasi &amp; masukan</span>
              <h2 className="mt-3 text-2xl font-bold text-primary sm:text-3xl">Punya masukan untuk Astrova?</h2>
              <p className="mt-2 max-w-lg text-indigo-100/90">Astrova terus disempurnakan berdasarkan umpan balik nyata dari guru dan siswa. Mari berdiskusi tentang penerapan media interaktif ini di kelas Anda.</p>
            </div>
            {hasContact && (
              <div className="flex shrink-0 flex-wrap justify-center gap-2">
                <ContactButton href={DEV.email ? `mailto:${DEV.email}` : 'vikyaditama23148@gmail.com'} Icon={Mail} label="Kirim Email" primary />
                <ContactButton href={DEV.repoUrl} Icon={Github} label="GitHub Repo" />
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={0.25} className="mt-10 text-center text-sm text-indigo-200/70">
          <p className="flex items-center justify-center gap-1"><Award size={14} /> Didedikasikan untuk kemajuan literasi sains antariksa anak-anak Indonesia.</p>
        </Reveal>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-6 text-center text-sm text-indigo-200/70">
        <p className="flex items-center justify-center gap-1.5 font-display font-semibold text-indigo-100"><Sparkles size={14} /> Astrova Interactive Learning</p>
        <p className="mt-1">Media Pembelajaran Interaktif Tata Surya • Kurikulum Merdeka Fase C (Kelas 5 SD)</p>
        <p className="mt-1">Karya Tugas Akhir / Skripsi • © {new Date().getFullYear()} Astrova EduLab</p>
      </footer>
    </div>
  );
}