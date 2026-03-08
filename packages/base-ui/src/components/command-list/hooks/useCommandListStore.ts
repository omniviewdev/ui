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

  const emit = useCallback(() => {
    versionRef.current += 1;
    snapshotRef.current = {
      activeIndex: activeIndexRef.current,
      activeKey: activeKeyRef.current,
      query: queryRef.current,
      visibleCount: itemsRef.current.length,
      loading: loadingRef.current,
    };
    for (const l of listenersRef.current) l();
  }, []);

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
      isDisabled: itemsRef.current.find((i) => i.key === key)?.disabled ?? false,
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
      }
      emit();
    },
    [emit],
  );

  const setQuery = useCallback(
    (query: string) => {
      queryRef.current = query;
      emit();
    },
    [emit],
  );

  const setItems = useCallback(
    (items: ProcessedItem[]) => {
      itemsRef.current = items;
      // Reset active to first non-disabled item when items change
      const firstEnabled = items.findIndex((i) => !i.disabled);
      activeIndexRef.current = firstEnabled >= 0 ? firstEnabled : 0;
      activeKeyRef.current = firstEnabled >= 0 ? items[firstEnabled]!.key : null;
      emit();
    },
    [emit],
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      loadingRef.current = loading;
      emit();
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
  });

  return storeRef.current;
}
