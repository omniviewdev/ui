import { describe, it, expect } from 'vitest';
import { dottedKeyToCssVar, validateKeys } from './keyTransform';
import {
  COLOR_TOKEN_KEYS,
  SYNTAX_TOKEN_KEYS,
  TERMINAL_TOKEN_KEYS,
} from '../generated/tokenKeys';

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
    const valid = [...COLOR_TOKEN_KEYS].slice(0, 2);
    expect(validateKeys(valid, COLOR_TOKEN_KEYS)).toEqual([]);
  });

  it('returns unknown keys as invalid', () => {
    expect(validateKeys(['color.bg.base', 'color.bogus.nope'], COLOR_TOKEN_KEYS))
      .toEqual(['color.bogus.nope']);
  });

  it('handles empty input', () => {
    expect(validateKeys([], COLOR_TOKEN_KEYS)).toEqual([]);
  });
});
