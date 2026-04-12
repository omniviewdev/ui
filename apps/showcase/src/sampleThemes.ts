import type { ThemeDefinition } from '@omniviewdev/base-ui';

export const SHOWCASE_CUSTOM_THEMES: ThemeDefinition[] = [
  {
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
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    base: 'light',
    author: 'Ethan Schoonover',
    colors: {
      'color.bg.base': '#fdf6e3',
      'color.bg.surface': '#eee8d5',
      'color.fg.default': '#657b83',
      'color.fg.muted': '#93a1a1',
      'color.brand.500': '#268bd2',
    },
  },
];
