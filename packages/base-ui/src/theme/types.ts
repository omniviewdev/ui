import type { BuiltInThemeId, ThemeSummary } from './schema';

/**
 * A theme identifier. Built-in mode ids autocomplete; any registered custom
 * theme id is also accepted.
 */
export type ThemeMode = BuiltInThemeId | (string & {});
export type ThemeDensity = 'compact' | 'comfortable';
export type ThemeMotion = 'normal' | 'reduced';
export type ThemeTextSize = '80' | '90' | '100' | '110' | '125';

export interface ThemeState {
  requestedThemeId: string;
  activeTheme: Readonly<ThemeSummary>;
  isFallback: boolean;
  density: ThemeDensity;
  motion: ThemeMotion;
  textSize: ThemeTextSize;
}

export interface ThemeContextValue extends ThemeState {
  setTheme: (themeId: ThemeMode) => void;
  setDensity: (density: ThemeDensity) => void;
  setMotion: (motion: ThemeMotion) => void;
  setTextSize: (textSize: ThemeTextSize) => void;
}
