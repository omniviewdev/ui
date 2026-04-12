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
import type {
  ColorTokenKey,
  SyntaxTokenKey,
  TerminalTokenKey,
} from './generated/tokenKeys';

describe('BuiltInThemeMode', () => {
  it('accepts all 7 known ids', () => {
    expectTypeOf<'dark'>().toMatchTypeOf<BuiltInThemeMode>();
    expectTypeOf<'light'>().toMatchTypeOf<BuiltInThemeMode>();
    expectTypeOf<'obsidian'>().toMatchTypeOf<BuiltInThemeMode>();
    expectTypeOf<'carbon'>().toMatchTypeOf<BuiltInThemeMode>();
    expectTypeOf<'void'>().toMatchTypeOf<BuiltInThemeMode>();
    expectTypeOf<'high-contrast-dark'>().toMatchTypeOf<BuiltInThemeMode>();
    expectTypeOf<'high-contrast-light'>().toMatchTypeOf<BuiltInThemeMode>();
  });

  it('rejects unknown strings', () => {
    expectTypeOf<'not-a-theme'>().not.toMatchTypeOf<BuiltInThemeMode>();
    expectTypeOf<''>().not.toMatchTypeOf<BuiltInThemeMode>();
    expectTypeOf<string>().not.toMatchTypeOf<BuiltInThemeMode>();
  });
});

describe('ThemeDefinition', () => {
  it('accepts a valid object with all required fields', () => {
    const valid: ThemeDefinition = {
      id: 'my-theme',
      name: 'My Theme',
      base: 'dark',
    };
    expectTypeOf(valid).toMatchTypeOf<ThemeDefinition>();
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
    expectTypeOf(withColors).toMatchTypeOf<ThemeDefinition>();
  });

  it('rejects unknown color override keys', () => {
    // @ts-expect-error — 'not.a.real.key' is not a ColorTokenKey
    assertType<Partial<Record<ColorTokenKey, string>>>({ 'not.a.real.key': '#000' });
  });
});

describe('ColorTokenKey', () => {
  it('accepts known color token keys', () => {
    expectTypeOf<'color.bg.base'>().toMatchTypeOf<ColorTokenKey>();
    expectTypeOf<'color.fg.default'>().toMatchTypeOf<ColorTokenKey>();
    expectTypeOf<'color.accent.soft'>().toMatchTypeOf<ColorTokenKey>();
  });

  it('rejects unknown color token keys', () => {
    expectTypeOf<'not.a.real.key'>().not.toMatchTypeOf<ColorTokenKey>();
    expectTypeOf<string>().not.toMatchTypeOf<ColorTokenKey>();
  });
});

describe('SyntaxTokenKey', () => {
  it('accepts known syntax token keys', () => {
    expectTypeOf<'syntax.keyword'>().toMatchTypeOf<SyntaxTokenKey>();
    expectTypeOf<'syntax.string'>().toMatchTypeOf<SyntaxTokenKey>();
    expectTypeOf<'syntax.comment'>().toMatchTypeOf<SyntaxTokenKey>();
  });

  it('rejects unknown syntax token keys', () => {
    expectTypeOf<'syntax.bogus'>().not.toMatchTypeOf<SyntaxTokenKey>();
    expectTypeOf<string>().not.toMatchTypeOf<SyntaxTokenKey>();
  });
});

describe('TerminalTokenKey', () => {
  it('is currently never — no string is assignable', () => {
    // TerminalTokenKey = never (no terminal tokens defined yet).
    // string is not assignable to never.
    expectTypeOf<string>().not.toMatchTypeOf<TerminalTokenKey>();
  });
});
