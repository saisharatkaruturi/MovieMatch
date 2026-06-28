import './Logo.css';

// Branded MovieMatch logo: a stylized film reel (concentric rings + sprocket
// ticks) cradling a play triangle, all rendered in the cyan→violet gradient.
// Used in Navbar, footer, and as a standalone lockup.

const SIZES = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 72,
};

const Logo = ({ size = 'md', showWordmark = true, className = '' }) => {
  const px = SIZES[size] ?? SIZES.md;
  return (
    <span
      className={`logo ${className}`}
      style={{ '--logo-size': `${px}px` }}
      aria-label="MovieMatch"
    >
      <span className="logo__mark" aria-hidden="true">
        <svg
          viewBox="0 0 64 64"
          width={px}
          height={px}
          xmlns="http://www.w3.org/2000/svg"
          className="logo__svg"
        >
          <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="55%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
            <linearGradient id="logo-grad-soft" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.5)" />
              <stop offset="100%" stopColor="rgba(167, 139, 250, 0.5)" />
            </linearGradient>
            <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.6)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
            </radialGradient>
          </defs>

          {/* Soft halo behind the mark — gives it a luminous quality */}
          <circle cx="32" cy="32" r="30" fill="url(#logo-glow)" />

          {/* Outer reel ring */}
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="url(#logo-grad)"
            strokeWidth="2.5"
          />

          {/* Inner reel ring */}
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="none"
            stroke="url(#logo-grad-soft)"
            strokeWidth="1.2"
          />

          {/* Sprocket ticks — 8 around the outer edge */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x1 = 32 + Math.cos(angle) * 24;
            const y1 = 32 + Math.sin(angle) * 24;
            const x2 = 32 + Math.cos(angle) * 28.5;
            const y2 = 32 + Math.sin(angle) * 28.5;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#logo-grad)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Play triangle — sits at center, slightly off for visual rhythm */}
          <path
            d="M27 22 L44 32 L27 42 Z"
            fill="url(#logo-grad)"
            strokeLinejoin="round"
          />

          {/* Tiny inner highlight dot on the play triangle */}
          <circle cx="32" cy="32" r="1.6" fill="rgba(7, 8, 12, 0.5)" />
        </svg>
      </span>

      {showWordmark && (
        <span className="logo__wordmark">
          <span className="logo__brand text-display">Movie</span>
          <span className="logo__brand logo__brand--accent text-display">Match</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
