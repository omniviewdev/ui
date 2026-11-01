import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FlatNode, Key, TreeStoreSnapshot } from '../types';
import { useTreeStore } from './useTreeStore';

function node(key: Key): FlatNode {
  return {
    key,
    item: key,
    depth: 0,
    parentKey: null,
    isBranch: false,
    isLastChild: true,
    ancestorIsLast: [],
    posInSet: 1,
    setSize: 1,
  };
}

describe('useTreeStore snapshots', () => {
  it('keeps published selection and expansion isolated from reused mutable inputs', () => {
    const disabled = new Set<Key>();
    const { result } = renderHook(() => useTreeStore(disabled));
    const store = result.current;
    const selected = new Set<Key>(['a']);
    const expanded = new Set<Key>(['group']);

    act(() => {
      store.setSelectedKeys(selected);
      store.setExpandedKeys(expanded);
    });
    const previous = store.getSnapshot();

    selected.clear();
    selected.add('b');
    expanded.clear();
    act(() => {
      store.setSelectedKeys(selected);
      store.setExpandedKeys(expanded);
    });

    expect([...previous.selectedKeys]).toEqual(['a']);
    expect([...previous.expandedKeys]).toEqual(['group']);
    expect([...store.getSnapshot().selectedKeys]).toEqual(['b']);
    expect([...store.getSnapshot().expandedKeys]).toEqual([]);
  });

  it('publishes silent changes together without changing an earlier snapshot', () => {
    const disabled = new Set<Key>();
    const { result } = renderHook(() => useTreeStore(disabled));
    const store = result.current;
    act(() => store.setFlatNodes([node('old')]));
    const previous = store.getSnapshot();
    const observed: TreeStoreSnapshot[] = [];
    const unsubscribe = store.subscribe(() => observed.push(store.getSnapshot()));

    act(() => {
      store.setFlatNodes([node('new')], true);
      store.setSelectedKeys(new Set(['new']), true);
      store.setExpandedKeys(new Set(['group']), true);
      store.setActiveKey('new', true);
      store.setLoadingKey('group', true, true);
    });

    expect(observed).toEqual([]);
    expect(store.getSnapshot().flattenedKeys).toEqual(['old']);
    expect(store.getSnapshot().activeKey).toBeNull();

    act(() => store.emit());

    expect(observed).toHaveLength(1);
    expect(observed[0]).toMatchObject({
      flattenedKeys: ['new'],
      visibleCount: 1,
      activeKey: 'new',
      selectedKeys: new Set(['new']),
      expandedKeys: new Set(['group']),
      loadingKeys: new Set(['group']),
    });
    expect(previous.flattenedKeys).toEqual(['old']);
    expect(previous.selectedKeys.size).toBe(0);
    expect(previous.expandedKeys.size).toBe(0);
    expect(previous.loadingKeys.size).toBe(0);
    unsubscribe();
  });

  it('retains loading history after completion and unrelated focus changes', () => {
    const disabled = new Set<Key>();
    const { result } = renderHook(() => useTreeStore(disabled));
    const store = result.current;
    act(() => store.setLoadingKey('group', true));
    const pending = store.getSnapshot();

    act(() => store.setActiveKey('group'));
    expect([...store.getSnapshot().loadingKeys]).toEqual(['group']);
    act(() => store.setLoadingKey('group', false));

    expect([...pending.loadingKeys]).toEqual(['group']);
    expect(store.getSnapshot().loadingKeys.size).toBe(0);
    expect(store.getSnapshot().activeKey).toBe('group');
  });

  it('publishes replacement disabled keys without mutating earlier snapshots', () => {
    const { result, rerender } = renderHook(({ disabled }) => useTreeStore(disabled), {
      initialProps: { disabled: new Set<Key>(['a']) },
    });
    const store = result.current;
    const previous = store.getSnapshot();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    rerender({ disabled: new Set<Key>(['b']) });

    expect([...previous.disabledKeys]).toEqual(['a']);
    expect([...store.getSnapshot().disabledKeys]).toEqual(['b']);
    expect(store.getItemState('a').isDisabled).toBe(false);
    expect(store.getItemState('b').isDisabled).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
