import { motion } from 'motion/react';
import { useMotionSafe } from '../../lib/motion';

// Wraps any content and fades it in when it scrolls into view.
// Props:
//   children  = whatever goes inside (heading, card grid, ...)
//   className = optional classes for the wrapper div
function Reveal({ children, className }) {
  const { item } = useMotionSafe();

  return (
    <motion.div
      className={className}
      variants={item}
      initial="hidden"
      // whileInView switches to "show" when the element enters the screen.
      whileInView="show"
      // once: true = play one time only, never again when scrolling back.
      // margin: wait until the element is 80px inside the screen edge.
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
