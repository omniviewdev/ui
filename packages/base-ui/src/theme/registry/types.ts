import type { ThemeDefinition, ThemeOwner, ThemeSummary, RegisteredTheme } from '../schema';

export type {
  BuiltInThemeId,
  ThemeDefinition,
  ThemeDefinitionV1,
  ThemeOwner,
  ThemeSummary,
  RegisteredTheme,
} from '../schema';

export const BUILT_IN_THEME_MODES = [
  'void',
  'dark',
  'light',
  'obsidian',
  'carbon',
  'solarized-dark',
  'solarized-light',
  'high-contrast-dark',
  'high-contrast-light',
] as const;

export interface ThemeRegistrySnapshot {
  readonly themes: readonly Readonly<ThemeSummary>[];
}

export type ThemeRegistryListener = () => void;

export interface ThemeRegistry {
  register(theme: ThemeDefinition, owner: ThemeOwner): () => void;
  unregister(id: string, owner: ThemeOwner): boolean;
  unregisterOwner(owner: ThemeOwner): number;
  get(id: string): Readonly<RegisteredTheme> | undefined;
  has(id: string): boolean;
  getSnapshot(): ThemeRegistrySnapshot;
  subscribe(listener: ThemeRegistryListener): () => void;
}
