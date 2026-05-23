import { describe, it, expect } from 'vitest';
import { extractTokenKeys } from './generate-token-keys';

describe('extractTokenKeys', () => {
  it('extracts color, syntax, and terminal keys from css input', () => {
    const css = `
      :root {
        --ov-color-bg-base: #000;
        --ov-color-fg-default: #fff;
        --ov-syntax-comment: #888;
        --ov-terminal-red: #c00;
        --ov-primitive-gray-0: #090a0c;
        --ov-size-button-sm: 28px;
      }
      :root[data-ov-theme='light'] {
        --ov-color-bg-base: #eef0f3;
      }
    `;
    const result = extractTokenKeys(css);
    expect(result.colors).toEqual(['color.bg.base', 'color.fg.default']);
    expect(result.syntax).toEqual(['syntax.comment']);
    expect(result.terminal).toEqual(['terminal.red']);
  });

  it('deduplicates keys defined in multiple theme blocks', () => {
    const css = `
      :root { --ov-color-bg-base: #000; }
      :root[data-ov-theme='light'] { --ov-color-bg-base: #fff; }
    `;
    const result = extractTokenKeys(css);
    expect(result.colors).toEqual(['color.bg.base']);
  });

  it('ignores primitives, sizes, and non-ov variables', () => {
    const css = `
      :root {
        --ov-primitive-gray-0: #000;
        --ov-size-button-md: 36px;
        --ov-duration-fast: 90ms;
        --other-lib-var: red;
      }
    `;
    const result = extractTokenKeys(css);
    expect(result.colors).toEqual([]);
    expect(result.syntax).toEqual([]);
    expect(result.terminal).toEqual([]);
  });
});
