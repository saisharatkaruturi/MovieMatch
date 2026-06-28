import { motion, useReducedMotion } from 'framer-motion';

// MotionSection — scroll-reveal wrapper. Children that need to stagger should
// use MotionItem as their immediate descendant. When prefers-reduced-motion
// is set, the wrapper is a plain <div> with no animation.

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export const MotionSection = ({ children, className, as = 'section', delay = 0 }) => {
  const reduced = useReducedMotion();
  const Comp = motion[as] || motion.section;
  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ ...sectionVariants, show: { ...sectionVariants.show, transition: { ...sectionVariants.show.transition, delay } } }}
    >
      {children}
    </Comp>
  );
};

export const MotionItem = ({ children, className, as = 'div' }) => {
  const reduced = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp className={className} variants={itemVariants}>
      {children}
    </Comp>
  );
};

// MotionPage — wraps a page inside AnimatePresence for route transitions.
// Use as: <AnimatePresence mode="wait"> <MotionPage key={location.pathname}> ... </MotionPage> </AnimatePresence>

export const MotionPage = ({ children, className }) => {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default MotionSection;