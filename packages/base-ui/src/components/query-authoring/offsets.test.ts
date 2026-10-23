import { describe, expect, it } from 'vitest';
import {
  applyTextareaChange,
  sourceOffsetToTextarea,
  textareaOffsetToSource,
  utf16ToUtf8,
} from './offsets';

describe('textarea line-ending adapter', () => {
  it('maps normalized LF DOM positions to original CRLF UTF-16 and UTF-8 positions', () => {
    const source = 'a\r\n😀e\u0301\r\nna';
    expect(textareaOffsetToSource(source, 2)).toBe(3);
    expect(textareaOffsetToSource(source, 9)).toBe(11);
    expect(sourceOffsetToTextarea(source, 11)).toBe(9);
    expect(utf16ToUtf8(source, textareaOffsetToSource(source, 9))).toBe(14);
    expect(() => textareaOffsetToSource(source, 99)).toThrow();
  });
  it('preserves existing and inserted CRLF while applying a native text draft change', () => {
    expect(applyTextareaChange('a\r\n😀na', 'a\n😀name')).toBe('a\r\n😀name');
    expect(applyTextareaChange('a\r\nb', 'a\nnew\nb')).toBe('a\r\nnew\r\nb');
    expect(applyTextareaChange('a\r\nb', 'ab')).toBe('ab');
    expect(applyTextareaChange('a\rb', 'a\nx\nb')).toBe('a\rx\rb');
    expect(applyTextareaChange('😀a', '😃a')).toBe('😃a');
  });
});
