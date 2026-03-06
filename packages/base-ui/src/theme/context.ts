import { createContext } from 'react';
import type { ThemeContextValue } from './types';

export const defaultThemeContextValue: ThemeContextValue = {
  theme: 'dark',
  density: 'comfortable',
  motion: 'normal',
  setTheme: () => undefined,
  setDensity: () => undefined,
  setMotion: () => undefined,
};

export const ThemeContext = createContext<ThemeContextValue>(defaultThemeContextValue);
