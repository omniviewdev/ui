import { validateThemeDefinition } from '../validation';
import { BUILT_IN_THEMES } from './catalog';
import type { ThemeDefinition } from './types';

const SOLARIZED_TOKENS: Readonly<Record<'solarized-dark' | 'solarized-light', ThemeDefinition['tokens']>> = {
  'solarized-dark': {
    'color.bg.base': '#002b36',
    'color.bg.surface': '#073642',
    'color.fg.default': '#93a1a1',
    'color.fg.muted': '#839496',
    'color.brand.500': '#268bd2',
    'syntax.comment': '#586e75',
    'syntax.string': '#2aa198',
    'syntax.keyword': '#859900',
  },
  'solarized-light': {
    'color.bg.base': '#fdf6e3',
    'color.bg.surface': '#eee8d5',
    'color.fg.default': '#073642',
    'color.fg.muted': '#657b83',
    'color.brand.500': '#268bd2',
  },
};

export const BUILT_IN_THEME_DEFINITIONS: readonly ThemeDefinition[] = Object.freeze(
  BUILT_IN_THEMES.map(({ id, name, base, description }) =>
    validateThemeDefinition({
      schemaVersion: 1,
      id,
      name,
      base,
      description,
      tokens: id === 'solarized-dark' || id === 'solarized-light' ? SOLARIZED_TOKENS[id] : {},
    }),
  ),
);
