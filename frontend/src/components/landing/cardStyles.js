// One shared look for every landing card, so changing it here changes all of them.
// bg-white/82      = white at 82% opacity (the sky shows through very slightly)
// shadow-[...]     = a custom soft blue shadow (square brackets let us write any CSS value)
// motion-safe:     = the lift on hover only happens if the visitor has NOT asked for less motion
export const cardClasses =
  'rounded-2xl border border-white bg-white/82 shadow-[0_10px_30px_-12px_rgb(37_99_235/0.25)] duration-150 motion-safe:transition-transform motion-safe:hover:-translate-y-1';
