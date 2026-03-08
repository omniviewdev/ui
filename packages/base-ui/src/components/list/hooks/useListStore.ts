import { useCallback, useRef } from 'react';
import type { Key, ListStore, ListStoreSnapshot, ItemState } from '../types';

/**
 * Creates a lightweight external store for list state.
 * Items subscribe via useSyncExternalStore to their own key's slice,
 * preventing cascading re-renders when selection/active state changes.
 */
export function useListStore(disabledKeys: Set<Key>): ListStore {
  const listenersRef = useRef(new Set<() => void>());
  const selectedKeysRef = useRef<Set<Key>>(new Set());
  const activeKeyRef = useRef<Key | null>(null);
  const registeredKeysRef = useRef<Key[]>([]);
  const textValuesRef = useRef(new Map<Key, string>());
  const disabledKeysRef = useRef(disabledKeys);

  // Snapshot version counter for useSyncExternalStore identity checks
  const versionRef = useRef(0);
  const snapshotRef = useRef<ListStoreSnapshot>({
    selectedKeys: new Set(),
    activeKey: null,
    disabledKeys: new Set(),
    registeredKeys: [],
  });

  // Sync disabledKeys into refs and snapshot when they change
  if (disabledKeysRef.current !== disabledKeys) {
    disabledKeysRef.current = disabledKeys;
    snapshotRef.current = {
      ...snapshotRef.current,
      disabledKeys: new Set(disabledKeys),
    };
    versionRef.current += 1;
  }

  const emit = useCallback(() => {
    versionRef.current += 1;
    snapshotRef.current = {
      selectedKeys: new Set(selectedKeysRef.current),
      activeKey: activeKeyRef.current,
      disabledKeys: new Set(disabledKeysRef.current),
      registeredKeys: [...registeredKeysRef.current],
    };
    listenersRef.current.forEach((l) => l());
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback((): ListStoreSnapshot => {
    return snapshotRef.current;
  }, []);

  const getItemState = useCallback((key: Key): ItemState => {
    return {
      isSelected: selectedKeysRef.current.has(key),
      isActive: activeKeyRef.current === key,
      isDisabled: disabledKeysRef.current.has(key),
    };
  }, []);

  const setSelectedKeys = useCallback(
    (keys: Set<Key>) => {
      selectedKeysRef.current = keys;
      emit();
    },
    [emit],
  );

  const setActiveKey = useCallback(
    (key: Key | null) => {
      activeKeyRef.current = key;
      emit();
    },
    [emit],
  );

  const registerItem = useCallback(
    (key: Key, textValue?: string) => {
      registeredKeysRef.current = [...registeredKeysRef.current, key];
      if (textValue !== undefined) {
        textValuesRef.current.set(key, textValue);
      }
      emit();
      return () => {
        registeredKeysRef.current = registeredKeysRef.current.filter((k) => k !== key);
        textValuesRef.current.delete(key);
        emit();
      };
    },
    [emit],
  );

  const getRegisteredKeys = useCallback((): Key[] => {
    return registeredKeysRef.current;
  }, []);

  const getTextValue = useCallback((key: Key): string | undefined => {
    return textValuesRef.current.get(key);
  }, []);

  // Stable ref so the store identity never changes
  const storeRef = useRef<ListStore>({
    subscribe,
    getSnapshot,
    getItemState,
    setSelectedKeys,
    setActiveKey,
    registerItem,
    getRegisteredKeys,
    getTextValue,
  });

  return storeRef.current;
}
