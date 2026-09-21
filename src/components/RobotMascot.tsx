'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Maskot AstroBot: mengambang lembut dan melambai. */
export default function RobotMascot({ size = 84, wave = true }: { size?: number; wave?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative inline-block" style={{ width: size, height: size }} aria-hidden>
      <motion.svg width={size} height={size} viewBox="0 0 64 64" animate={reduce ? undefined : { y: [0, -5, 0], rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}>
        <line x1="32" y1="4" x2="32" y2="13" stroke="#ffc93c" strokeWidth="3" strokeLinecap="round" />
        <motion.circle cx="32" cy="5" r="4" fill="#ff6b4a" animate={reduce ? undefined : { scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ transformOrigin: '32px 5px' }} />
        <rect x="9" y="13" width="46" height="38" rx="15" fill="#fff6dd" stroke="#1b1440" strokeWidth="3" />
        <rect x="15" y="21" width="34" height="20" rx="10" fill="#0b1030" />
        <motion.g animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }} transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.94, 0.98, 1] }} style={{ transformOrigin: '32px 31px' }}>
          <circle cx="26" cy="31" r="4.5" fill="#3dd9d6" /><circle cx="38" cy="31" r="4.5" fill="#3dd9d6" />
        </motion.g>
        <path d="M27 38 Q32 42 37 38" stroke="#ffc93c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="3" y="26" width="6" height="14" rx="3" fill="#a78bfa" /><rect x="55" y="26" width="6" height="14" rx="3" fill="#a78bfa" />
      </motion.svg>
      {wave && (
        <motion.span className="absolute -right-3 top-0 text-2xl" style={{ transformOrigin: '70% 80%' }} animate={reduce ? undefined : { rotate: [0, 24, -8, 24, 0] }} transition={{ repeat: Infinity, duration: 2.2, repeatDelay: 1.2 }}>👋</motion.span>
      )}
    </div>
  );
}