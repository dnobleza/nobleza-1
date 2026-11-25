import { motion } from 'motion/react';
import { useHeroMotion } from '../../lib/motion';

// The hero picture (Pilandok + the Codehaus building are part of the image).
// Props:
//   wide   = the big desktop image (1792x768), used from 1280px up
//   mobile = the smaller image (1200x976), used below 1280px
function HeroScene({ wide, mobile }) {
  const { scene } = useHeroMotion();

  return (
    // <picture> lets the browser choose ONE file, so a phone never downloads the wide one.
    // Below xl it sits in the normal flow, full width. From xl up it fills the whole hero
    // (absolute inset-0) behind the text (z-0).
    <picture className="block xl:absolute xl:inset-0 xl:z-0">
      <source media="(min-width: 1280px)" srcSet={wide} width={1792} height={768} />
      <motion.img
        src={mobile}
        width={1200}
        height={976}
        alt=""
        // Above the fold, so never lazy-load. fetchPriority asks the browser to load it first.
        loading="eager"
        fetchPriority="high"
        variants={scene}
        initial="hidden"
        animate="show"
        // object-cover fills the box, object-right-bottom keeps the house (right) and clouds (bottom).
        className="block h-auto w-full xl:size-full xl:object-cover xl:object-right-bottom"
      />
    </picture>
  );
}

export default HeroScene;
