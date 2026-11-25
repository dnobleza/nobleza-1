// One shared look for every landing card, so changing it here changes all of them.
// bg-surface       = solid white, so the card stands out against the cool-gray page
// border-line-cool = a 1px blue-gray edge (white on white would be invisible)
// shadow-[...]     = a custom soft shadow (square brackets let us write any CSS value)
// motion-safe:     = the lift on hover only happens if the visitor has NOT asked for less motion
export const cardClasses =
  'rounded-2xl border border-line-cool bg-surface shadow-[0_12px_32px_-12px_rgb(15_23_42/0.28)] duration-150 motion-safe:transition-transform motion-safe:hover:-translate-y-1';
