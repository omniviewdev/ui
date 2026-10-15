/**
 * Type-level tests for the theme registry types.
 *
 * Uses vitest's expectTypeOf (built-in, no tsd needed) to assert compile-time
 * invariants: BuiltInThemeMode rejects unknown strings, ThemeDefinition requires
 * its core fields, and token key maps reject unknown keys.
 *
 * Approach: vitest expectTypeOf (instead of tsd) — no extra devDep required.
 */
import { expectTypeOf, assertType, describe, it } from 'vitest';
import type {
  BuiltInThemeMode,
  ThemeDefinition,
} from './registry/types';
import type { ThemeTokenKey } from './generated/tokenKeys';

describe('BuiltInThemeMode', () => {
  it('accepts all 7 known ids', () => {
    expectTypeOf<'dark'>().toExtend<BuiltInThemeMode>();
    expectTypeOf<'light'>().toExtend<BuiltInThemeMode>();
    expectTypeOf<'obsidian'>().toExtend<BuiltInThemeMode>();
    expectTypeOf<'carbon'>().toExtend<BuiltInThemeMode>();
    expectTypeOf<'void'>().toExtend<BuiltInThemeMode>();
    expectTypeOf<'high-contrast-dark'>().toExtend<BuiltInThemeMode>();
    expectTypeOf<'high-contrast-light'>().toExtend<BuiltInThemeMode>();
  });

  it('rejects unknown strings', () => {
    expectTypeOf<'not-a-theme'>().not.toExtend<BuiltInThemeMode>();
    expectTypeOf<''>().not.toExtend<BuiltInThemeMode>();
    expectTypeOf<string>().not.toExtend<BuiltInThemeMode>();
  });
});

describe('ThemeDefinition', () => {
  it('accepts a valid object with all required fields', () => {
    const valid: ThemeDefinition = {
      id: 'my-theme',
      name: 'My Theme',
      base: 'dark',
    };
    expectTypeOf(valid).toExtend<ThemeDefinition>();
  });

  it('requires id, name, and base (omitting any is a type error)', () => {
    // @ts-expect-error — missing `id`
    assertType<ThemeDefinition>({ name: 'x', base: 'dark' });
    // @ts-expect-error — missing `name`
    assertType<ThemeDefinition>({ id: 'x', base: 'dark' });
    // @ts-expect-error — missing `base`
    assertType<ThemeDefinition>({ id: 'x', name: 'x' });
  });

  it('accepts optional color/syntax/terminal overrides with valid keys', () => {
    const withColors: ThemeDefinition = {
      id: 'with-colors',
      name: 'With Colors',
      base: 'light',
      colors: { 'color.bg.base': '#fff', 'color.fg.default': '#000' },
      syntax: { 'syntax.keyword': '#569cd6' },
    };
    expectTypeOf(withColors).toExtend<ThemeDefinition>();
  });

  it('rejects unknown color override keys', () => {
    assertType<Partial<Record<Extract<ThemeTokenKey, `color.${string}`>, string>>>({
      // @ts-expect-error — 'not.a.real.key' is not a color ThemeTokenKey
      'not.a.real.key': '#000',
    });
  });
});

describe('ThemeTokenKey', () => {
  it('accepts known color and syntax token keys', () => {
    expectTypeOf<'color.bg.base'>().toExtend<ThemeTokenKey>();
    expectTypeOf<'color.fg.default'>().toExtend<ThemeTokenKey>();
    expectTypeOf<'syntax.keyword'>().toExtend<ThemeTokenKey>();
    expectTypeOf<'syntax.comment'>().toExtend<ThemeTokenKey>();
  });

  it('rejects unknown token keys', () => {
    expectTypeOf<'not.a.real.key'>().not.toExtend<ThemeTokenKey>();
    expectTypeOf<string>().not.toExtend<ThemeTokenKey>();
  });
});
