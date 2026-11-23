import logo from '../assets/logo/logo.svg';
import pilandokWorking from '../assets/mascot/pilandok-working.webp';
import pilandokCelebrating from '../assets/mascot/pilandok-celebrating.webp';

// The pieces below are small decorations drawn with inline SVG.
// They are all aria-hidden: screen readers skip them.

function Clouds() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 700"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <g fill="#ffffff" opacity="0.45">
        <circle cx="40" cy="330" r="46" />
        <circle cx="95" cy="305" r="62" />
        <circle cx="160" cy="335" r="48" />
        <rect x="-20" y="330" width="220" height="50" rx="25" />
      </g>
      <g fill="#ffffff" opacity="0.35">
        <circle cx="300" cy="150" r="30" />
        <circle cx="340" cy="135" r="40" />
        <circle cx="385" cy="155" r="30" />
        <rect x="275" y="150" width="150" height="34" rx="17" />
      </g>
      <g fill="#93c5fd" opacity="0.35">
        <circle cx="330" cy="420" r="44" />
        <circle cx="385" cy="400" r="58" />
        <rect x="285" y="420" width="160" height="44" rx="22" />
      </g>
    </svg>
  );
}

function Waves({ variant }) {
  const isRegister = variant === 'register';
  // Register has a taller wave because it holds the "Join CodeHaus" text.
  const height = isRegister ? 'h-[34%]' : 'h-[22%]';
  const viewBox = isRegister ? '0 0 400 240' : '0 0 400 154';

  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute bottom-0 left-0 w-full ${height}`}
    >
      <defs>
        <linearGradient id={`wave-blue-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e40af" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {isRegister ? (
        <>
          <path
            d="M0 60 C90 10 230 40 400 120 L400 240 L0 240 Z"
            fill="#f59e0b"
          />
          <path
            d="M0 80 C100 36 240 64 400 138 L400 240 L0 240 Z"
            fill={`url(#wave-blue-${variant})`}
          />
        </>
      ) : (
        <>
          <path
            d="M0 20 C110 6 250 70 400 112 L400 154 L0 154 Z"
            fill="#f59e0b"
          />
          <path
            d="M0 56 C120 44 260 100 400 130 L400 154 L0 154 Z"
            fill={`url(#wave-blue-${variant})`}
          />
        </>
      )}
    </svg>
  );
}

function CodeWindow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 80"
      className="pointer-events-none absolute top-[47%] right-[5%] w-24"
    >
      <rect width="96" height="80" rx="10" fill="#93c5fd" opacity="0.65" />
      <rect width="96" height="16" rx="10" fill="#60a5fa" opacity="0.7" />
      <circle cx="10" cy="8" r="2.5" fill="#ffffff" />
      <circle cx="19" cy="8" r="2.5" fill="#ffffff" />
      <circle cx="28" cy="8" r="2.5" fill="#ffffff" />
      <text
        x="48"
        y="54"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="26"
        fontWeight="700"
        fill="#ffffff"
      >
        {'</>'}
      </text>
    </svg>
  );
}

function Plant() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 70"
      className="pointer-events-none absolute right-[3%] bottom-[24%] w-14"
    >
      <path d="M30 70 C30 50 28 36 30 20" stroke="#15803d" strokeWidth="3" fill="none" />
      <path d="M30 36 C14 34 6 22 8 8 C24 8 32 20 30 36 Z" fill="#22c55e" />
      <path d="M30 28 C44 26 54 16 52 2 C38 4 28 14 30 28 Z" fill="#16a34a" />
    </svg>
  );
}

function Sparks() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 50 60"
      className="pointer-events-none absolute top-[27%] right-[8%] w-10"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="4"
      strokeLinecap="round"
    >
      <path d="M26 6 L36 22" />
      <path d="M32 30 L46 34" />
      <path d="M30 46 L44 52" />
    </svg>
  );
}

function Swoosh() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 12"
      className="mx-auto mt-2 w-28"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M4 9 C30 2 80 2 116 6" />
    </svg>
  );
}

function BrandPanel({ variant }) {
  const isRegister = variant === 'register';

  return (
    <div className="relative hidden flex-col items-center overflow-hidden bg-linear-to-b from-primary-cloud to-primary-tint md:flex">
      <Clouds />

      <div className="relative z-10 flex flex-col items-center px-6 pt-6">
        <img src={logo} alt="CodeHaus" className="w-44" />
        <p className="mt-1 font-heading text-lg font-semibold text-navy">
          Build. Innovate. Grow.
        </p>
      </div>

      {isRegister ? <Sparks /> : <CodeWindow />}
      {!isRegister && <Plant />}

      <img
        src={isRegister ? pilandokCelebrating : pilandokWorking}
        alt=""
        aria-hidden="true"
        width={600}
        height={600}
        loading="lazy"
        className={`absolute left-1/2 z-10 h-[52%] w-auto max-w-[90%] -translate-x-1/2 ${
          isRegister ? 'bottom-[25%]' : 'bottom-[10%]'
        }`}
      />

      <Waves variant={variant} />

      {isRegister && (
        <div className="absolute inset-x-0 bottom-7 z-20 px-8 text-center text-white">
          <p className="font-heading text-[28px] leading-9 font-bold">
            Join CodeHaus
          </p>
          <p className="mt-1 text-base">
            Turn your ideas into amazing digital solutions.
          </p>
          <Swoosh />
        </div>
      )}
    </div>
  );
}

function AuthLayout({ variant, children }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-linear-to-b from-primary-tint to-primary-tint-strong p-4 md:h-dvh md:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-surface shadow-[0_24px_64px_-16px_rgb(37_99_235/0.25)] md:h-[min(720px,calc(100dvh-3rem))] md:grid-cols-[48fr_52fr] md:grid-rows-1">
        <BrandPanel variant={variant} />

        <div className="flex justify-center overflow-y-auto p-6 md:p-12">
          <div className="my-auto w-full max-w-[400px]">
            {/* Mobile only: the brand panel is hidden, so show a small logo */}
            <img
              src={logo}
              alt="CodeHaus"
              className="mx-auto mb-2 w-28 md:hidden"
            />
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
