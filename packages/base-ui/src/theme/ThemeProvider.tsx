import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ThemeContext } from './context';
import type { ThemeDensity, ThemeMode, ThemeMotion } from './types';

const THEME_ATTR = 'data-ov-theme';
const DENSITY_ATTR = 'data-ov-density';
const MOTION_ATTR = 'data-ov-motion';

const THEME_STORAGE_KEY = 'ov-theme-mode';
const DENSITY_STORAGE_KEY = 'ov-theme-density';
const MOTION_STORAGE_KEY = 'ov-theme-motion';

export interface ThemeProviderProps extends PropsWithChildren {
  initialTheme?: ThemeMode;
  initialDensity?: ThemeDensity;
  initialMotion?: ThemeMotion;
  persist?: boolean;
}

function getInitialThemeValue<T extends string>(
  storageKey: string,
  fallback: T,
  isValid: (value: string) => value is T,
): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = window.localStorage.getItem(storageKey);
  return value && isValid(value) ? value : fallback;
}

const isThemeMode = (value: string): value is ThemeMode =>
  value === 'dark' ||
  value === 'light' ||
  value === 'high-contrast-dark' ||
  value === 'high-contrast-light' ||
  value === 'obsidian' ||
  value === 'carbon' ||
  value === 'void';

const isThemeDensity = (value: string): value is ThemeDensity =>
  value === 'compact' || value === 'comfortable';

const isThemeMotion = (value: string): value is ThemeMotion =>
  value === 'normal' || value === 'reduced';

export function ThemeProvider({
  children,
  initialTheme = 'dark',
  initialDensity = 'comfortable',
  initialMotion = 'normal',
  persist = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(() =>
    persist ? getInitialThemeValue(THEME_STORAGE_KEY, initialTheme, isThemeMode) : initialTheme,
  );
  const [density, setDensity] = useState<ThemeDensity>(() =>
    persist
      ? getInitialThemeValue(DENSITY_STORAGE_KEY, initialDensity, isThemeDensity)
      : initialDensity,
  );
  const [motion, setMotion] = useState<ThemeMotion>(() =>
    persist
      ? getInitialThemeValue(MOTION_STORAGE_KEY, initialMotion, isThemeMotion)
      : initialMotion,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(THEME_ATTR, theme);

    // Allow browser-native controls to align with the active mode.
    root.style.colorScheme =
      theme === 'light' || theme === 'high-contrast-light' ? 'light' : 'dark';

    if (persist) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [persist, theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(DENSITY_ATTR, density);

    if (persist) {
      window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
    }
  }, [density, persist]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(MOTION_ATTR, motion);

    if (persist) {
      window.localStorage.setItem(MOTION_STORAGE_KEY, motion);
    }
  }, [motion, persist]);

  const value = useMemo(
    () => ({ theme, density, motion, setTheme, setDensity, setMotion }),
    [density, motion, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
