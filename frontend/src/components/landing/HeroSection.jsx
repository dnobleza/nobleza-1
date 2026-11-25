import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CirclePlay, Headphones, Monitor, Rocket, Zap } from 'lucide-react';
import landingAssets from '../../assets/landingAssets';
import HeroBackground from './HeroBackground';
import HeroScene from './HeroScene';
import { useHeroMotion } from '../../lib/motion';
import { focusRing } from './focusRing';

// The three small feature lines under the buttons.
// "Icon" starts with a capital letter because React treats it as a component.
const MINI_FEATURES = [
  { Icon: Monitor, lines: ['Modern Web', 'Solutions'] },
  { Icon: Zap, lines: ['Reliable', 'Performance'] },
  { Icon: Headphones, lines: ['Dedicated', 'Support'] },
];

// The three small feature lines. The caller passes className for spacing and for when to show
// them (SceneHero uses this list twice: beside the text on xl, under the picture below xl).
function FeatureList({ className }) {
  return (
    <ul className={`flex-wrap gap-2 text-sm text-ink ${className}`}>
      {MINI_FEATURES.map(({ Icon, lines }) => (
        <li
          key={lines[0]}
          className="flex items-center gap-2 rounded-2xl border border-line-cool bg-surface px-3 py-2 shadow-[0_12px_32px_-12px_rgb(15_23_42/0.28)]"
        >
          <Icon aria-hidden="true" className="size-5.5 shrink-0 text-primary-deep" />
          <span>
            {lines[0]}
            <br />
            {lines[1]}
          </span>
        </li>
      ))}
    </ul>
  );
}

