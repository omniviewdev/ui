import {
  useCallback,
  useInsertionEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { createThemeRootApplier } from './applyTheme';
import { ThemeContext } from './context';
import { themeRegistry } from './registry';
import type { ThemeRegistry } from './registry';
import type { ThemeDensity, ThemeMode, ThemeMotion } from './types';

const DENSITY_ATTR = 'data-ov-density';
const MOTION_ATTR = 'data-ov-motion';
const ROOT_PREFERENCE_OWNER = new WeakMap<HTMLElement, symbol>();

export interface ThemeProviderProps extends PropsWithChildren {
  themeId: string;
  onThemeChange?: (themeId: string) => void;
  fallbackThemeId?: string;
  initialDensity?: ThemeDensity;
  initialMotion?: ThemeMotion;
  registry?: ThemeRegistry;
  root?: HTMLElement | null;
}

export function ThemeProvider({
  children,
  themeId,
  onThemeChange,
  fallbackThemeId = 'void',
  initialDensity = 'comfortable',
  initialMotion = 'normal',
  registry = themeRegistry,
  root,
}: ThemeProviderProps) {
  useSyncExternalStore(registry.subscribe, registry.getSnapshot, registry.getSnapshot);

  const requestedTheme = registry.get(themeId);
  const configuredFallback = registry.get(fallbackThemeId);
  const defaultFallback = registry.get('void');
  const activeTheme = requestedTheme ?? configuredFallback ?? defaultFallback;
  if (!activeTheme) throw new Error('Theme registry must contain the built-in "void" theme');
  const isFallback = requestedTheme === undefined;

  useInsertionEffect(() => {
    const target = root === undefined
      ? (typeof document === 'undefined' ? null : document.documentElement)
      : root;
    if (!target) return;

    const applier = createThemeRootApplier(target);
    applier.apply(activeTheme);
    return applier.cleanup;
  }, [activeTheme, root]);

  const setTheme = useCallback((nextThemeId: ThemeMode) => {
    onThemeChange?.(nextThemeId);
  }, [onThemeChange]);

  const [density, setDensity] = useState<ThemeDensity>(initialDensity);
  const [motion, setMotion] = useState<ThemeMotion>(initialMotion);
  const preferenceOwnerRef = useRef(Symbol('ThemeProviderPreferences'));
  useInsertionEffect(() => {
    const target = root === undefined
      ? (typeof document === 'undefined' ? null : document.documentElement)
      : root;
    if (!target) return;

    const owner = preferenceOwnerRef.current;
    ROOT_PREFERENCE_OWNER.set(target, owner);
    target.setAttribute(DENSITY_ATTR, density);
    target.setAttribute(MOTION_ATTR, motion);
    return () => {
      if (ROOT_PREFERENCE_OWNER.get(target) !== owner) return;
      target.removeAttribute(DENSITY_ATTR);
      target.removeAttribute(MOTION_ATTR);
      ROOT_PREFERENCE_OWNER.delete(target);
    };
  }, [density, motion, root]);

  const value = useMemo(
    () => ({
      requestedThemeId: themeId,
      activeTheme,
      isFallback,
      density,
      motion,
      setTheme,
      setDensity,
      setMotion,
    }),
    [themeId, activeTheme, isFallback, density, motion, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
