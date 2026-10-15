import { describe, expect, it } from 'vitest';
import { extractThemeTokens, renderTypesFile } from './generate-token-keys';

describe('extractThemeTokens', () => {
  it('extracts one keyed token catalog with value kinds', () => {
    const css = `
      :root {
        --ov-color-bg-base: #000;
        --ov-color-terminal-bg: #111;
        --ov-color-ansi-red: #c00;
        --ov-syntax-keyword: #f0f;
        --ov-syntax-style-keyword: bold;
        --ov-size-button-md: 26px;
      }
    `;

    expect(extractThemeTokens(css)).toEqual({
      'color.ansi.red': { cssVariable: '--ov-color-ansi-red', valueKind: 'color' },
      'color.bg.base': { cssVariable: '--ov-color-bg-base', valueKind: 'color' },
      'color.terminal.bg': { cssVariable: '--ov-color-terminal-bg', valueKind: 'color' },
      'syntax.keyword': { cssVariable: '--ov-syntax-keyword', valueKind: 'color' },
      'syntax.style.keyword': {
        cssVariable: '--ov-syntax-style-keyword',
        valueKind: 'font-style',
      },
    });
  });

  it('collapses duplicate definitions to one entry', () => {
    const css = `
      :root { --ov-color-bg-base: #000; }
      :root[data-ov-theme='light'] { --ov-color-bg-base: #fff; }
    `;

    expect(extractThemeTokens(css)).toEqual({
      'color.bg.base': { cssVariable: '--ov-color-bg-base', valueKind: 'color' },
    });
  });

  it('renders deterministic output regardless of declaration order', () => {
    const first = `
      :root {
        --ov-syntax-style-keyword: bold;
        --ov-color-bg-base: #000;
        --ov-syntax-keyword: #f0f;
      }
    `;
    const reordered = `
      :root {
        --ov-syntax-keyword: #f0f;
        --ov-syntax-style-keyword: bold;
        --ov-color-bg-base: #000;
      }
    `;

    expect(renderTypesFile(extractThemeTokens(first))).toBe(
      renderTypesFile(extractThemeTokens(reordered)),
    );
  });
});
