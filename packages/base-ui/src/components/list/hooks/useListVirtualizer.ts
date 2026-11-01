import { defaultRangeExtractor, useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
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
  getItemKey?: (index: number) => string | number;
  /** Keep the keyboard-active row mounted even outside the scroll window. */
  activeIndex?: number;
  /** Keep the drag source mounted independently of keyboard focus. */
  draggedIndex?: number;
}

export interface UseListVirtualizerReturn {
  virtualItems: VirtualItem[];
  totalSize: number;
  measureElement: (el: HTMLElement | null) => void;
  scrollToIndex: (index: number) => void;
}

const getIndexKey = (index: number) => index;

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
  getItemKey = getIndexKey,
  activeIndex = -1,
  draggedIndex = -1,
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
    (range: Parameters<typeof defaultRangeExtractor>[0]) => {
      const indices = defaultRangeExtractor(range);
      if (activeIndex >= 0 && activeIndex < count && !indices.includes(activeIndex)) {
        indices.push(activeIndex);
        indices.sort((a, b) => a - b);
      }
      if (draggedIndex >= 0 && draggedIndex < count && !indices.includes(draggedIndex)) {
        const insertion = indices.findIndex((index) => index > draggedIndex);
        indices.splice(insertion < 0 ? indices.length : insertion, 0, draggedIndex);
      }
      return indices;
    },
    [activeIndex, draggedIndex, count],
  );
  const virtualizer = useVirtualizer({
    count: enabled ? count : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedItemSize,
    overscan,
    horizontal: orientation === 'horizontal',
    getItemKey,
    rangeExtractor,
    onChange,
    // External-store subscribers already update synchronously. The adapter's
    // flushSync would otherwise also run for notifications raised in commit.
    useFlushSync: false,
  });
  const scrollToIndex = useCallback(
    (index: number) => virtualizer.scrollToIndex(index, { align: 'auto' }),
    [virtualizer],
  );

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
    scrollToIndex,
  };
}
