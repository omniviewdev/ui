import { describe, expect, it } from 'vitest';
import { BUILT_IN_THEME_DEFINITIONS } from './builtIns';
import { BUILT_IN_THEME_MODES } from './types';

describe('BUILT_IN_THEME_DEFINITIONS', () => {
  it('has one validated definition per built-in mode in catalog order', () => {
    expect(BUILT_IN_THEME_DEFINITIONS.map(({ id }) => id)).toEqual(BUILT_IN_THEME_MODES);
    expect(BUILT_IN_THEME_DEFINITIONS.every(({ id, base }) => id === base)).toBe(true);
    expect(BUILT_IN_THEME_DEFINITIONS.every(Object.isFrozen)).toBe(true);
  });

  it('preserves the existing Solarized sample token values', () => {
    expect(BUILT_IN_THEME_DEFINITIONS.find(({ id }) => id === 'solarized-dark')?.tokens).toMatchObject({
      'color.bg.base': '#002b36',
      'color.bg.surface': '#073642',
      'color.fg.default': '#839496',
      'color.fg.muted': '#657b83',
      'color.brand.500': '#268bd2',
      'syntax.comment': '#586e75',
      'syntax.string': '#2aa198',
      'syntax.keyword': '#859900',
    });
    expect(BUILT_IN_THEME_DEFINITIONS.find(({ id }) => id === 'solarized-light')?.tokens).toMatchObject({
      'color.bg.base': '#fdf6e3',
      'color.bg.surface': '#eee8d5',
      'color.fg.default': '#657b83',
      'color.fg.muted': '#93a1a1',
      'color.brand.500': '#268bd2',
    });
  });
});
