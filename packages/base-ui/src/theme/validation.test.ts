import { afterEach, describe, expect, it, vi } from 'vitest';
import { THEME_TOKEN_METADATA } from './generated/tokenKeys';
import type { ThemeDefinition } from './schema';
import { ThemeValidationError, validateThemeDefinition } from './validation';

const valid: ThemeDefinition = {
  schemaVersion: 1,
  id: 'acme.slate',
  name: 'Slate',
  base: 'void',
  author: 'Acme',
  version: '1.0.0',
  description: 'A slate theme',
  tokens: {
    'color.bg.base': '#101114',
    'syntax.keyword': '#8aafff',
    'syntax.style.keyword': 'bold',
  },
};

const supportsColor = vi.fn<(value: string) => boolean>(() => true);
afterEach(() => {
  vi.unstubAllGlobals();
});

function expectValidationError(input: unknown, code: ThemeValidationError['code'], path?: string) {
  try {
    validateThemeDefinition(input, supportsColor);
    throw new Error('Expected validation to fail');
  } catch (error) {
    expect(error).toBeInstanceOf(ThemeValidationError);
    expect(error).toMatchObject({ code, ...(path === undefined ? {} : { path }) });
  }
}

describe('validateThemeDefinition', () => {
  it('accepts a valid versioned definition', () => {
    expect(validateThemeDefinition(valid, supportsColor)).toEqual(valid);
  });

  it.each([
    [{ ...valid, schemaVersion: 2 }, 'unsupported_schema', 'schemaVersion'],
    [{ ...valid, id: 'bad id' }, 'invalid_id', 'id'],
    [{ ...valid, name: '' }, 'invalid_metadata', 'name'],
    [{ ...valid, base: 'missing' }, 'unknown_base', 'base'],
    [{ ...valid, tokens: { 'color.not.real': '#000' } }, 'unknown_token', 'tokens.color.not.real'],
    [{ ...valid, tokens: { 'color.bg.base': 'url(https://example.com/x)' } }, 'invalid_value', 'tokens.color.bg.base'],
    [{ ...valid, tokens: { 'syntax.style.keyword': 'blink' } }, 'invalid_value', 'tokens.syntax.style.keyword'],
  ])('rejects invalid definitions', (input, code, path) => {
    expectValidationError(input, code as ThemeValidationError['code'], path as string);
  });

  it.each([
    ['', 'invalid_id'],
    ['a'.repeat(257), 'invalid_id'],
    ['bad{id', 'invalid_id'],
  ])('rejects invalid IDs', (id, code) => {
    expectValidationError({ ...valid, id }, code as ThemeValidationError['code'], 'id');
  });

  it.each([
    ['name', 'x'.repeat(81)],
    ['author', 'x'.repeat(121)],
    ['description', 'x'.repeat(501)],
  ])('enforces the %s metadata bound', (field, value) => {
    expectValidationError({ ...valid, [field]: value }, 'invalid_metadata', field);
  });

  it('rejects more token entries than the generated catalog', () => {
    const tokens = Object.fromEntries(
      [...Object.keys(THEME_TOKEN_METADATA), 'color.not.real'].map((key) => [key, '#000']),
    );
    expectValidationError({ ...valid, tokens }, 'unknown_token', 'tokens');
  });

  it.each(['x'.repeat(257), 'red;', 'red{color:blue}', 'URL(https://example.com/x)']) (
    'rejects unsafe or oversized color values',
    (value) => {
      expectValidationError({ ...valid, tokens: { 'color.bg.base': value } }, 'invalid_value', 'tokens.color.bg.base');
    },
  );

  it('uses the injected color syntax validator', () => {
    const rejectColor = vi.fn(() => false);
    expectValidationErrorWith({ ...valid, tokens: { 'color.bg.base': 'not-a-color' } }, rejectColor);
    expect(rejectColor).toHaveBeenCalledWith('not-a-color');
  });

  it('uses CSS.supports color validation when available', () => {
    const browserSupports = vi.fn(() => true);
    vi.stubGlobal('CSS', { supports: browserSupports });
    validateThemeDefinition({
      ...valid,
      tokens: { 'color.bg.base': 'oklch(50% 0.1 120)' },
    });
    expect(browserSupports).toHaveBeenCalledWith('color', 'oklch(50% 0.1 120)');
    vi.unstubAllGlobals();
  });

  it.each([
    'red',
    'rgb(12 34 56 / 50%)',
    'rgba(12, 34, 56, 0.5)',
    'hsl(120 50% 40% / 0.25)',
    'oklch(62% 0.18 240 / 80%)',
    'hsla(120, 50%, 40%, 25%)',
    'hwb(120 20% 30% / 0.5)',
    'lab(60% 10 20 / 75%)',
    'lch(60% 30 120 / 0.75)',
    'oklab(60% 0.1 -0.1 / 75%)',
    'color(display-p3 0.2 0.4 0.6 / 50%)',
  ])('accepts structurally safe %s colors without DOM APIs', (value) => {
    vi.stubGlobal('CSS', undefined);
    vi.stubGlobal('document', undefined);

    expect(
      validateThemeDefinition({
        ...valid,
        tokens: { 'color.bg.base': value },
      }),
    ).toBeDefined();
  });

  it.each([
    'rgb(12 34)',
    'hsl(120 50%)',
    'oklch(62% 0.18 240))',
    'color()',
    'rgb(12 34 56 /)',
    'rgb(12 34 56); color: red',
    'hsl(120 50% 40%){background:red}',
    'url(https://example.com/color)',
  ])('rejects malformed or injectable %s colors without DOM APIs', (value) => {
    vi.stubGlobal('CSS', undefined);
    vi.stubGlobal('document', undefined);

    expect(() =>
      validateThemeDefinition({
        ...valid,
        tokens: { 'color.bg.base': value },
      }),
    ).toThrowError(expect.objectContaining({ code: 'invalid_value' }));
  });

  it.each([
    'normal',
    'italic',
    'bold',
    'underline',
    'bold italic',
    'bold underline',
    'italic underline',
    'bold italic underline',
  ])('accepts the supported font style %s', (value) => {
    expect(validateThemeDefinition({ ...valid, tokens: { 'syntax.style.keyword': value } }, supportsColor)).toBeDefined();
  });

  it('returns a detached deeply frozen definition', () => {
    const input = structuredClone(valid);
    const result = validateThemeDefinition(input, supportsColor);
    input.tokens['color.bg.base'] = '#fff';
    expect(result.tokens['color.bg.base']).toBe('#101114');
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.tokens)).toBe(true);
  });
});

function expectValidationErrorWith(input: unknown, colorSupport: (value: string) => boolean) {
  try {
    validateThemeDefinition(input, colorSupport);
    throw new Error('Expected validation to fail');
  } catch (error) {
    expect(error).toMatchObject({ code: 'invalid_value', path: 'tokens.color.bg.base' });
  }
}
