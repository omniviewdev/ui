import type { BuiltInThemeId } from './schema';

/**
 * A theme identifier. Built-in mode ids autocomplete; any registered custom
 * theme id is also accepted.
 */
export type ThemeMode = BuiltInThemeId | (string & {});
export type ThemeDensity = 'compact' | 'comfortable';
export type ThemeMotion = 'normal' | 'reduced';

export interface ThemeState {
  theme: ThemeMode;
  density: ThemeDensity;
  motion: ThemeMotion;
}

export interface ThemeContextValue extends ThemeState {
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: ThemeDensity) => void;
  setMotion: (motion: ThemeMotion) => void;
}
