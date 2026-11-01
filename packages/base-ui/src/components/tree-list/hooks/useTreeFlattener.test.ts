import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FlatNode, Key, TreeOrder } from '../types';
import { useTreeFlattener } from './useTreeFlattener';

interface Item {
  key: string;
  children?: readonly Item[];
}

const itemKey = (item: Item): Key => item.key;
const getChildren = (item: Item) => item.children;
const isBranch = (item: Item) => item.children !== undefined;
const matches = (item: Item, text: string) => item.key.includes(text);
const noExpansion = new Set<Key>();

function layout(nodes: FlatNode<Item>[]) {
  return nodes.map((node) => [
    node.key,
    node.parentKey,
    node.depth,
    node.posInSet,
    node.setSize,
    node.isLastChild,
    node.ancestorIsLast,
  ]);
}

const items: readonly Item[] = [
  {
    key: 'root',
    children: [
      { key: 'a' },
      { key: 'nested', children: [{ key: 'z' }] },
      { key: 'empty', children: [] },
    ],
  },
  { key: 'tail' },
];

const filterItems: readonly Item[] = [
  { key: 'excluded' },
  {
    key: 'parent',
    children: [
      { key: 'hidden' },
      { key: 'match-a' },
      {
        key: 'nested',
        children: [{ key: 'hidden-nested' }, { key: 'match-nested' }],
      },
      { key: 'match-branch', children: [{ key: 'hidden-child' }] },
      { key: 'match-empty', children: [] },
    ],
  },
  { key: 'match-root' },
];

const filterOrder: TreeOrder = new Map([
  [null, ['match-root', 'excluded', 'parent']],
  ['parent', ['match-empty', 'nested', 'match-branch', 'match-a', 'hidden']],
]);

describe('useTreeFlattener sibling metadata', () => {
  it.each(['', 'match'])('returns no rows for empty input with filter %j', (filterText) => {
    const { result } = renderHook(() =>
      useTreeFlattener([], itemKey, getChildren, isBranch, noExpansion, filterText, matches),
    );

    expect(result.current).toEqual([]);
  });

  it('counts each displayed sibling group independently across nested and empty branches', () => {
    const expanded = new Set<Key>(['root', 'nested', 'empty']);
    const { result } = renderHook(() =>
      useTreeFlattener(items, itemKey, getChildren, isBranch, expanded, '', undefined),
    );

    expect(layout(result.current)).toEqual([
      ['root', null, 0, 1, 2, false, []],
      ['a', 'root', 1, 1, 3, false, [false]],
      ['nested', 'root', 1, 2, 3, false, [false]],
      ['z', 'nested', 2, 1, 1, true, [false, false]],
      ['empty', 'root', 1, 3, 3, true, [false]],
      ['tail', null, 0, 2, 2, true, []],
    ]);
    expect(result.current.every((node) => node.filterExpanded === undefined)).toBe(true);
  });

  it('does not visit collapsed children and gives a singleton its complete sibling boundary', () => {
    const readChildren = vi.fn(getChildren);
    const { result } = renderHook(() =>
      useTreeFlattener(
        items.slice(0, 1),
        itemKey,
        readChildren,
        isBranch,
        noExpansion,
        '',
        undefined,
      ),
    );

    expect(layout(result.current)).toEqual([['root', null, 0, 1, 1, true, []]]);
    expect(readChildren).not.toHaveBeenCalled();
  });

  it('uses displayed order while appending unspecified siblings and ignoring stale or duplicate keys', () => {
    const expanded = new Set<Key>(['root', 'nested']);
    const order: TreeOrder = new Map([
      [null, ['tail', 'missing', 'tail']],
      ['root', ['nested', 'nested', 'missing', 'empty']],
    ]);
    const { result } = renderHook(() =>
      useTreeFlattener(items, itemKey, getChildren, isBranch, expanded, '', undefined, order),
    );

    expect(layout(result.current)).toEqual([
      ['tail', null, 0, 1, 2, false, []],
      ['root', null, 0, 2, 2, true, []],
      ['nested', 'root', 1, 1, 3, false, [true]],
      ['z', 'nested', 2, 1, 1, true, [true, false]],
      ['empty', 'root', 1, 2, 3, false, [true]],
      ['a', 'root', 1, 3, 3, true, [true]],
    ]);
    expect(order.get(null)).toEqual(['tail', 'missing', 'tail']);
    expect(order.get('root')).toEqual(['nested', 'nested', 'missing', 'empty']);
  });

  it.each([false, true])(
    'counts only retained siblings with filtering and ordered=%s',
    (ordered) => {
      const expanded = new Set<Key>(['match-branch', 'unrelated']);
      const { result } = renderHook(() =>
        useTreeFlattener(
          filterItems,
          itemKey,
          getChildren,
          isBranch,
          expanded,
          'match',
          matches,
          ordered ? filterOrder : undefined,
        ),
      );

      expect(layout(result.current)).toEqual(
        ordered
          ? [
              ['match-root', null, 0, 1, 2, false, []],
              ['parent', null, 0, 2, 2, true, []],
              ['match-empty', 'parent', 1, 1, 4, false, [true]],
              ['nested', 'parent', 1, 2, 4, false, [true]],
              ['match-nested', 'nested', 2, 1, 1, true, [true, false]],
              ['match-branch', 'parent', 1, 3, 4, false, [true]],
              ['match-a', 'parent', 1, 4, 4, true, [true]],
            ]
          : [
              ['parent', null, 0, 1, 2, false, []],
              ['match-a', 'parent', 1, 1, 4, false, [false]],
              ['nested', 'parent', 1, 2, 4, false, [false]],
              ['match-nested', 'nested', 2, 1, 1, true, [false, false]],
              ['match-branch', 'parent', 1, 3, 4, false, [false]],
              ['match-empty', 'parent', 1, 4, 4, true, [false]],
              ['match-root', null, 0, 2, 2, true, []],
            ],
      );
      expect(
        Object.fromEntries(result.current.map((node) => [node.key, node.filterExpanded])),
      ).toEqual({
        parent: true,
        nested: true,
        'match-a': undefined,
        'match-nested': undefined,
        'match-branch': false,
        'match-empty': false,
        'match-root': undefined,
      });
      expect([...expanded]).toEqual(['match-branch', 'unrelated']);
    },
  );

  it('restores controlled collapse and removes expansion overrides when filtering ends', () => {
    const expanded = new Set<Key>(['match-branch']);
    const { result, rerender } = renderHook(
      ({ filterText }) =>
        useTreeFlattener(
          filterItems,
          itemKey,
          getChildren,
          isBranch,
          expanded,
          filterText,
          matches,
        ),
      { initialProps: { filterText: 'match' } },
    );

    expect(result.current.some((node) => node.key === 'match-nested')).toBe(true);
    rerender({ filterText: '' });

    expect(layout(result.current)).toEqual([
      ['excluded', null, 0, 1, 3, false, []],
      ['parent', null, 0, 2, 3, false, []],
      ['match-root', null, 0, 3, 3, true, []],
    ]);
    expect(result.current.every((node) => node.filterExpanded === undefined)).toBe(true);
    expect([...expanded]).toEqual(['match-branch']);
  });

  it('keeps normal sibling counts when filter text has no predicate', () => {
    const { result } = renderHook(() =>
      useTreeFlattener(items, itemKey, getChildren, isBranch, noExpansion, 'absent', undefined),
    );

    expect(layout(result.current)).toEqual([
      ['root', null, 0, 1, 2, false, []],
      ['tail', null, 0, 2, 2, true, []],
    ]);
  });
});
