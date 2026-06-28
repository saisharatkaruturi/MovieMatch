import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const OPTIONS = [
  {
    value: 'dark',
    label: 'Dark',
    title: 'Dark theme',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    value: 'light',
    label: 'Light',
    title: 'Light theme',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'Auto',
    title: 'Match system',
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

const ThemeToggle = ({ size = 'sm' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`theme-toggle theme-toggle--${size}`}
      role="radiogroup"
      aria-label="Color theme"
    >
      {OPTIONS.map((opt) => {
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.title}
            title={opt.title}
            className={`theme-toggle__btn ${isActive ? 'is-active' : ''}`}
            onClick={() => setTheme(opt.value)}
          >
            <span className="theme-toggle__icon" aria-hidden="true">{opt.icon}</span>
            {size === 'lg' && <span className="theme-toggle__label">{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
