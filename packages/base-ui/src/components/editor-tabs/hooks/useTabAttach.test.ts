import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTabAttach } from './useTabAttach';

describe('useTabAttach', () => {
  it('returns isDropTarget false and insertIndex null without broker', () => {
    const viewportRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useTabAttach({
        instanceId: 'test',
        viewportRef,
      }),
    );

    expect(result.current.isDropTarget).toBe(false);
    expect(result.current.insertIndex).toBeNull();
  });

  it('returns stable values across re-renders without broker', () => {
    const viewportRef = { current: document.createElement('div') };
    const { result, rerender } = renderHook(() =>
      useTabAttach({
        instanceId: 'test',
        viewportRef,
      }),
    );

    const first = result.current;
    rerender();
    expect(result.current.isDropTarget).toBe(first.isDropTarget);
    expect(result.current.insertIndex).toBe(first.insertIndex);
  });
});
