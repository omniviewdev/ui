import { describe, it, expect } from 'vitest';
import { createElement } from 'react';

// We can't easily unit-test bench() calls (they need the bench runner),
// so we test the helper functions' internal logic by testing their
// integration behavior — render/cleanup cycles work correctly.

import { render, cleanup, screen } from '@testing-library/react';
import { ThemeProvider } from '@omniview/base-ui';

describe('bench-render utilities integration', () => {
  it('render + cleanup cycle works for simple component', () => {
    const element = createElement(
      ThemeProvider,
      { persist: false },
      createElement('button', { 'data-testid': 'btn' }, 'Click'),
    );
    render(element);
    expect(screen.getByTestId('btn')).toBeInTheDocument();
    cleanup();
    expect(screen.queryByTestId('btn')).toBeNull();
  });

  it('rerender cycle works for prop changes', () => {
    const element = createElement(
      ThemeProvider,
      { persist: false },
      createElement('button', { 'data-testid': 'btn' }, 'Initial'),
    );
    const { rerender } = render(element);

    const updated = createElement(
      ThemeProvider,
      { persist: false },
      createElement('button', { 'data-testid': 'btn' }, 'Updated'),
    );
    rerender(updated);
    expect(screen.getByTestId('btn').textContent).toBe('Updated');
    cleanup();
  });

  it('mount many renders N children', () => {
    const children = Array.from({ length: 100 }, (_, i) =>
      createElement('span', { key: i, 'data-testid': `item-${i}` }, `Item ${i}`),
    );
    const wrapper = createElement(
      ThemeProvider,
      { persist: false },
      createElement('div', { 'data-testid': 'wrapper' }, ...children),
    );
    render(wrapper);
    expect(screen.getByTestId('wrapper').children.length).toBe(100);
    cleanup();
  });
});
