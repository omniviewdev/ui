import { createContext } from 'react';
import type { ThemeContextValue } from './types';

export const defaultThemeContextValue: ThemeContextValue = {
  requestedThemeId: 'dark',
  activeTheme: {
    id: 'dark',
    name: 'Dark',
    base: 'dark',
    appearance: 'dark',
    builtIn: true,
    owner: { kind: 'builtin', id: 'base-ui' },
  },
  isFallback: false,
  density: 'comfortable',
  motion: 'normal',
  setTheme: () => undefined,
  setDensity: () => undefined,
  setMotion: () => undefined,
};

export const ThemeContext = createContext<ThemeContextValue>(defaultThemeContextValue);
