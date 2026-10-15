import { describe, expect, it } from 'vitest';
import { BUILT_IN_THEMES, BUILT_IN_THEME_IDS, isBuiltInThemeId } from './catalog';

describe('built-in theme catalog', () => {
  it('exposes the immutable ordered nine-theme catalog', () => {
    expect(BUILT_IN_THEMES.map((theme) => theme.id)).toEqual([
      'void',
      'dark',
      'light',
      'obsidian',
      'carbon',
      'solarized-dark',
      'solarized-light',
      'high-contrast-dark',
      'high-contrast-light',
    ]);
    expect(BUILT_IN_THEMES.find((theme) => theme.id === 'void')?.appearance).toBe('dark');
    expect(BUILT_IN_THEMES.find((theme) => theme.id === 'light')?.appearance).toBe('light');
    expect(BUILT_IN_THEMES.every((theme) => theme.builtIn)).toBe(true);
    expect(Object.isFrozen(BUILT_IN_THEMES)).toBe(true);
    expect(BUILT_IN_THEMES.every((theme) => Object.isFrozen(theme) && Object.isFrozen(theme.owner))).toBe(true);
  });

  it('provides an immutable ID set and type guard', () => {
    expect([...BUILT_IN_THEME_IDS]).toEqual(BUILT_IN_THEMES.map((theme) => theme.id));
    expect(isBuiltInThemeId('solarized-dark')).toBe(true);
    expect(isBuiltInThemeId('third-party')).toBe(false);
    expect(() => (BUILT_IN_THEME_IDS as Set<string>).add('third-party')).toThrow();
  });
});
