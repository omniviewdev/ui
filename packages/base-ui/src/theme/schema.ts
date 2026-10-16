import type { ThemeTokenKey } from './generated/tokenKeys';

export type BuiltInThemeId =
  | 'void'
  | 'dark'
  | 'light'
  | 'obsidian'
  | 'carbon'
  | 'solarized-dark'
  | 'solarized-light'
  | 'high-contrast-dark'
  | 'high-contrast-light';

export interface ThemeDefinitionV1 {
  schemaVersion: 1;
  id: string;
  name: string;
  base: BuiltInThemeId;
  author?: string;
  version?: string;
  description?: string;
  tokens: Partial<Record<ThemeTokenKey, string>>;
}

export type ThemeDefinition = ThemeDefinitionV1;

export type ThemeOwner =
  | { kind: 'builtin'; id: 'base-ui' }
  | { kind: 'plugin'; id: string }
  | { kind: 'user'; id: string };

export interface ThemeSummary {
  id: string;
  name: string;
  base: BuiltInThemeId;
  appearance: 'dark' | 'light';
  description?: string;
  builtIn: boolean;
  owner: ThemeOwner;
}

export interface RegisteredTheme extends ThemeSummary {
  definition: ThemeDefinition;
}
