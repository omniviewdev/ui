import type { ThemeDefinition } from './types';

export const BUILT_IN_THEME_DEFINITIONS: readonly ThemeDefinition[] = [
  { schemaVersion: 1, id: 'dark', name: 'Dark', base: 'dark', tokens: {} },
  { schemaVersion: 1, id: 'light', name: 'Light', base: 'light', tokens: {} },
  {
    schemaVersion: 1,
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    base: 'high-contrast-dark',
    tokens: {},
  },
  {
    schemaVersion: 1,
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    base: 'high-contrast-light',
    tokens: {},
  },
  { schemaVersion: 1, id: 'obsidian', name: 'Obsidian', base: 'obsidian', tokens: {} },
  { schemaVersion: 1, id: 'carbon', name: 'Carbon', base: 'carbon', tokens: {} },
  { schemaVersion: 1, id: 'void', name: 'Void', base: 'void', tokens: {} },
];

export const BUILT_IN_THEME_IDS: ReadonlySet<string> = new Set(
  BUILT_IN_THEME_DEFINITIONS.map((t) => t.id),
);
