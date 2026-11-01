import {
  defaultRangeExtractor,
  useVirtualizer,
  type Range,
  type VirtualItem,
  type Virtualizer,
} from '@tanstack/react-virtual';
import { useCallback, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import type { ListOrientation } from '../types';
import { DEFAULT_OVERSCAN, DEFAULT_ESTIMATED_ITEM_SIZE, DEFAULT_ORIENTATION } from '../constants';

export interface UseListVirtualizerOptions {
  count: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  overscan?: number;
  estimatedItemSize?: number;
  enabled?: boolean;
  orientation?: ListOrientation;
  /** Keep the active descendant mounted even when it is outside the viewport. */
  pinnedIndex?: number;
}

export interface UseListVirtualizerReturn {
  virtualItems: VirtualItem[];
  totalSize: number;
  measureElement: (el: HTMLElement | null) => void;
  scrollToIndex: Virtualizer<HTMLDivElement, HTMLElement>['scrollToIndex'];
}

/**
 * Thin wrapper around @tanstack/react-virtual for list virtualization.
 */
export function useListVirtualizer({
  count,
  scrollRef,
  overscan = DEFAULT_OVERSCAN,
  estimatedItemSize = DEFAULT_ESTIMATED_ITEM_SIZE,
  enabled = true,
  orientation = DEFAULT_ORIENTATION,
  pinnedIndex,
}: UseListVirtualizerOptions): UseListVirtualizerReturn {
  const listenersRef = useRef(new Set<() => void>());
  const snapshotRef = useRef<{ virtualItems: VirtualItem[]; totalSize: number } | null>(null);
  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);
  const onChange = useCallback(() => {
    for (const listener of listenersRef.current) listener();
  }, []);
  const rangeExtractor = useCallback(
    (range: Range) => {
      const indices = defaultRangeExtractor(range);
      if (pinnedIndex == null || pinnedIndex < 0 || pinnedIndex >= count) return indices;
      if (indices.length === 0 || pinnedIndex < indices[0]!) return [pinnedIndex, ...indices];
      if (pinnedIndex > indices[indices.length - 1]!) return [...indices, pinnedIndex];
      return indices;
    },
    [count, pinnedIndex],
  );
  const virtualizer = useVirtualizer({
    count: enabled ? count : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedItemSize,
    overscan,
    horizontal: orientation === 'horizontal',
    rangeExtractor,
    onChange,
    // External-store subscribers already update synchronously. The adapter's
    // flushSync would otherwise also run for notifications raised in commit.
    useFlushSync: false,
  });

  // TanStack returns a stable mutable instance. Read its getters through an
  // observable snapshot, not render expressions the React Compiler may cache.
  const getSnapshot = useCallback(() => {
    const virtualItems = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();
    const previous = snapshotRef.current;
    if (previous?.virtualItems === virtualItems && previous.totalSize === totalSize)
      return previous;
    const next = { virtualItems, totalSize };
    snapshotRef.current = next;
    return next;
  }, [virtualizer]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Cached row sizes must not outlive a responsive or theme-driven estimate.
  useLayoutEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) virtualizer.measure();
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, estimatedItemSize, virtualizer]);

  return {
    virtualItems: snapshot.virtualItems,
    totalSize: snapshot.totalSize,
    measureElement: virtualizer.measureElement,
    scrollToIndex: virtualizer.scrollToIndex,
  };
}
