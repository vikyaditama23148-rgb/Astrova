import Link from 'next/link';
import ParallaxStars from '@/components/ParallaxStars';
import Reveal from '@/components/Reveal';
import SolarSystemHero from '@/components/SolarSystemHero';

const STEPS = [
  ['📖', 'Learn', 'Baca kartu cerita bergambar. Boleh didengarkan juga!'],
  ['🔭', 'Explore', 'Putar planet, geser jam, hitung beratmu di planet lain.'],
  ['🏆', 'Test', 'Pecahkan misi seru dan kumpulkan bintang!'],
];

export default function Landing() {
  return (
    <div className="space-bg overflow-x-clip">
      <ParallaxStars />
      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-6">
        <header className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-2xl font-semibold"><span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-sun-400 text-xl">🪐</span> Astrova</span>
          <Link href="/admin/login" className="text-sm text-indigo-200 underline-offset-4 hover:underline">Masuk guru / peneliti</Link>
        </header>

        <main className="grid flex-1 items-center gap-10 py-8 md:grid-cols-[1fr_1fr]">
          <section>
            <Reveal immediate><p className="chip mb-4">Akademi Penjelajah • IPAS Kelas V</p></Reveal>
            <Reveal immediate delay={0.08}>
              <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl">Ayo keliling<br /><span className="bg-gradient-to-r from-sun-300 to-sun-500 bg-clip-text text-transparent">Tata Surya!</span></h1>
            </Reveal>
            <Reveal immediate delay={0.18}>
              <p className="mt-5 max-w-xl text-xl leading-relaxed text-indigo-100">Putar planet dengan jarimu, mainkan siang dan malam, lalu tantang dirimu bersama AstroBot.</p>
            </Reveal>
            <Reveal immediate delay={0.28} className="mt-8 flex flex-wrap gap-4">
              <Link href="/login" className="btn btn-primary !min-h-16 !px-8 !text-xl">Mulai menjelajah 🚀</Link>
              <a href="#cara" className="btn btn-ghost !min-h-16 !px-6">Cara belajarnya</a>
            </Reveal>
            <Reveal immediate delay={0.38} className="mt-6 flex flex-wrap gap-2">
              <span className="chip">🪐 8 planet</span><span className="chip">✨ 3 fase seru</span><span className="chip">⭐ Dapat bintang &amp; lencana</span>
            </Reveal>
          </section>

          <Reveal immediate delay={0.2} y={0} className="pb-16 sm:pb-12">
            <SolarSystemHero />
          </Reveal>
        </main>

        <section id="cara" className="pb-14 pt-6" aria-labelledby="cara-h">
          <Reveal><h2 id="cara-h" className="mb-6 text-center text-3xl font-semibold sm:text-4xl">Tiga langkah jadi Penjelajah</h2></Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map(([e, t, d], i) => (
              <Reveal key={t} delay={i * 0.12}>
                <article className="card-night h-full p-5 transition-transform duration-300 hover:-translate-y-2">
                  <p className="text-4xl" aria-hidden>{e}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{t}</h3>
                  <p className="mt-1 text-lg text-indigo-100/90">{d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}