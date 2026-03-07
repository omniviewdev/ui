import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import type { RefObject } from 'react';
import type { ListOrientation } from '../types';
import { DEFAULT_OVERSCAN, DEFAULT_ESTIMATED_ITEM_SIZE, DEFAULT_ORIENTATION } from '../constants';

export interface UseListVirtualizerOptions {
  count: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  overscan?: number;
  estimatedItemSize?: number;
  enabled?: boolean;
  orientation?: ListOrientation;
}

export interface UseListVirtualizerReturn {
  virtualItems: VirtualItem[];
  totalSize: number;
  measureElement: (el: HTMLElement | null) => void;
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
}: UseListVirtualizerOptions): UseListVirtualizerReturn {
  const virtualizer = useVirtualizer({
    count: enabled ? count : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedItemSize,
    overscan,
    horizontal: orientation === 'horizontal',
  });

  return {
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
  };
}
