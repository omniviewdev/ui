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
interface RootPreferenceEntry {
  density: ThemeDensity;
  motion: ThemeMotion;
}

interface RootPreferenceOwners {
  entries: RootPreferenceEntry[];
}

const ROOT_PREFERENCE_OWNERS = new WeakMap<HTMLElement, RootPreferenceOwners>();

function applyRootPreferences(
  root: HTMLElement,
  entry: RootPreferenceEntry,
  density: ThemeDensity,
  motion: ThemeMotion,
): () => void {
  let owners = ROOT_PREFERENCE_OWNERS.get(root);
  if (!owners) {
    owners = { entries: [] };
    ROOT_PREFERENCE_OWNERS.set(root, owners);
  }

  const previousIndex = owners.entries.indexOf(entry);
  if (previousIndex >= 0) owners.entries.splice(previousIndex, 1);
  entry.density = density;
  entry.motion = motion;
  owners.entries.push(entry);
  root.setAttribute(DENSITY_ATTR, density);
  root.setAttribute(MOTION_ATTR, motion);

  return () => {
    if (ROOT_PREFERENCE_OWNERS.get(root) !== owners) return;
    const index = owners.entries.indexOf(entry);
    if (index < 0) return;
    const wasCurrent = index === owners.entries.length - 1;
    owners.entries.splice(index, 1);
    if (!wasCurrent) return;

    const previous = owners.entries[owners.entries.length - 1];
    if (previous) {
      root.setAttribute(DENSITY_ATTR, previous.density);
      root.setAttribute(MOTION_ATTR, previous.motion);
      return;
    }

    root.removeAttribute(DENSITY_ATTR);
    root.removeAttribute(MOTION_ATTR);
    ROOT_PREFERENCE_OWNERS.delete(root);
  };
}

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
  const getActiveTheme = useCallback(
    () => registry.get(themeId) ?? registry.get(fallbackThemeId) ?? registry.get('void'),
    [registry, themeId, fallbackThemeId],
  );
  const activeTheme = useSyncExternalStore(registry.subscribe, getActiveTheme, getActiveTheme);
  if (!activeTheme) throw new Error('Theme registry must contain the built-in "void" theme');
  const isFallback = activeTheme.id !== themeId;

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
  const preferenceOwnerRef = useRef<RootPreferenceEntry | null>(null);
  useInsertionEffect(() => {
    const target = root === undefined
      ? (typeof document === 'undefined' ? null : document.documentElement)
      : root;
    if (!target) return;
    const preferenceOwner = preferenceOwnerRef.current ?? { density, motion };
    preferenceOwnerRef.current = preferenceOwner;

    return applyRootPreferences(target, preferenceOwner, density, motion);
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
