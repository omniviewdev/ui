import { describe, expect, it } from 'vitest';
import { completions, diagnostics, hover, positionAt, signature } from './decoder';

describe('standard LSP feature decoding', () => {
  it.each([
    ['utf-16', 2], ['utf-8', 4],
  ] as const)('decodes astral characters and CRLF using %s', (encoding, end) => {
    const result = completions([{ label: 'x', textEdit: { range: { start: { line: 1, character: 0 }, end: { line: 1, character: end } }, newText: 'x' } }], 'a\r\n😀', 7, encoding);
    expect(result.completions[0]?.edit.range).toEqual({ start: 3, end: 7, unit: 'utf8-byte' });
    expect(positionAt('a\r\n😀', 7, encoding)).toEqual({ line: 1, character: end });
  });
  it('treats lone CR as a line break and rejects positions inside CRLF', () => {
    expect(positionAt('a\r😀', 6, 'utf-16')).toEqual({ line: 1, character: 2 });
    expect(() => positionAt('a\r\n', 2, 'utf-16')).toThrow('Malformed');
    const result = hover({ contents: 'x', range: { start: { line: 1, character: 0 },
      end: { line: 1, character: 2 } } }, 'a\r😀', 'utf-16');
    expect(result?.range).toEqual({ start: 2, end: 6, unit: 'utf8-byte' });
  });

  it.each([
    { start: { line: 0, character: 1 }, end: { line: 0, character: 2 } },
    { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
    { start: { line: 3, character: 0 }, end: { line: 3, character: 0 } },
    { start: { line: -1, character: 0 }, end: { line: 0, character: 0 } },
  ])('rejects invalid or split-codepoint response ranges', range => {
    expect(() => completions([{ label: 'x', textEdit: { range, newText: 'x' } }], '😀\r\n', 4, 'utf-16')).toThrow('Malformed');
  });

  it('preserves completion presentation metadata and standard snippet format', () => {
    const result = completions({ isIncomplete: false, items: [{ label: 'startsWith', kind: 3,
      labelDetails: { description: 'bool' }, detail: 'startsWith(prefix: string): bool',
      documentation: { kind: 'plaintext', value: 'Prefix check' }, insertText: 'startsWith(${1:prefix})',
      insertTextFormat: 2, sortText: '001', filterText: 'startsWith',
    }] }, '', 0, 'utf-16');
    expect(result.completions[0]).toMatchObject({ kind: 'function', type: 'bool', description: 'Prefix check',
      detail: 'startsWith(prefix: string): bool', insertTextFormat: 'snippet',
      edit: { range: { start: 0, end: 0, unit: 'utf8-byte' }, text: 'startsWith(${1:prefix})' },
    });
  });

  it.each([null, { kind: 'unchanged', resultId: 'unrequested-cache' }, { kind: 'full', items: [{ message: 'x', severity: '1' }] }])('rejects unsupported or malformed pull diagnostic reports', value => {
    expect(() => diagnostics(value, '', 'utf-16')).toThrow('Malformed');
  });

  it('validates signature parameter tuples and active indexes', () => {
    expect(() => signature({ signatures: [{ label: 'f()', parameters: [{ label: [1, 99] }] }] })).toThrow('Malformed');
    expect(() => signature({ signatures: [{ label: 'f(x)', parameters: [{ label: 'x' }] }], activeParameter: 2 })).toThrow('Malformed');
    expect(() => hover({ contents: { kind: 'html', value: '<b>x</b>' } }, '', 'utf-16')).toThrow('Malformed');
  });
});
