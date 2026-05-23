import type { ThemeDefinition } from '../src/theme/registry';

export const SOLARIZED_DARK: ThemeDefinition = {
  id: 'solarized-dark',
  name: 'Solarized Dark',
  base: 'dark',
  author: 'Ethan Schoonover',
  colors: {
    'color.bg.base': '#002b36',
    'color.bg.surface': '#073642',
    'color.fg.default': '#839496',
    'color.fg.muted': '#657b83',
    'color.brand.500': '#268bd2',
  },
  syntax: {
    'syntax.comment': '#586e75',
    'syntax.string': '#2aa198',
    'syntax.keyword': '#859900',
  },
  terminal: {},
};
