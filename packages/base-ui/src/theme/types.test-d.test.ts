import { assertType, describe, expectTypeOf, it } from 'vitest';
import type { ThemeTokenKey } from './generated/tokenKeys';
import type {
  BuiltInThemeId,
  ThemeDefinition,
  ThemeDefinitionV1,
  ThemeOwner,
} from './schema';

describe('theme schema', () => {
  it('defines the nine built-in theme IDs', () => {
    expectTypeOf<'void'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'dark'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'light'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'obsidian'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'carbon'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'solarized-dark'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'solarized-light'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'high-contrast-dark'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'high-contrast-light'>().toExtend<BuiltInThemeId>();
    expectTypeOf<'not-a-theme'>().not.toExtend<BuiltInThemeId>();
  });

  it('accepts the versioned unified-token definition', () => {
    const valid: ThemeDefinition = {
      schemaVersion: 1,
      id: 'acme.slate',
      name: 'Slate',
      base: 'void',
      tokens: {
        'color.bg.base': '#101114',
        'syntax.keyword': '#8aafff',
        'syntax.style.keyword': 'bold',
      },
    };
    expectTypeOf(valid).toExtend<ThemeDefinitionV1>();
  });

  it('removes the split-map API', () => {
    assertType<ThemeDefinition>({
      schemaVersion: 1,
      id: 'old',
      name: 'Old',
      base: 'dark',
      // @ts-expect-error removed split-map API
      colors: { 'color.bg.base': '#000' },
    });
  });

  it('requires the version and unified token map', () => {
    // @ts-expect-error missing schemaVersion
    assertType<ThemeDefinition>({ id: 'x', name: 'x', base: 'dark', tokens: {} });
    // @ts-expect-error missing tokens
    assertType<ThemeDefinition>({ schemaVersion: 1, id: 'x', name: 'x', base: 'dark' });
  });

  it('defines the supported owner union', () => {
    expectTypeOf<{ kind: 'builtin'; id: 'base-ui' }>().toExtend<ThemeOwner>();
    expectTypeOf<{ kind: 'plugin'; id: string }>().toExtend<ThemeOwner>();
    expectTypeOf<{ kind: 'user'; id: string }>().toExtend<ThemeOwner>();
    expectTypeOf<{ kind: 'builtin'; id: 'other' }>().not.toExtend<ThemeOwner>();
  });
});

describe('ThemeTokenKey', () => {
  it('accepts known color and syntax token keys', () => {
    expectTypeOf<'color.bg.base'>().toExtend<ThemeTokenKey>();
    expectTypeOf<'syntax.keyword'>().toExtend<ThemeTokenKey>();
  });

  it('rejects unknown token keys', () => {
    expectTypeOf<'not.a.real.key'>().not.toExtend<ThemeTokenKey>();
    expectTypeOf<string>().not.toExtend<ThemeTokenKey>();
  });
});
