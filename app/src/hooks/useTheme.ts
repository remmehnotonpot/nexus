import { useState, useEffect, useCallback, useMemo } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'swish-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      return stored || 'system';
    }
    return 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const resolvedTheme = useMemo(() => {
    return theme === 'system' ? systemTheme : theme;
  }, [systemTheme, theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [resolvedTheme, theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setLight = useCallback(() => setTheme('light'), []);
  const setDark = useCallback(() => setTheme('dark'), []);
  const setSystem = useCallback(() => setTheme('system'), []);
  const toggle = useCallback(() => {
    setTheme((prev: Theme) => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme,
    setLight,
    setDark,
    setSystem,
    toggle,
    isDark: resolvedTheme === 'dark',
  };
}
