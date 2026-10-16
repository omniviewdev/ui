import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findDependencyCycles, findCustomPropertyCycles } from './custom-property-cycles.mjs';

describe('custom-property dependency cycles', () => {
  it('finds self, indirect, and disconnected cycles deterministically', () => {
    const entries = [
      ['--c', new Set(['--a'])],
      ['--a', new Set(['--b'])],
      ['--b', new Set(['--c'])],
      ['--self', new Set(['--self'])],
      ['--safe', new Set(['--inherited'])],
    ];
    const expected = [['--a', '--b', '--c'], ['--self']];
    assert.deepEqual(findDependencyCycles(new Map(entries)), expected);
    assert.deepEqual(findDependencyCycles(new Map(entries.reverse())), expected);
  });

  it('accepts chains and diamonds without treating shared dependencies as cycles', () => {
    assert.deepEqual(findDependencyCycles(new Map([
      ['--a', new Set(['--b', '--c'])],
      ['--b', new Set(['--d'])],
      ['--c', new Set(['--d'])],
      ['--d', new Set()],
    ])), []);
  });

  it('catches disappearing-divider self references in every variant', () => {
    const css = ['soft', 'solid', 'outline', 'ghost'].map((variant) => `
      .Divider[data-variant='${variant}'] {
        --line: var(--line);
        border-top: 1px solid var(--line);
      }
    `).join('\n');
    assert.deepEqual(findCustomPropertyCycles(css).map(({ selector, properties }) => ({ selector, properties })),
      ['ghost', 'outline', 'soft', 'solid'].map((variant) => ({
        selector: `.Divider[data-variant='${variant}']`, properties: ['--line'],
      })));
  });

  it('includes fallback dependencies and multiline functions but ignores strings and comments', () => {
    const cycles = findCustomPropertyCycles(`
      .Divider {
        --a: color-mix(in srgb, var(--external, var( /* fallback */ --b)) 50%, transparent);
        --b: var(\n --a\n );
        --text: "var(--text)";
        --url: url("var(--url)");
        /* --comment: var(--comment); */
      }
    `);
    assert.deepEqual(cycles.map(({ properties }) => properties), [['--a', '--b']]);
  });

  it('does not join inherited values on parents and children into a same-element cycle', () => {
    assert.deepEqual(findCustomPropertyCycles(`
      .Parent { --a: var(--b); }
      .Parent > .Child { --b: var(--a); }
      .Parent > .Child::before { --a: var(--b); }
    `), []);
  });

  it('combines repeated identical selectors and respects winning declarations', () => {
    const css = `
      .Cycle { --a: var(--b); }
      .Cycle { --b: var(--a); }
      .Safe { --a: var(--a); --a: red; }
      .Important { --a: red !important; }
      .Important { --a: var(--a); }
      .Important { --a: blue !important; }
    `;
    assert.deepEqual(findCustomPropertyCycles(css).map(({ selector, properties }) => ({ selector, properties })),
      [{ selector: '.Cycle', properties: ['--a', '--b'] }]);
  });

  it('keeps mutually exclusive media scopes separate and handles selector lists', () => {
    assert.deepEqual(findCustomPropertyCycles(`
      @media (width < 500px) { .Item { --a: var(--b); } }
      @media (width >= 500px) { .Item { --b: var(--a); } }
      .First, .Second { --line: var(--line); }
    `).map(({ selector, properties }) => ({ selector, properties })), [
      { selector: '.First', properties: ['--line'] },
      { selector: '.Second', properties: ['--line'] },
    ]);
  });
});
