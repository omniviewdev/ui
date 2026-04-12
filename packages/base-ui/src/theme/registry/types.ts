import type {
  ColorTokenKey,
  SyntaxTokenKey,
  TerminalTokenKey,
} from '../generated/tokenKeys';

/** The built-in modes that a custom theme can inherit from. */
export type BuiltInThemeMode =
  | 'dark'
  | 'light'
  | 'high-contrast-dark'
  | 'high-contrast-light'
  | 'obsidian'
  | 'carbon'
  | 'void';

export const BUILT_IN_THEME_MODES: readonly BuiltInThemeMode[] = [
  'dark',
  'light',
  'high-contrast-dark',
  'high-contrast-light',
  'obsidian',
  'carbon',
  'void',
];

export const LIGHT_THEME_MODES: ReadonlySet<BuiltInThemeMode> = new Set([
  'light',
  'high-contrast-light',
]);

export interface ThemeDefinition {
  /** Stable identifier, used for persistence and activation. */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** The built-in mode this theme inherits from. */
  base: BuiltInThemeMode;
  /** Optional author metadata. */
  author?: string;
  /** Optional version string. */
  version?: string;
  /** UI chrome color overrides, keyed by dotted token path. */
  colors?: Partial<Record<ColorTokenKey, string>>;
  /** Syntax highlighting overrides. */
  syntax?: Partial<Record<SyntaxTokenKey, string>>;
  /** Terminal ANSI palette overrides. */
  terminal?: Partial<Record<TerminalTokenKey, string>>;
}

export interface ThemeInfo {
  id: string;
  name: string;
  base: BuiltInThemeMode;
  builtIn: boolean;
}

export type ThemeRegistryEvent =
  | { type: 'registered'; id: string }
  | { type: 'unregistered'; id: string }
  | { type: 'applied'; id: string };

export type ThemeRegistryListener = (event: ThemeRegistryEvent) => void;

export interface ThemeRegistry {
  register(theme: ThemeDefinition): void;
  unregister(id: string): void;
  get(id: string): ThemeDefinition | undefined;
  list(): ThemeInfo[];
  has(id: string): boolean;
  apply(id: string): void;
  active(): string;
  subscribe(listener: ThemeRegistryListener): () => void;
}
