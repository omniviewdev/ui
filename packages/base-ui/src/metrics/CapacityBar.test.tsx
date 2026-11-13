import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { renderWithTheme } from '../test/render';
import { CapacityBar } from './CapacityBar';

const unit = { kind: 'number' } as const;

function loadingCell(key?: number) {
  return <CapacityBar key={key} variant="cell" loading value={null} unit={unit} />;
}

function placeholders(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="group"] [aria-hidden="true"]'));
}

function onlyPlaceholder(container: HTMLElement): HTMLElement {
  const [node] = placeholders(container);
  if (!node) throw new Error('no loading placeholder rendered');
  return node;
}

function pulsing(node: HTMLElement) {
  return node.getAttribute('data-ov-animation') === 'pulse';
}

describe('CapacityBar loading cell pulse', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
  });

  afterEach(() => {
    // The shared timer's state is module-level: let any stale timer fire before restoring real ones.
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('pulses a placeholder that stays mounted for the delay', () => {
    const { container, unmount } = renderWithTheme(loadingCell());
    const node = onlyPlaceholder(container);
    expect(pulsing(node)).toBe(false);
    act(() => vi.advanceTimersByTime(499));
    expect(pulsing(node)).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(pulsing(node)).toBe(true);
    unmount();
  });

  it('never pulses a placeholder removed before the delay', () => {
    const { container, unmount } = renderWithTheme(loadingCell());
    const node = onlyPlaceholder(container);
    act(() => vi.advanceTimersByTime(499));
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(pulsing(node)).toBe(false);
  });

  it('shares one timer across placeholders registered in the same tick', () => {
    const { container, unmount } = renderWithTheme(
      <>{Array.from({ length: 100 }, (_, index) => loadingCell(index))}</>,
    );
    const nodes = placeholders(container);
    expect(nodes).toHaveLength(100);
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(499));
    expect(nodes.some(pulsing)).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(nodes.every(pulsing)).toBe(true);
    unmount();
  });

  it('pulses placeholders registered at different times at their own deadlines', () => {
    const first = renderWithTheme(loadingCell());
    const early = onlyPlaceholder(first.container);
    act(() => vi.advanceTimersByTime(300));
    const second = renderWithTheme(loadingCell());
    const late = onlyPlaceholder(second.container);
    act(() => vi.advanceTimersByTime(199));
    expect(pulsing(early)).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(pulsing(early)).toBe(true);
    expect(pulsing(late)).toBe(false);
    act(() => vi.advanceTimersByTime(299));
    expect(pulsing(late)).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(pulsing(late)).toBe(true);
    first.unmount();
    second.unmount();
  });

  it('leaves no timer pending once every placeholder is gone and timers have run', () => {
    const { unmount } = renderWithTheme(
      <>{Array.from({ length: 10 }, (_, index) => loadingCell(index))}</>,
    );
    unmount();
    // The stale timer is left to fire rather than cancelled, and must not re-arm.
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(500));
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.runAllTimers());
    expect(vi.getTimerCount()).toBe(0);
  });
});
