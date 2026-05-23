import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { ThemeContext } from './context';
import { themeRegistry } from './registry';
import type { ThemeDensity, ThemeMode, ThemeMotion } from './types';

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

function getStored(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

const isThemeDensity = (v: string): v is ThemeDensity => v === 'compact' || v === 'comfortable';
const isThemeMotion = (v: string): v is ThemeMotion => v === 'normal' || v === 'reduced';

export function ThemeProvider({
  children,
  initialTheme = 'dark',
  initialDensity = 'comfortable',
  initialMotion = 'normal',
  persist = true,
}: ThemeProviderProps) {
  // --- THEME ---
  // Resolve an initial theme id. If localStorage has a registered id, use that;
  // otherwise fall back to `initialTheme` and remember the pending id (if any)
  // so we can auto-apply it when a matching `registered` event arrives.
  const pendingThemeIdRef = useRef<string | null>(null);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (!persist) {
      if (!themeRegistry.has(initialTheme)) pendingThemeIdRef.current = initialTheme;
      return initialTheme;
    }
    const stored = getStored(THEME_STORAGE_KEY);
    if (stored && themeRegistry.has(stored)) return stored;
    if (stored) pendingThemeIdRef.current = stored;
    else if (!themeRegistry.has(initialTheme)) pendingThemeIdRef.current = initialTheme;
    return initialTheme;
  });

  // Subscribe before apply so the initial `applied` event isn't missed, and
  // skip apply when the resolved theme isn't registered yet (the `registered`
  // handler below auto-applies it once it lands).
  useEffect(() => {
    const unsubscribe = themeRegistry.subscribe((event) => {
      if (event.type === 'applied') {
        setThemeState(event.id);
        if (persist && typeof window !== 'undefined') {
          window.localStorage.setItem(THEME_STORAGE_KEY, event.id);
        }
      } else if (event.type === 'registered') {
        if (pendingThemeIdRef.current === event.id) {
          pendingThemeIdRef.current = null;
          themeRegistry.apply(event.id);
        }
      }
    });
    if (themeRegistry.has(theme)) {
      themeRegistry.apply(theme);
    }
    return unsubscribe;
    // Intentionally only on mount. `theme` state is updated via the subscriber.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = (next: ThemeMode) => {
    themeRegistry.apply(next);
    // State update flows through the `applied` listener above.
  };

  // --- DENSITY ---
  const [density, setDensity] = useState<ThemeDensity>(() => {
    if (!persist) return initialDensity;
    const stored = getStored(DENSITY_STORAGE_KEY);
    return stored && isThemeDensity(stored) ? stored : initialDensity;
  });
  useEffect(() => {
    document.documentElement.setAttribute(DENSITY_ATTR, density);
    if (persist) window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
  }, [density, persist]);

  // --- MOTION ---
  const [motion, setMotion] = useState<ThemeMotion>(() => {
    if (!persist) return initialMotion;
    const stored = getStored(MOTION_STORAGE_KEY);
    return stored && isThemeMotion(stored) ? stored : initialMotion;
  });
  useEffect(() => {
    document.documentElement.setAttribute(MOTION_ATTR, motion);
    if (persist) window.localStorage.setItem(MOTION_STORAGE_KEY, motion);
  }, [motion, persist]);

  const value = useMemo(
    () => ({ theme, density, motion, setTheme, setDensity, setMotion }),
    [theme, density, motion],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
