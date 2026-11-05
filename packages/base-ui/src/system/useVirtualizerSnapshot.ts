import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import {
  Virtualizer,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  type VirtualItem,
  type VirtualizerOptions,
} from '@tanstack/react-virtual';

type DefaultedOptions = 'observeElementRect' | 'observeElementOffset' | 'scrollToFn';
export type VirtualizerSnapshotOptions<TScroll extends Element, TItem extends Element> = Omit<
  VirtualizerOptions<TScroll, TItem>,
  DefaultedOptions
> &
  Partial<Pick<VirtualizerOptions<TScroll, TItem>, DefaultedOptions>>;

const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

function createVirtualizerStore<TScroll extends Element, TItem extends Element>(
  options: VirtualizerSnapshotOptions<TScroll, TItem>,
) {
  const instance = new Virtualizer<TScroll, TItem>({
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options,
  });
  const listeners = new Set<() => void>();
  let snapshot: { virtualItems: VirtualItem[]; totalSize: number } | undefined;
  return {
    instance,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    notify() {
      for (const listener of listeners) listener();
    },
    getSnapshot() {
      const virtualItems = instance.getVirtualItems();
      const totalSize = instance.getTotalSize();
      if (!snapshot || snapshot.virtualItems !== virtualItems || snapshot.totalSize !== totalSize) {
        snapshot = { virtualItems, totalSize };
      }
      return snapshot;
    },
  };
}

/** Adapts the imperative Virtual core lifecycle to React's snapshot subscription contract. */
export function useVirtualizerSnapshot<TScroll extends Element, TItem extends Element>(
  options: VirtualizerSnapshotOptions<TScroll, TItem>,
) {
  const [store] = useState(() => createVirtualizerStore(options));
  const { instance } = store;
  // Match the official adapter: synchronize options during render, mount once,
  // and reconnect observers after every commit. React owns all DOM positioning.
  instance.setOptions({
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options,
    onChange: (virtualizer, sync) => {
      store.notify();
      options.onChange?.(virtualizer, sync);
    },
  });
  useIsomorphicLayoutEffect(() => instance._didMount(), [instance]);
  useIsomorphicLayoutEffect(() => instance._willUpdate());
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return {
    ...snapshot,
    measureElement: instance.measureElement,
    scrollToIndex: instance.scrollToIndex,
    measure: instance.measure,
  };
}
