// Fallback hero scene, drawn with SVG. It only shows while
// landingAssets.heroBackground is null (no illustrated image yet).
// aria-hidden="true" tells screen readers to skip it: it is decoration.
function HeroBackground() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 620"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 size-full"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8EC5F5" />
          <stop offset="1" stopColor="#DCEEFF" />
        </linearGradient>
        <linearGradient id="hero-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7CC24A" />
          <stop offset="1" stopColor="#4F9A2E" />
        </linearGradient>
      </defs>

      <rect width="1440" height="620" fill="url(#hero-sky)" />

      {/* Clouds */}
      <g fill="#fff" opacity="0.9">
        <ellipse cx="120" cy="90" rx="150" ry="46" />
        <ellipse cx="260" cy="120" rx="110" ry="34" />
        <ellipse cx="1180" cy="80" rx="170" ry="44" />
      </g>

      {/* Skyline */}
      <g fill="#9FC3E8" opacity="0.8">
        <rect x="640" y="300" width="40" height="200" />
        <rect x="690" y="250" width="48" height="250" />
        <rect x="748" y="320" width="44" height="180" />
        <rect x="802" y="280" width="36" height="220" />
      </g>

      {/* House: white walls, blue roof */}
      <rect x="1020" y="260" width="380" height="230" fill="#fff" />
      <polygon points="1000,260 1440,200 1440,262 1000,282" fill="#2F5FD0" />
      <g fill="#7FB4E8">
        <rect x="1050" y="300" width="70" height="60" />
        <rect x="1140" y="300" width="70" height="60" />
        <rect x="1230" y="300" width="70" height="60" />
        <rect x="1320" y="300" width="70" height="60" />
      </g>

      {/* Grassy hill */}
      <path d="M0 470 C300 400 700 440 1000 450 C1200 456 1340 430 1440 410 L1440 620 L0 620 Z" fill="url(#hero-hill)" />
    </svg>
  );
}

export default HeroBackground;
