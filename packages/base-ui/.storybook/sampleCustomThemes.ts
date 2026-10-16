import type { ThemeDefinition } from '../src/theme/registry';

export const EXAMPLE_OCEAN: ThemeDefinition = {
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
};
