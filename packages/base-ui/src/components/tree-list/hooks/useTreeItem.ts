import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { Key, TreeItemState, TreeStore } from '../types';

/**
 * Per-item hook that subscribes to only this item's state slice.
 * Uses useSyncExternalStore so the item only re-renders when
 * its own state changes.
 *
 * Unlike useListItem, this does NOT self-register — keys come from
 * the flattener, not from DOM mount.
 */
export function useTreeItem(store: TreeStore, key: Key, textValue?: string): TreeItemState {
  // Register text value for typeahead (but not the key itself)
  useEffect(() => {
    if (textValue !== undefined) {
      store.registerTextValue(key, textValue);
    }
  }, [store, key, textValue]);

  const prevRef = useRef<TreeItemState>({
    isSelected: false,
    isActive: false,
    isDisabled: false,
    isExpanded: false,
    isBranch: false,
    isLoading: false,
    depth: 0,
  });

  const getSnapshot = useCallback((): TreeItemState => {
    const next = store.getItemState(key);
    const prev = prevRef.current;
    if (
      prev.isSelected === next.isSelected &&
      prev.isActive === next.isActive &&
      prev.isDisabled === next.isDisabled &&
      prev.isExpanded === next.isExpanded &&
      prev.isBranch === next.isBranch &&
      prev.isLoading === next.isLoading &&
      prev.depth === next.depth
    ) {
      return prev;
    }
    prevRef.current = next;
    return next;
  }, [store, key]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
