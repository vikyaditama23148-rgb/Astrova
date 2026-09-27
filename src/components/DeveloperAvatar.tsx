/** Avatar ilustrasi "penjelajah antariksa" — bukan foto, dibuat konsisten dengan gaya maskot AstroBot. */
export default function DeveloperAvatar({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Ilustrasi penjelajah antariksa">
      <defs>
        <radialGradient id="dev-bg" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#232748" /><stop offset="1" stopColor="#0b1030" /></radialGradient>
        <radialGradient id="dev-visor" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#5fe0e6" /><stop offset="1" stopColor="#0f6b73" /></radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#dev-bg)" />
      {[[40, 35, 1.6], [160, 50, 1.2], [30, 150, 1.4], [170, 140, 1.1], [100, 25, 1.3]].map(([x, y, r], i) => (
        <circle key={i} cx={x as number} cy={y as number} r={r as number} fill="#fff" opacity="0.8" />
      ))}
      {/* helm */}
      <circle cx="100" cy="108" r="52" fill="#e9edf5" stroke="#1b1440" strokeWidth="4" />
      <circle cx="100" cy="104" r="40" fill="url(#dev-visor)" stroke="#1b1440" strokeWidth="3" />
      {/* pantulan cahaya di visor */}
      <path d="M78 82 Q90 74 104 78" stroke="#eafffe" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75" />
      {/* siluet wajah sederhana di dalam visor */}
      <circle cx="100" cy="100" r="16" fill="#0b1030" opacity="0.55" />
      {/* antena kecil */}
      <line x1="100" y1="56" x2="100" y2="44" stroke="#ffc93c" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="42" r="4" fill="#ff6b4a" />
      {/* kerah baju */}
      <path d="M58 150 Q100 172 142 150 L150 190 L50 190 Z" fill="#3dd9d6" stroke="#1b1440" strokeWidth="3" />
      <circle cx="100" cy="163" r="7" fill="#ffc93c" stroke="#1b1440" strokeWidth="2" />
    </svg>
  );
}