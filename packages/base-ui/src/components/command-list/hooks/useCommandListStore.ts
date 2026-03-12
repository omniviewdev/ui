import { useCallback, useRef } from 'react';
import type {
  Key,
  CommandListStore,
  CommandListStoreSnapshot,
  CommandListItemState,
  ProcessedItem,
} from '../types';

/**
 * Creates a lightweight external store for command list state.
 * Items subscribe via useSyncExternalStore to their own key's slice,
 * preventing cascading re-renders when active/loading state changes.
 */
export function useCommandListStore(): CommandListStore {
  const listenersRef = useRef(new Set<() => void>());
  const itemsRef = useRef<ProcessedItem[]>([]);
  const keyToItemMapRef = useRef<Map<Key, ProcessedItem>>(new Map());
  const activeIndexRef = useRef(0);
  const activeKeyRef = useRef<Key | null>(null);
  const queryRef = useRef('');
  const loadingRef = useRef(false);

  const versionRef = useRef(0);
  const snapshotRef = useRef<CommandListStoreSnapshot>({
    activeIndex: 0,
    activeKey: null,
    query: '',
    visibleCount: 0,
    loading: false,
  });

  // Internal: rebuild the snapshot object from current refs.
  const rebuildSnapshot = useCallback(() => {
    versionRef.current += 1;
    snapshotRef.current = {
      activeIndex: activeIndexRef.current,
      activeKey: activeKeyRef.current,
      query: queryRef.current,
      visibleCount: itemsRef.current.length,
      loading: loadingRef.current,
    };
  }, []);

  const notifyListeners = useCallback(() => {
    for (const l of listenersRef.current) l();
  }, []);

  const emit = useCallback(() => {
    rebuildSnapshot();
    notifyListeners();
  }, [rebuildSnapshot, notifyListeners]);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback((): CommandListStoreSnapshot => {
    return snapshotRef.current;
  }, []);

  const getItemState = useCallback((key: Key): CommandListItemState => {
    return {
      isActive: activeKeyRef.current === key,
      isDisabled: keyToItemMapRef.current.get(key)?.disabled ?? false,
    };
  }, []);

  const setActiveIndex = useCallback(
    (index: number) => {
      activeIndexRef.current = index;
      const item = itemsRef.current[index];
      activeKeyRef.current = item ? item.key : null;
      emit();
    },
    [emit],
  );

  const setActiveKey = useCallback(
    (key: Key | null) => {
      activeKeyRef.current = key;
      if (key != null) {
        const idx = itemsRef.current.findIndex((i) => i.key === key);
        activeIndexRef.current = idx >= 0 ? idx : 0;
      } else {
        activeIndexRef.current = -1;
      }
      emit();
    },
    [emit],
  );

  const setQuery = useCallback(
    (query: string, silent?: boolean) => {
      queryRef.current = query;
      if (!silent) emit();
    },
    [emit],
  );

  const setItems = useCallback(
    (items: ProcessedItem[], silent?: boolean) => {
      itemsRef.current = items;
      // Rebuild key→item map for O(1) lookups in getItemState
      const map = new Map<Key, ProcessedItem>();
      for (const item of items) map.set(item.key, item);
      keyToItemMapRef.current = map;
      // Reset active to first non-disabled item when items change
      const firstEnabled = items.findIndex((i) => !i.disabled);
      activeIndexRef.current = firstEnabled >= 0 ? firstEnabled : 0;
      activeKeyRef.current = firstEnabled >= 0 ? items[firstEnabled]!.key : null;
      if (!silent) emit();
    },
    [emit],
  );

  const setLoading = useCallback(
    (loading: boolean, silent?: boolean) => {
      loadingRef.current = loading;
      if (!silent) emit();
    },
    [emit],
  );

  const getItems = useCallback((): readonly ProcessedItem[] => {
    return itemsRef.current;
  }, []);

  const getItemByIndex = useCallback((index: number): ProcessedItem | undefined => {
    return itemsRef.current[index];
  }, []);

  // Stable ref so the store identity never changes across renders.
  // All callbacks below are created with useCallback and have stable deps
  // (only referencing other stable refs/callbacks). Any future changes to
  // these callbacks must preserve stability to avoid stale closures.
  const storeRef = useRef<CommandListStore>({
    subscribe,
    getSnapshot,
    getItemState,
    setActiveIndex,
    setActiveKey,
    setQuery,
    setItems,
    setLoading,
    getItems,
    getItemByIndex,
    emit,
  });

  return storeRef.current;
}
