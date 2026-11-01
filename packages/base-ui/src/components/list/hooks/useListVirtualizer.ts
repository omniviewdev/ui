import { defaultRangeExtractor, useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { useCallback, type RefObject } from 'react';
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
  });
  const scrollToIndex = useCallback(
    (index: number) => virtualizer.scrollToIndex(index, { align: 'auto' }),
    [virtualizer],
  );

  return {
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
    scrollToIndex,
  };
}
