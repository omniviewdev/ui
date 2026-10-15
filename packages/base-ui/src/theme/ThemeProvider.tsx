import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { ThemeContext } from './context';
import { themeRegistry } from './registry';
import { dottedKeyToCssVar } from './registry/keyTransform';
import type { ThemeDensity, ThemeMode, ThemeMotion } from './types';

const DENSITY_ATTR = 'data-ov-density';
const MOTION_ATTR = 'data-ov-motion';

const THEME_STORAGE_KEY = 'ov-theme-mode';
const DENSITY_STORAGE_KEY = 'ov-theme-density';
const MOTION_STORAGE_KEY = 'ov-theme-motion';
interface RootThemeOwner {
  token: symbol;
  properties: Set<string>;
}

const ROOT_THEME_OWNER = new WeakMap<HTMLElement, RootThemeOwner>();

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
  const pendingThemeIdRef = useRef<string | null>(null);
  const activeThemeIdRef = useRef<ThemeMode | null>(null);
  const activeBaseRef = useRef<ThemeMode>('dark');
  const domOwnerRef = useRef(Symbol('ThemeProvider'));
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (!persist) return initialTheme;
    const stored = getStored(THEME_STORAGE_KEY);
    if (stored && themeRegistry.has(stored)) return stored;
    if (stored) pendingThemeIdRef.current = stored;
    return initialTheme;
  });

  const applyTheme = (next: ThemeMode) => {
    const registered = themeRegistry.get(next);
    if (!registered) {
      pendingThemeIdRef.current = next;
      return;
    }
    const root = document.documentElement;
    const previousOwner = ROOT_THEME_OWNER.get(root);
    if (previousOwner) {
      for (const property of previousOwner.properties) root.style.removeProperty(property);
    }
    const properties = new Set<string>();
    ROOT_THEME_OWNER.set(root, { token: domOwnerRef.current, properties });
    root.setAttribute('data-ov-theme', registered.builtIn ? registered.id : registered.base);
    if (registered.builtIn) root.removeAttribute('data-ov-theme-custom');
    else root.setAttribute('data-ov-theme-custom', registered.id);
    root.style.colorScheme = registered.appearance;
    if (!registered.builtIn) {
      for (const [key, value] of Object.entries(registered.definition.tokens)) {
        if (value === undefined) continue;
        const property = dottedKeyToCssVar(key);
        root.style.setProperty(property, value);
        properties.add(property);
      }
    }
    activeThemeIdRef.current = next;
    activeBaseRef.current = registered.base;
    setThemeState(next);
    if (persist && typeof window !== 'undefined') window.localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  useEffect(() => {
    applyTheme(theme);
    const unsubscribe = themeRegistry.subscribe(() => {
      const pending = pendingThemeIdRef.current;
      if (pending && themeRegistry.has(pending)) {
        pendingThemeIdRef.current = null;
        applyTheme(pending);
        return;
      }
      const active = activeThemeIdRef.current;
      if (active && !themeRegistry.has(active)) applyTheme(activeBaseRef.current);
    });
    return () => {
      unsubscribe();
      const root = document.documentElement;
      const owner = ROOT_THEME_OWNER.get(root);
      if (owner?.token !== domOwnerRef.current) return;
      for (const property of owner.properties) root.style.removeProperty(property);
      root.removeAttribute('data-ov-theme-custom');
      ROOT_THEME_OWNER.delete(root);
    };
    // The registry and initial theme are intentionally consumed once at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = (next: ThemeMode) => applyTheme(next);

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
