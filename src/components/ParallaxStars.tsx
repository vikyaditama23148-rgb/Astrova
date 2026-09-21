'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

const layer = (size: number, dots: string) => ({ backgroundImage: dots, backgroundSize: `${size}px ${size}px` });

/** Bintang berlapis yang bergeser mengikuti kursor/jari (efek kedalaman) + bintang jatuh. */
export default function ParallaxStars() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 }), sy = useSpring(my, { stiffness: 40, damping: 18 });
  const x1 = useTransform(sx, (v) => v * -10), y1 = useTransform(sy, (v) => v * -10);
  const x2 = useTransform(sx, (v) => v * -24), y2 = useTransform(sy, (v) => v * -24);
  const x3 = useTransform(sx, (v) => v * -48), y3 = useTransform(sy, (v) => v * -48);

  useEffect(() => {
    if (reduce) return;
    const move = (e: PointerEvent) => { mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reduce, mx, my]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden>
      <motion.div className="absolute -inset-16 opacity-60" style={{ x: x1, y: y1, ...layer(260, 'radial-gradient(1px 1px at 30px 40px,#fff,transparent),radial-gradient(1.2px 1.2px at 170px 120px,#cfe3ff,transparent),radial-gradient(1px 1px at 90px 210px,#fff,transparent)') }} />
      <motion.div className="absolute -inset-16 opacity-70" style={{ x: x2, y: y2, ...layer(340, 'radial-gradient(1.8px 1.8px at 60px 90px,#fff2c7,transparent),radial-gradient(1.6px 1.6px at 250px 200px,#b7f4f2,transparent),radial-gradient(1.4px 1.4px at 300px 40px,#fff,transparent)') }} />
      <motion.div className="absolute -inset-16 opacity-80" style={{ x: x3, y: y3, ...layer(520, 'radial-gradient(2.6px 2.6px at 120px 160px,#fff,transparent),radial-gradient(2.2px 2.2px at 400px 300px,#ffd9a0,transparent)') }} />
      {!reduce && (<><span className="shooting-star" style={{ top: '12%', left: '8%' }} /><span className="shooting-star" style={{ top: '48%', left: '-4%', animationDelay: '5s', animationDuration: '13s' }} /></>)}
    </div>
  );
}