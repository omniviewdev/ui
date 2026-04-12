import type { ThemeDefinition } from './types';

export const BUILT_IN_THEME_DEFINITIONS: readonly ThemeDefinition[] = [
  { id: 'dark', name: 'Dark', base: 'dark' },
  { id: 'light', name: 'Light', base: 'light' },
  { id: 'high-contrast-dark', name: 'High Contrast Dark', base: 'high-contrast-dark' },
  { id: 'high-contrast-light', name: 'High Contrast Light', base: 'high-contrast-light' },
  { id: 'obsidian', name: 'Obsidian', base: 'obsidian' },
  { id: 'carbon', name: 'Carbon', base: 'carbon' },
  { id: 'void', name: 'Void', base: 'void' },
];

export const BUILT_IN_THEME_IDS: ReadonlySet<string> = new Set(
  BUILT_IN_THEME_DEFINITIONS.map((t) => t.id),
);
