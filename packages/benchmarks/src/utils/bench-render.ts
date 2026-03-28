import { bench } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createElement, type ReactElement } from 'react';
import { ThemeProvider } from '@omniviewdev/base-ui';
import { resolveOptions, type BenchRenderOptions } from './bench-options';

/**
 * Wraps a ReactElement in the ThemeProvider needed for @omniview components.
 */
function wrapWithTheme(element: ReactElement): ReactElement {
  return createElement(ThemeProvider, { persist: false }, element);
}

/**
 * Benchmark a component's mount + unmount cycle.
 *
 * Each iteration: render() → cleanup(). Measures full mount cost.
 *
 * @example
 * benchRender('mount', () => <Button>Click</Button>);
 */
export function benchRender(
  name: string,
  renderFn: () => ReactElement,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);

  bench(
    name,
    () => {
      render(wrapWithTheme(renderFn()));
      cleanup();
    },
    opts,
  );
}

/**
 * Benchmark a component's re-render (prop change reconciliation) cost.
 *
 * Renders once with initialProps, then each iteration: rerender with
 * updatedProps → rerender back to initialProps. Cleanup runs once after.
 *
 * @example
 * benchRerender('variant change',
 *   { initialProps: { variant: 'solid' }, updatedProps: { variant: 'outlined' } },
 *   (props) => <Button {...props}>Click</Button>,
 * );
 */
export function benchRerender<P extends Record<string, unknown>>(
  name: string,
  config: { initialProps: P; updatedProps: P },
  renderFn: (props: P) => ReactElement,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);
  const { initialProps, updatedProps } = config;

  let rerenderFn: ((ui: ReactElement) => void) | undefined;

  bench(
    name,
    () => {
      if (!rerenderFn) {
        throw new Error('benchRerender: setup did not run');
      }
      rerenderFn(wrapWithTheme(renderFn(updatedProps)));
      rerenderFn(wrapWithTheme(renderFn(initialProps)));
    },
    {
      ...opts,
      setup: () => {
        cleanup();
        const result = render(wrapWithTheme(renderFn(initialProps)));
        rerenderFn = result.rerender;
      },
      teardown: () => {
        cleanup();
        rerenderFn = undefined;
      },
    },
  );
}

/**
 * Benchmark mounting many instances of a component simultaneously.
 *
 * Each iteration: render a wrapper with `count` children → cleanup.
 * Measures scaling behavior for "thousands of components in a table" scenarios.
 *
 * @example
 * benchMountMany('mount 1000', 1000, (i) => <Button key={i}>Item {i}</Button>);
 */
export function benchMountMany(
  name: string,
  count: number,
  factory: (index: number) => ReactElement,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);

  // Pre-build the children array once to avoid measuring array construction
  const children = Array.from({ length: count }, (_, i) => factory(i));
  const wrapper = createElement('div', null, ...children);

  bench(
    name,
    () => {
      render(wrapWithTheme(wrapper));
      cleanup();
    },
    opts,
  );
}
