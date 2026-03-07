import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import type { RefObject } from 'react';
import { DEFAULT_OVERSCAN, DEFAULT_ESTIMATED_ITEM_SIZE } from '../constants';

export interface UseListVirtualizerOptions {
  count: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  overscan?: number;
  estimatedItemSize?: number;
  enabled?: boolean;
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
}: UseListVirtualizerOptions): UseListVirtualizerReturn {
  const virtualizer = useVirtualizer({
    count: enabled ? count : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedItemSize,
    overscan,
  });

  return {
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
  };
}
