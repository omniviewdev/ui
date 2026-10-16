import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltInThemeIds, parseThemeBlocks, findThemeCoverageGaps } from './theme-coverage.mjs';

describe('catalog-driven theme coverage', () => {
  it('uses the live built-in catalog, including themes beyond the original four', async () => {
    const ids = await loadBuiltInThemeIds();
    assert.ok(ids.includes('void'));
    assert.ok(ids.includes('solarized-dark'));
    const css = ids.filter((id) => id !== 'solarized-dark')
      .map((id) => `[data-ov-theme='${id}'] { --ov-color-border-control: black; }`).join('\n');
    assert.deepEqual(findThemeCoverageGaps(css, ids), [
      { token: '--ov-color-border-control', missingThemes: ['solarized-dark'] },
    ]);
  });

  it('supports newly cataloged themes without changing a scanner list', () => {
    assert.deepEqual(findThemeCoverageGaps(`
      [data-ov-theme=dark] { --ov-color-border-control: black; }
      [data-ov-theme='new-theme'] { --ov-color-border-overlay: gray; }
    `, ['dark', 'new-theme']), [
      { token: '--ov-color-border-control', missingThemes: ['new-theme'] },
      { token: '--ov-color-border-overlay', missingThemes: ['dark'] },
    ]);
  });

  it('merges repeated blocks, parses selector lists and ignores commented declarations', () => {
    const css = `
      :root, [data-ov-theme="dark"] { --ov-color-border-control: black; }
      @layer themes {
        [data-ov-theme='dark'] { --ov-color-border-overlay: var(--ov-color-border-control); }
      }
      [data-ov-theme=light] {
        --ov-color-border-control: white;
        --ov-color-border-overlay: white;
        /* --ov-color-comment-only: red; } */
      }
    `;
    assert.deepEqual([...parseThemeBlocks(css).get('dark')].sort(), [
      '--ov-color-border-control', '--ov-color-border-overlay',
    ]);
    assert.deepEqual(findThemeCoverageGaps(css, ['dark', 'light']), []);
  });

  it('does not mistake descendant or state overrides for a full theme block', () => {
    const css = `
      [data-ov-theme='dark'] { --ov-color-border-control: black; }
      [data-ov-theme='light'] .Child { --ov-color-border-control: white; }
      [data-ov-theme='light'][data-state='open'] { --ov-color-border-control: white; }
    `;
    assert.equal(parseThemeBlocks(css).has('light'), false);
    assert.deepEqual(findThemeCoverageGaps(css, ['dark', 'light']), [
      { token: '--ov-color-border-control', missingThemes: ['light'] },
    ]);
  });

  it('excludes primitives and default-only shared aliases from per-theme override coverage', () => {
    assert.deepEqual(findThemeCoverageGaps(`
      :root { --ov-color-shared-alias: var(--ov-color-border-control); }
      [data-ov-theme='dark'] { --ov-primitive-black: black; --ov-color-border-control: black; }
      [data-ov-theme='light'] { --ov-color-border-control: white; }
    `, ['dark', 'light']), []);
  });
});
