import { test } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createElement, type ReactElement } from 'react';
import { resolveOptions, type BenchRenderOptions } from './bench-options';

/**
 * Run side-by-side benchmarks for multiple library implementations.
 *
 * Each entry in `implementations` maps a label (e.g., "@mui/material")
 * to a render function that returns a fully-wrapped ReactElement
 * (including any ThemeProvider the library needs).
 *
 * Vitest output will read:
 *   mount [raw]                 45,230 ops/s
 *   mount [@omniviewdev/base-ui]   12,400 ops/s
 *   mount [@mui/material]        3,800 ops/s
 */
export function benchCompare(
  suiteName: string,
  implementations: Record<string, () => ReactElement>,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);

  test(suiteName, async ({ bench }) => {
    const registrations = Object.entries(implementations).map(([label, renderFn]) =>
      bench(`${suiteName} [${label}]`, () => {
        render(renderFn());
        cleanup();
      }),
    );
    await bench.compare(...registrations, opts);
  });
}

/**
 * Like benchCompare but renders `count` instances in a single mount.
 * Each implementation's factory receives an index and must return a keyed element.
 */
export function benchCompareMany(
  suiteName: string,
  count: number,
  implementations: Record<string, (index: number) => ReactElement>,
  wrappers: Record<string, (children: ReactElement) => ReactElement>,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);

  const variants = Object.entries(implementations).map(([label, factory]) => {
    // Element creation is intentionally outside the bench callback so we
    // measure only React mount/reconciliation cost, not JS array/createElement
    // overhead. This mirrors benchMountMany's design.
    const children = Array.from({ length: count }, (_, i) => factory(i));
    const wrap = wrappers[label] ?? ((el: ReactElement) => el);
    const wrapped = wrap(createElement('div', null, ...children));

    return { label, wrapped };
  });

  test(suiteName, async ({ bench }) => {
    const registrations = variants.map(({ label, wrapped }) =>
      bench(`${suiteName} [${label}]`, () => {
        render(wrapped);
        cleanup();
      }),
    );
    await bench.compare(...registrations, opts);
  });
}
