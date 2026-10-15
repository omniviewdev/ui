import { describe, expect, it } from 'vitest';
import { THEME_TOKEN_METADATA } from '../generated/tokenKeys';
import { dottedKeyToCssVar, validateKeys } from './keyTransform';

describe('dottedKeyToCssVar', () => {
  it('transforms dotted key to ov-prefixed CSS variable', () => {
    expect(dottedKeyToCssVar('color.bg.base')).toBe('--ov-color-bg-base');
    expect(dottedKeyToCssVar('syntax.comment')).toBe('--ov-syntax-comment');
    expect(dottedKeyToCssVar('terminal.red')).toBe('--ov-terminal-red');
  });

  it('handles deeper hierarchies with multiple dots', () => {
    expect(dottedKeyToCssVar('color.bg.surface.raised')).toBe(
      '--ov-color-bg-surface-raised',
    );
  });
});

describe('validateKeys', () => {
  it('returns empty array when all keys are valid', () => {
    const valid = Object.keys(THEME_TOKEN_METADATA).slice(0, 2);
    expect(validateKeys(valid, THEME_TOKEN_METADATA)).toEqual([]);
  });

  it('returns unknown keys as invalid', () => {
    expect(validateKeys(['color.bg.base', 'color.bogus.nope'], THEME_TOKEN_METADATA))
      .toEqual(['color.bogus.nope']);
  });

  it('handles empty input', () => {
    expect(validateKeys([], THEME_TOKEN_METADATA)).toEqual([]);
  });
});
