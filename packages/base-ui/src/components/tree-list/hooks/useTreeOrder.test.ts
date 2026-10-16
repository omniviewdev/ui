import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Key, TreeOrder, TreeReorderEvent } from '../types';
import { useTreeOrder } from './useTreeOrder';

describe('useTreeOrder', () => {
  it('updates internal order in uncontrolled mode', () => {
    const { result } = renderHook(() => useTreeOrder({ defaultOrder: new Map() }));

    act(() => result.current.proposeMove(['a', 'b'], null, 'b', 'a'));

    expect(result.current.currentOrder.get(null)).toEqual(['b', 'a']);
  });

  it('notifies uncontrolled consumers with the next order and reorder event', () => {
    const onOrderChange = vi.fn<(order: TreeOrder, event: TreeReorderEvent) => void>();
    const { result } = renderHook(() => useTreeOrder({ defaultOrder: new Map(), onOrderChange }));

    act(() => result.current.proposeMove(['a', 'b'], null, 'b', 'a'));

    expect(onOrderChange).toHaveBeenCalledTimes(1);
    expect(onOrderChange.mock.calls[0]![0].get(null)).toEqual(['b', 'a']);
    expect(onOrderChange.mock.calls[0]![1]).toEqual({
      activeKey: 'b',
      overKey: 'a',
      parentKey: null,
      fromIndex: 1,
      toIndex: 0,
    });
  });

  it('emits without mutating supplied controlled order', () => {
    const controlled = new Map<Key | null, readonly Key[]>();
    const onOrderChange = vi.fn<(order: TreeOrder, event: TreeReorderEvent) => void>();
    const { result } = renderHook(() => useTreeOrder({ order: controlled, onOrderChange }));

    act(() => result.current.proposeMove(['a', 'b'], null, 'b', 'a'));

    expect(result.current.currentOrder).toBe(controlled);
    expect(controlled.has(null)).toBe(false);
    expect(onOrderChange.mock.calls[0]![0].get(null)).toEqual(['b', 'a']);
  });

  it('uses replacement controlled order props', () => {
    const initial = new Map<Key | null, readonly Key[]>([[null, ['a', 'b']]]);
    const replacement = new Map<Key | null, readonly Key[]>([[null, ['b', 'a']]]);
    const { result, rerender } = renderHook(
      ({ order }: { order: TreeOrder }) => useTreeOrder({ order }),
      { initialProps: { order: initial } },
    );

    expect(result.current.currentOrder).toBe(initial);
    const proposeMove = result.current.proposeMove;

    rerender({ order: replacement });

    expect(result.current.currentOrder).toBe(replacement);
    expect(result.current.proposeMove).toBe(proposeMove);
  });
});
