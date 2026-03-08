import { useCallback, useRef, useSyncExternalStore } from 'react';
import type { Key, CommandListItemState, CommandListStore } from '../types';

/**
 * Per-item hook that subscribes to only this item's state slice.
 * Uses useSyncExternalStore so the item only re-renders when
 * its own isActive/isDisabled changes.
 */
export function useCommandListItem(store: CommandListStore, key: Key): CommandListItemState {
  const prevRef = useRef<CommandListItemState>({
    isActive: false,
    isDisabled: false,
  });

  const getSnapshot = useCallback((): CommandListItemState => {
    const next = store.getItemState(key);
    const prev = prevRef.current;
    if (prev.isActive === next.isActive && prev.isDisabled === next.isDisabled) {
      return prev;
    }
    prevRef.current = next;
    return next;
  }, [store, key]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
