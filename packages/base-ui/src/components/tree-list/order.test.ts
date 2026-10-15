import { describe, expect, it } from 'vitest';
import { applySiblingOrder, moveSibling } from './order';
import type { TreeOrder } from './types';

describe('applySiblingOrder', () => {
  it('applies explicit keys first and appends new source keys in source order', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const order: TreeOrder = new Map([[null, ['b', 'missing']]]);

    expect(applySiblingOrder(items, null, order, (item) => item.id).map((item) => item.id)).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('supports number keys', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const order: TreeOrder = new Map([[7, [3, 1]]]);

    expect(applySiblingOrder(items, 7, order, (item) => item.id).map((item) => item.id)).toEqual([
      3,
      1,
      2,
    ]);
  });

  it('ignores duplicate keys in a malformed preset', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const order: TreeOrder = new Map([[null, ['b', 'b', 'a']]]);

    expect(applySiblingOrder(items, null, order, (item) => item.id).map((item) => item.id)).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('returns the source array when no order entry exists', () => {
    const items = [{ id: 'a' }];

    expect(applySiblingOrder(items, null, new Map(), (item) => item.id)).toBe(items);
  });

  it('handles empty groups', () => {
    const items: { id: string }[] = [];
    const order: TreeOrder = new Map([[null, ['missing']]]);

    expect(applySiblingOrder(items, null, order, (item) => item.id)).toEqual([]);
  });
});

describe('moveSibling', () => {
  it('moves one sibling and returns immutable sparse order plus event metadata', () => {
    const initial: TreeOrder = new Map();
    const result = moveSibling(initial, ['a', 'b', 'c'], null, 'c', 'a');

    expect(result?.order.get(null)).toEqual(['c', 'a', 'b']);
    expect(result?.event).toEqual({
      activeKey: 'c',
      overKey: 'a',
      parentKey: null,
      fromIndex: 2,
      toIndex: 0,
    });
    expect(initial.size).toBe(0);
  });

  it('supports number keys without mutating the sibling keys', () => {
    const siblingKeys = [1, 2, 3] as const;
    const result = moveSibling(new Map(), siblingKeys, 9, 1, 3);

    expect(result?.order.get(9)).toEqual([2, 3, 1]);
    expect(result?.event).toEqual({
      activeKey: 1,
      overKey: 3,
      parentKey: 9,
      fromIndex: 0,
      toIndex: 2,
    });
    expect(siblingKeys).toEqual([1, 2, 3]);
  });

  it('returns null for self, missing, and cross-group-invalid inputs', () => {
    expect(moveSibling(new Map(), ['a', 'b'], null, 'a', 'a')).toBeNull();
    expect(moveSibling(new Map(), ['a', 'b'], null, 'missing', 'a')).toBeNull();
    expect(moveSibling(new Map(), ['a', 'b'], null, 'a', 'missing')).toBeNull();
  });

  it('returns null for an empty group', () => {
    expect(moveSibling(new Map(), [], null, 'a', 'b')).toBeNull();
  });
});
