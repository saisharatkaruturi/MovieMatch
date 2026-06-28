import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './Loader.css';

const TOTAL_MS = 1900;

// Cinematic intro:
//   0.00s  Two velvet curtains sweep open from the sides.
//   0.20s  Projector beam fades in across the screen.
//   0.40s  Logo reel starts spinning, spotlight locks on.
//   0.55s  Film strips drop down (top + bottom).
//   0.75s  "MovieMatch" wordmark rises with gradient reveal.
//   0.95s  Tagline types in letter by letter.
//   1.55s  Whole scene fades into the app.
const TAGLINE = 'A cinematic journey through world cinema';

const Loader = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  // Typewriter for the tagline.
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const start = setTimeout(() => {
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setTyped(TAGLINE.slice(0, i));
        if (i < TAGLINE.length) {
          setTimeout(tick, 38);
        }
      };
      tick();
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="loader"
          className="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          aria-label="Loading MovieMatch"
          role="status"
        >
          {/* Deep vignette + ambient glows */}
          <div className="loader__bg" aria-hidden="true">
            <div className="loader__bg-glow loader__bg-glow--cyan" />
            <div className="loader__bg-glow loader__bg-glow--violet" />
            <div className="loader__bg-vignette" />
          </div>

          {/* Velvet curtains that sweep open */}
          <motion.div
            className="loader__curtain loader__curtain--left"
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            transition={{ duration: 0.95, ease: [0.83, 0, 0.17, 1] }}
            aria-hidden="true"
          >
            <div className="loader__curtain-pleats" />
            <div className="loader__curtain-edge" />
          </motion.div>
          <motion.div
            className="loader__curtain loader__curtain--right"
            initial={{ x: 0 }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.95, ease: [0.83, 0, 0.35, 1] }}
            aria-hidden="true"
          >
            <div className="loader__curtain-pleats" />
            <div className="loader__curtain-edge" />
          </motion.div>

          {/* Projector beam */}
          <motion.div
            className="loader__beam"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />

          {/* Top + bottom film strip */}
          <motion.div
            className="loader__strip loader__strip--top"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            aria-hidden="true"
          >
            <div className="loader__strip-track">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={`t-${i}`} className="loader__sprocket" />
              ))}
            </div>
          </motion.div>
          <motion.div
            className="loader__strip loader__strip--bottom"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            aria-hidden="true"
          >
            <div className="loader__strip-track">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={`b-${i}`} className="loader__sprocket" />
              ))}
            </div>
          </motion.div>

          {/* Main content */}
          <div className="loader__content">
            <motion.div
              className="loader__now-showing"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.5 }}
            >
              <span className="loader__now-dot" />
              <span>Now Showing</span>
            </motion.div>

            {/* Spinning reel mark */}
            <motion.div
              className="loader__reel"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 200 200" width="120" height="120" className="loader__reel-svg">
                <defs>
                  <linearGradient id="loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="55%" stopColor="#67E8F9" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                  <radialGradient id="loader-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(34, 211, 238, 0.55)" />
                    <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="92" fill="url(#loader-glow)" />
                <circle cx="100" cy="100" r="84" fill="none" stroke="url(#loader-grad)" strokeWidth="3" />
                <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1.2" />
                {/* 8 sprocket spokes */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  const x1 = 100 + Math.cos(angle) * 72;
                  const y1 = 100 + Math.sin(angle) * 72;
                  const x2 = 100 + Math.cos(angle) * 84;
                  const y2 = 100 + Math.sin(angle) * 84;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#loader-grad)" strokeWidth="3" strokeLinecap="round" />
                  );
                })}
                <circle cx="100" cy="100" r="28" fill="rgba(7, 8, 12, 0.85)" stroke="url(#loader-grad)" strokeWidth="2" />
                <path d="M90 84 L116 100 L90 116 Z" fill="url(#loader-grad)" />
              </svg>
            </motion.div>

            {/* Wordmark */}
            <motion.h1
              className="loader__title"
              initial={{ opacity: 0, y: 16, letterSpacing: '0.04em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
              transition={{ duration: 0.65, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="loader__title-movie">Movie</span>
              <span className="loader__title-match">Match</span>
            </motion.h1>

            <motion.p
              className="loader__tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.95 }}
              aria-live="polite"
            >
              <span className="loader__tagline-text">{typed}</span>
              <span className="loader__caret" aria-hidden="true" />
            </motion.p>

            {/* Progress dots */}
            <motion.div
              className="loader__progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.1 }}
              aria-hidden="true"
            >
              <span /><span /><span /><span /><span />
            </motion.div>
          </div>

          {/* Spotlight cone */}
          <motion.div
            className="loader__spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;