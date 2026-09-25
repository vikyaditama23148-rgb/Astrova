export default function RobotMascotStatic({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <line x1="32" y1="4" x2="32" y2="13" stroke="#ffc93c" strokeWidth="3" strokeLinecap="round" /><circle cx="32" cy="5" r="4" fill="#ff6b4a" />
      <rect x="9" y="13" width="46" height="38" rx="15" fill="#fff6dd" stroke="#1b1440" strokeWidth="3" />
      <rect x="15" y="21" width="34" height="20" rx="10" fill="#0b1030" />
      <circle cx="26" cy="31" r="4.5" fill="#3dd9d6" /><circle cx="38" cy="31" r="4.5" fill="#3dd9d6" />
      <path d="M27 38 Q32 42 37 38" stroke="#ffc93c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="3" y="26" width="6" height="14" rx="3" fill="#a78bfa" /><rect x="55" y="26" width="6" height="14" rx="3" fill="#a78bfa" />
    </svg>
  );
}