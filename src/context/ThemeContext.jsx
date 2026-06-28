import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

const THEME_KEY = 'moviematch_theme_v1';

const ThemeContext = createContext(null);

const safeRead = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
};

const safeWrite = (value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_KEY, value);
  } catch {
    // ignore quota / private mode
  }
};

const isValidTheme = (t) => t === 'dark' || t === 'light' || t === 'system';

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme) => (theme === 'system' ? getSystemTheme() : theme);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const stored = safeRead();
    return isValidTheme(stored) ? stored : 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));

  // Apply theme to <html data-theme> before paint to avoid flash.
  useLayoutEffect(() => {
    const next = resolveTheme(theme);
    setResolvedTheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
  }, [theme]);

  // When in 'system' mode, follow OS preference changes live.
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const next = e.matches ? 'dark' : 'light';
      setResolvedTheme(next);
      document.documentElement.setAttribute('data-theme', next);
    };
    // addEventListener is the modern API; fall back for older Safari.
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!isValidTheme(next)) return;
    setThemeState(next);
    safeWrite(next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback for components rendered outside the provider.
    return {
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: () => {},
    };
  }
  return ctx;
};

export default ThemeProvider;
