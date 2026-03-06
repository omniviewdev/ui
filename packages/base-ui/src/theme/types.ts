export type ThemeMode = 'dark' | 'light' | 'high-contrast-dark' | 'high-contrast-light';
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
