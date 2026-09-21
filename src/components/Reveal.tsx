'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Muncul lembut (naik + fade) saat masuk layar. */
export default function Reveal({ children, delay = 0, className = '', y = 28, immediate = false }: { children: React.ReactNode; delay?: number; className?: string; y?: number; immediate?: boolean }) {
  const reduce = useReducedMotion();
  const props = immediate ? { animate: { opacity: 1, y: 0 } } : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' } };
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y }} {...props} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}