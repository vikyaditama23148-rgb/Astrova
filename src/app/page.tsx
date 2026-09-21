import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import '@/components/home.css';
import BadgesSection from '@/components/home/BadgesSection';
import { HomeHeader, HomeTabBar } from '@/components/home/HomeNav';
import PlanetShowcase from '@/components/home/PlanetShowcase';
import StepsSection from '@/components/home/StepsSection';
import ParallaxStars from '@/components/ParallaxStars';
import Reveal from '@/components/Reveal';
import RobotMascot from '@/components/RobotMascot';
import SolarSystemHero from '@/components/SolarSystemHero';

export default function Landing() {
  return (
    <div className="space-bg overflow-x-clip pb-20 md:pb-0">
      {/* latar: nebula + bintang parallax */}
      <div className="nebula -left-40 -top-40 h-96 w-96 bg-secondary/10 blur-[120px]" aria-hidden />
      <div className="nebula -right-40 top-1/3 h-[30rem] w-[30rem] bg-tertiary-container/10 blur-[140px]" aria-hidden />
      <div className="nebula -bottom-40 left-1/3 h-[28rem] w-[28rem] bg-primary-container/10 blur-[130px]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0"><ParallaxStars /></div>

      <HomeHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pt-16 sm:pt-20 lg:px-10">
        {/* HERO */}
        <section id="atas" className="grid min-h-[calc(100dvh-5rem)] items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
          <div className="order-2 flex flex-col items-start gap-5 lg:order-1">
            <Reveal immediate><p className="chip !bg-surface-high/80 !text-secondary shadow-[0_0_16px_rgba(64,219,216,0.25)]">✨ Akademi Penjelajah • IPAS Kelas V SD</p></Reveal>
            <Reveal immediate delay={0.08}>
              <h1 className="font-bold tracking-tight">
                <span className="block text-[44px] leading-[50px] text-primary drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:text-[56px] sm:leading-[62px] lg:text-[68px] lg:leading-[74px]">Ayo keliling</span>
                <span className="block bg-gradient-to-r from-primary via-primary-container to-secondary-container bg-clip-text text-[48px] leading-[54px] text-transparent drop-shadow-[0_8px_32px_rgba(255,201,60,0.4)] sm:text-[60px] sm:leading-[66px] lg:text-[76px] lg:leading-[82px]">Tata Surya!</span>
              </h1>
            </Reveal>
            <Reveal immediate delay={0.18}>
              <p className="max-w-xl text-lg leading-8 text-on-surface-variant sm:text-xl">
                Putar planet dengan jarimu, mainkan rotasi siang-malam, lalu tantang dirimu bersama robot pemandu <b className="text-secondary">AstroBot</b>.
              </p>
            </Reveal>
            <Reveal immediate delay={0.28} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link href="/login" className="btn btn-primary !min-h-16 !px-8 !text-xl">Mulai Menjelajah 🚀</Link>
              <a href="#cara-belajar" className="btn btn-ghost !min-h-16 !px-6 !text-secondary"><BookOpen size={22} /> Cara Belajar</a>
            </Reveal>
            <Reveal immediate delay={0.38} className="flex flex-wrap gap-2">
              <span className="chip !bg-surface-low/90">🪐 8 Planet Lengkap</span><span className="chip !bg-surface-low/90">🧪 3 Fase Belajar Seru</span><span className="chip !bg-surface-low/90">⭐ Lencana &amp; Skor Bintang</span>
            </Reveal>
          </div>

          <Reveal immediate delay={0.2} y={0} className="order-1 pb-14 lg:order-2">
            <SolarSystemHero />
          </Reveal>
        </section>

        <StepsSection />
        <PlanetShowcase />
        <BadgesSection />

        {/* CTA AKHIR */}
        <Reveal className="py-16">
          <section className="card-night relative overflow-hidden p-8 sm:p-10" aria-labelledby="cta-h">
            <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary-container/15 blur-[70px]" aria-hidden />
            <div className="pointer-events-none absolute -bottom-16 right-10 h-56 w-56 rounded-full bg-secondary/15 blur-[70px]" aria-hidden />
            <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
              <div className="flex flex-col items-center gap-5 lg:flex-row">
                <RobotMascot size={104} />
                <div>
                  <h2 id="cta-h" className="text-3xl font-bold text-primary sm:text-4xl">Siap berangkat, Penjelajah Cilik?</h2>
                  <p className="mt-2 max-w-xl text-lg text-on-surface-variant">Ajak teman sekelas dan gurumu, mulai ekspedisi pertamamu sekarang. Cukup pilih namamu dan ketik PIN, tanpa email!</p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                <Link href="/login" className="btn btn-primary !min-h-16 !px-8 !text-xl">Mulai Sekarang 🚀</Link>
                <Link href="/admin/login" className="btn btn-ghost">Masuk guru / peneliti</Link>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-6 text-center text-sm text-on-surface-variant">
        © Astrova • Media pembelajaran interaktif IPAS Kelas V SD • Kurikulum Merdeka
      </footer>
      <HomeTabBar />
    </div>
  );
}