// The old hero: a CSS background picture plus a separate mascot. Used only while heroWide
// or heroMobile is null (see HeroSection at the bottom).
function LegacyHero() {
  const { heroBackground, heroMascot } = landingAssets;

  // The background is an image, so we set it with the style prop (plain CSS in JS).
  // Tailwind classes cannot hold a value that is only known at runtime.
  // Layer 1 (top): a fade from clear to light blue at the bottom, so the hero melts into the next section.
  // Layer 2: the picture itself, untouched: "cover" fills the area, "center bottom" keeps the hill and house in view.
  const backgroundStyle = heroBackground
    ? {
        backgroundImage: `linear-gradient(to bottom, transparent 82%, #eaf3ff 100%), url(${heroBackground})`,
        backgroundSize: 'auto, cover',
        backgroundPosition: 'center, center bottom',
        backgroundRepeat: 'no-repeat',
      }
    : { backgroundImage: 'linear-gradient(to bottom, transparent 82%, #eaf3ff 100%)' };

  return (
    // -mt-[88px] pulls the hero up behind the sticky navbar. aria-labelledby points to the h1's id.
    <section
      id="home"
      aria-labelledby="hero-title"
      style={backgroundStyle}
      className="relative -mt-[88px] overflow-hidden bg-[#bfe0fa] px-4 pb-24 pt-32 sm:px-6 lg:pb-40 lg:pt-[140px]"
    >
      {!heroBackground && <HeroBackground />}

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-primary-deep shadow-sm">
            <Rocket aria-hidden="true" className="size-4" />
            Build. Innovate. Grow.
          </span>

          <h1
            id="hero-title"
            className="mb-4 mt-5 text-[40px] font-bold leading-[46px] tracking-tight text-navy-deep sm:text-[52px] sm:leading-[58px] lg:text-[60px] lg:leading-[66px]"
          >
            Your Digital
            <br />
            <span className="text-accent-strong">Growth</span> Partner
          </h1>

          <p className="max-w-md text-lg leading-7 text-gray-700">
            From stunning websites to powerful software, CodeHaus helps you turn ideas into real
            solutions.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/register"
              className={`inline-flex items-center gap-2 rounded-full bg-accent-strong px-6 py-3 font-semibold text-white transition-colors duration-150 hover:bg-accent-strong-hover ${focusRing}`}
            >
              Start a project
              <ArrowRight aria-hidden="true" className="size-4.5" />
            </Link>
            <a
              href="#portfolio"
              className={`inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink shadow-sm transition-colors duration-150 hover:bg-primary-soft ${focusRing}`}
            >
              <CirclePlay aria-hidden="true" className="size-5 text-primary-deep" />
              View Our Work
            </a>
          </div>

          {/* Hidden on phones (hidden sm:flex): small text over the skyline is hard to read there,
              and the next section says the same things. The dividers are borders on every item
              except the last (last:border-0). */}
          <ul className="mt-8 hidden flex-wrap gap-y-4 text-sm text-gray-700 sm:flex">
            {MINI_FEATURES.map(({ Icon, lines }) => (
              <li
                key={lines[0]}
                className="flex items-center gap-2 border-r border-primary-cloud pr-4 last:border-0 sm:pr-5 [&:not(:first-child)]:pl-4 sm:[&:not(:first-child)]:pl-5"
              >
                <Icon aria-hidden="true" className="size-5.5 shrink-0 text-primary-deep" />
                <span>
                  {lines[0]}
                  <br />
                  {lines[1]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mascot: below the text on mobile, on the grassy hill (left of the house) on desktop. */}
        <div className="relative mt-4 flex items-end justify-center lg:mt-[90px] lg:justify-start">
          {heroMascot && (
            <img
              src={heroMascot}
              alt=""
              width={600}
              height={600}
              loading="eager"
              className="relative w-56 max-w-full drop-shadow-[0_18px_18px_rgb(30_64_175/0.18)] sm:w-72 lg:-ml-5 lg:w-[360px]"
            />
          )}
          {/* Three orange spark lines near the raised fist. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 50 60"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="5"
            strokeLinecap="round"
            className="absolute left-[58%] top-0 hidden w-[60px] lg:block"
          >
            <path d="M18 6 L28 22" />
            <path d="M30 30 L46 32" />
            <path d="M28 46 L42 54" />
          </svg>
        </div>
      </div>
    </section>
  );
}

// The new hero: text on top, hero picture underneath (phones) or behind (1280px and up).
function SceneHero({ heroWide, heroMobile }) {
  const { words, word } = useHeroMotion();

  return (
    // -mt-[88px] pulls the hero up behind the sticky navbar.
    // bg-sky is the page's light blue, so the pale top of the mobile image blends in.
    // xl:min-h-[min(46vw,780px)] = hero height that follows the screen width (max 780px),
    // so the picture is never scaled much bigger than the free sky behind the text.
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative -mt-[88px] overflow-hidden bg-sky xl:min-h-[min(46vw,780px)]"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-4 pt-36 sm:px-6 xl:pb-16 xl:pt-36">
        <div className="xl:max-w-[470px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-primary-deep shadow-sm">
            <Rocket aria-hidden="true" className="size-4" />
            Build. Innovate. Grow.
          </span>

          {/* Each word is its own inline-block span so it can rise on its own.
              The real spaces between the spans keep the sentence readable for screen readers. */}
          <motion.h1
            id="hero-title"
            variants={words}
            initial="hidden"
            animate="show"
            className="mb-4 mt-5 text-[40px] font-bold leading-[46px] tracking-tight text-navy-deep sm:text-[52px] sm:leading-[58px] lg:text-[60px] lg:leading-[66px]"
          >
            <motion.span variants={word} className="inline-block">Your</motion.span>{' '}
            <motion.span variants={word} className="inline-block">Digital</motion.span>
            <br />
            <motion.span variants={word} className="inline-block text-accent-strong">Growth</motion.span>{' '}
            <motion.span variants={word} className="inline-block">Partner</motion.span>
          </motion.h1>

          <p className="max-w-md text-lg leading-7 text-gray-700">
            From stunning websites to powerful software, CodeHaus helps you turn ideas into real
            solutions.
          </p>

          {/* Buttons: stacked and full width on phones (flex-col, w-full), side by side from 640px. */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/register"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-strong px-6 py-3 font-semibold text-white transition-colors duration-150 hover:bg-accent-strong-hover sm:w-auto ${focusRing}`}
            >
              Start a project
              <ArrowRight aria-hidden="true" className="size-4.5" />
            </Link>
            <a
              href="#portfolio"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink shadow-sm transition-colors duration-150 hover:bg-primary-soft sm:w-auto ${focusRing}`}
            >
              <CirclePlay aria-hidden="true" className="size-5 text-primary-deep" />
              View Our Work
            </a>
          </div>

          {/* Desktop copy of the features (xl and up). Below xl they show under the picture instead. */}
          <FeatureList className="mt-8 hidden xl:flex" />
        </div>
      </div>

      <HeroScene wide={heroWide} mobile={heroMobile} />

      {/* Below xl: the same features, under the picture. Hidden (display: none) from xl up. */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 xl:hidden">
        <FeatureList className="flex" />
      </div>
    </section>
  );
}

// Picks the layout: the new one when both images exist, otherwise the old look.
function HeroSection() {
  const { heroWide, heroMobile } = landingAssets;

  if (heroWide && heroMobile) {
    return <SceneHero heroWide={heroWide} heroMobile={heroMobile} />;
  }
  return <LegacyHero />;
}

export default HeroSection;
