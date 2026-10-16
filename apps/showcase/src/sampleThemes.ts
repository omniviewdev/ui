import type { ThemeDefinition } from '@omniviewdev/base-ui';

export const SHOWCASE_CUSTOM_THEMES: ThemeDefinition[] = [
  {
    schemaVersion: 1,
    id: 'example-ocean',
    name: 'Example Ocean',
    base: 'dark',
    author: 'Omniview',
    tokens: {
      'color.bg.base': '#071a2b',
      'color.bg.surface': '#0b2942',
      'color.fg.default': '#d7eefc',
      'color.brand.500': '#38bdf8',
    },
  },
];
