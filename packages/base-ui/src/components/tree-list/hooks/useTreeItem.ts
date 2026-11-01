import { useCallback, useLayoutEffect, useSyncExternalStore } from 'react';
import type { Key, TreeItemState, TreeStore } from '../types';

/**
 * Per-item hook that subscribes to only this item's state slice.
 * Uses useSyncExternalStore so the item only re-renders when
 * its own state changes.
 *
 * Unlike useListItem, this does NOT self-register — keys come from
 * the flattener, not from DOM mount.
 */
export function useTreeItem(
  store: TreeStore,
  key: Key,
  textValue?: string,
  selectable?: boolean,
): TreeItemState {
  // Retain per-key metadata across virtualized/filtered unmounts. Eligibility
  // must be registered before keyboard interaction, not only on row clicks.
  useLayoutEffect(() => {
    if (selectable !== undefined) store.registerSelectable(key, selectable);
    if (textValue !== undefined) {
      store.registerTextValue(key, textValue);
    }
  }, [store, key, textValue, selectable]);

  const getSnapshot = useCallback(() => store.getItemState(key), [store, key]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
