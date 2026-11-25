// Shared motion settings for the landing page.
// Rules come from DESIGN.md section 4: animate only opacity and transform,
// nothing longer than 0.3 seconds, no bounce or spring.
// One exception: the landing hero entrance may run up to 0.6 seconds (DESIGN.md section 9).
import { useReducedMotion } from 'motion/react';

// Durations are in SECONDS (the motion library uses seconds, not milliseconds).
export const DURATION = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3, // the maximum for everything except the hero
  hero: 0.6, // the hero entrance only
};

// "easeOut" = starts quick, ends gentle. Matches the ease-out rule in DESIGN.md.
export const EASE = 'easeOut';

// Variants are named animation states. An element switches between "hidden" and "show".
// fadeUp: starts invisible and 12px lower, ends fully visible in its normal place.
export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE } },
};

// fade: same idea, but with no movement. Used when the visitor asked for reduced motion.
export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE } },
};

// stagger: a parent variant that makes its children start one after another.
// DEFINED BUT NOT USED YET. DESIGN.md still forbids staggered card reveals.
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

// Hook that picks the right variants for this visitor.
// useReducedMotion() is true when the operating system has "reduce motion" turned on.
export function useMotionSafe() {
  const reduce = useReducedMotion();
  return {
    reduce,
    item: reduce ? fade : fadeUp,
    // With reduced motion there is no stagger delay either.
    container: reduce ? { hidden: {}, show: {} } : stagger,
  };
}

// ---- Hero entrance (landing hero only, plays once on page load) ----
// Timeline: words start at 0 / 0.06 / 0.12 / 0.18s and each takes 0.4s, so the last word
// ends at 0.58s. The scene image fades and settles in 0.6s. Nothing runs past 0.6s.

// Parent of the headline words: makes them start one after another, 60ms apart.
const heroWords = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

// One headline word: rises 0.4em (a bit under half a line) while fading in.
const heroWord = {
  hidden: { opacity: 0, y: '0.4em' },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

// The scene image: fades in and settles from 2% bigger to normal size.
const heroScene = {
  hidden: { opacity: 0, scale: 1.02 },
  show: { opacity: 1, scale: 1, transition: { duration: DURATION.hero, ease: EASE } },
};

// Same hook idea as useMotionSafe: with reduced motion, no movement and no scaling,
// only a plain fade (opacity), and no stagger.
export function useHeroMotion() {
  const reduce = useReducedMotion();
  if (reduce) {
    return {
      words: { hidden: {}, show: {} },
      word: fade,
      scene: fade,
    };
  }
  return { words: heroWords, word: heroWord, scene: heroScene };
}
