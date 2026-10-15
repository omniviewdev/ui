import type { BuiltInThemeId, ThemeDefinition, ThemeSummary } from '../schema';

export type {
  BuiltInThemeId,
  ThemeDefinition,
  ThemeDefinitionV1,
  ThemeOwner,
  ThemeSummary,
  RegisteredTheme,
} from '../schema';

export const BUILT_IN_THEME_MODES: readonly BuiltInThemeId[] = [
  'dark',
  'light',
  'high-contrast-dark',
  'high-contrast-light',
  'obsidian',
  'carbon',
  'void',
];

export const LIGHT_THEME_MODES: ReadonlySet<BuiltInThemeId> = new Set([
  'light',
  'solarized-light',
  'high-contrast-light',
]);


export type ThemeRegistryEvent =
  | { type: 'registered'; id: string }
  | { type: 'unregistered'; id: string }
  | { type: 'applied'; id: string };

export type ThemeRegistryListener = (event: ThemeRegistryEvent) => void;

export interface ThemeRegistry {
  register(theme: ThemeDefinition): void;
  unregister(id: string): void;
  get(id: string): ThemeDefinition | undefined;
  list(): ThemeSummary[];
  has(id: string): boolean;
  apply(id: string): void;
  active(): string | null;
  subscribe(listener: ThemeRegistryListener): () => void;
}
