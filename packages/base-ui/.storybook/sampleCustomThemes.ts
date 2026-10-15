import type { ThemeDefinition } from '../src/theme/registry';

export const SOLARIZED_DARK: ThemeDefinition = {
  schemaVersion: 1,
  id: 'solarized-dark',
  name: 'Solarized Dark',
  base: 'dark',
  author: 'Ethan Schoonover',
  tokens: {
    'color.bg.base': '#002b36',
    'color.bg.surface': '#073642',
    'color.fg.default': '#839496',
    'color.fg.muted': '#657b83',
    'color.brand.500': '#268bd2',
    'syntax.comment': '#586e75',
    'syntax.string': '#2aa198',
    'syntax.keyword': '#859900',
  },
};
