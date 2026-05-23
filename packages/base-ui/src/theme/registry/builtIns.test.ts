import { describe, it, expect } from 'vitest';
import { BUILT_IN_THEME_DEFINITIONS } from './builtIns';
import { BUILT_IN_THEME_MODES } from './types';

describe('BUILT_IN_THEME_DEFINITIONS', () => {
  it('has one definition per built-in mode', () => {
    const ids = BUILT_IN_THEME_DEFINITIONS.map((t) => t.id).sort();
    expect(ids).toEqual([...BUILT_IN_THEME_MODES].sort());
  });

  it('every definition uses itself as base', () => {
    for (const def of BUILT_IN_THEME_DEFINITIONS) {
      expect(def.base).toBe(def.id);
    }
  });

  it('no definition has override fields', () => {
    for (const def of BUILT_IN_THEME_DEFINITIONS) {
      expect(def.colors).toBeUndefined();
      expect(def.syntax).toBeUndefined();
      expect(def.terminal).toBeUndefined();
    }
  });

  it('has a human-readable name for each definition', () => {
    for (const def of BUILT_IN_THEME_DEFINITIONS) {
      expect(def.name.length).toBeGreaterThan(0);
    }
  });
});
