import { bench } from 'vitest';
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
 *   mount [@omniview/base-ui]   12,400 ops/s
 *   mount [@mui/material]        3,800 ops/s
 */
export function benchCompare(
  suiteName: string,
  implementations: Record<string, () => ReactElement>,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);

  for (const [label, renderFn] of Object.entries(implementations)) {
    bench(
      `${suiteName} [${label}]`,
      () => {
        render(renderFn());
        cleanup();
      },
      opts,
    );
  }
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

  for (const [label, factory] of Object.entries(implementations)) {
    const children = Array.from({ length: count }, (_, i) => factory(i));
    const wrap = wrappers[label] ?? ((el: ReactElement) => el);
    const wrapped = wrap(createElement('div', null, ...children));

    bench(
      `${suiteName} [${label}]`,
      () => {
        render(wrapped);
        cleanup();
      },
      opts,
    );
  }
}
