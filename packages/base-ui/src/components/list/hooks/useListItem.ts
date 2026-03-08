import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { Key, ItemState, ListStore } from '../types';

/**
 * Per-item hook that subscribes to only this item's state slice.
 * Uses useSyncExternalStore so the item only re-renders when
 * its own isSelected/isActive/isDisabled changes.
 */
export function useListItem(store: ListStore, key: Key, textValue?: string): ItemState {
  // Register this item with the store
  useEffect(() => {
    return store.registerItem(key, textValue);
  }, [store, key, textValue]);

  // Memoize the snapshot selector so we get referential stability
  const prevRef = useRef<ItemState>({
    isSelected: false,
    isActive: false,
    isDisabled: false,
  });

  const getSnapshot = useCallback((): ItemState => {
    const next = store.getItemState(key);
    const prev = prevRef.current;
    // Return same reference if nothing changed (avoids re-render)
    if (
      prev.isSelected === next.isSelected &&
      prev.isActive === next.isActive &&
      prev.isDisabled === next.isDisabled
    ) {
      return prev;
    }
    prevRef.current = next;
    return next;
  }, [store, key]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
