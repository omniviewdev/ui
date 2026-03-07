import { useCallback, useMemo, useRef } from 'react';
import type {
  Key,
  ListConfigContextValue,
  ListActionsContextValue,
  ListStore,
  ListRootProps,
} from '../types';
import {
  DEFAULT_SELECTION_MODE,
  DEFAULT_SELECTION_BEHAVIOR,
  DEFAULT_DENSITY,
  DEFAULT_ORIENTATION,
} from '../constants';
import { useControllableState } from './useControllableState';
import { useListStore } from './useListStore';

interface ListStateReturn {
  config: ListConfigContextValue;
  store: ListStore;
  actions: ListActionsContextValue;
}

/**
 * Core state orchestrator for List.Root.
 * Creates the store, wires controlled/uncontrolled state,
 * and returns the three context values.
 */
export function useListState(props: ListRootProps): ListStateReturn {
  const {
    selectionMode = DEFAULT_SELECTION_MODE,
    selectionBehavior = DEFAULT_SELECTION_BEHAVIOR,
    selectedKeys: selectedKeysProp,
    defaultSelectedKeys,
    onSelectedKeysChange,
    activeKey: activeKeyProp,
    defaultActiveKey = null,
    onActiveKeyChange,
    disabledKeys: disabledKeysProp,
    orientation = DEFAULT_ORIENTATION,
    loopFocus = false,
    typeahead: typeaheadEnabled = true,
    density = DEFAULT_DENSITY,
    virtualized = false,
  } = props;

  const disabledKeys = useMemo(
    () => new Set(disabledKeysProp ?? []),
    [disabledKeysProp],
  );

  const store = useListStore(disabledKeys);

  // Controlled/uncontrolled selection
  const [selectedKeys, setSelectedKeys] = useControllableState<Set<Key>>(
    selectedKeysProp,
    new Set(defaultSelectedKeys ?? []),
    onSelectedKeysChange,
  );

  // Controlled/uncontrolled active key
  const [activeKey, setActiveKey] = useControllableState<Key | null>(
    activeKeyProp,
    defaultActiveKey,
    onActiveKeyChange,
  );

  // Sync controlled values into the store
  store.setSelectedKeys(selectedKeys);
  store.setActiveKey(activeKey);

  // Anchor for range selection
  const anchorKeyRef = useRef<Key | null>(null);

  // -----------------------------------------------------------------------
  // Actions (stable identity)
  // -----------------------------------------------------------------------

  const select = useCallback(
    (key: Key) => {
      if (selectionMode === 'none' || disabledKeys.has(key)) return;
      if (selectionMode === 'single') {
        setSelectedKeys(new Set([key]));
        anchorKeyRef.current = key;
      } else {
        setSelectedKeys((prev) => {
          const next = selectionBehavior === 'replace' ? new Set<Key>() : new Set(prev);
          next.add(key);
          return next;
        });
        anchorKeyRef.current = key;
      }
    },
    [selectionMode, selectionBehavior, disabledKeys, setSelectedKeys],
  );

  const deselect = useCallback(
    (key: Key) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [setSelectedKeys],
  );

  const toggle = useCallback(
    (key: Key) => {
      if (selectionMode === 'none' || disabledKeys.has(key)) return;
      if (selectionMode === 'single') {
        setSelectedKeys((prev) => (prev.has(key) ? new Set() : new Set([key])));
        anchorKeyRef.current = key;
      } else {
        setSelectedKeys((prev) => {
          const next = new Set(prev);
          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }
          return next;
        });
        anchorKeyRef.current = key;
      }
    },
    [selectionMode, disabledKeys, setSelectedKeys],
  );

  const selectRange = useCallback(
    (toKey: Key) => {
      if (selectionMode !== 'multiple') return;
      const keys = store.getRegisteredKeys();
      const anchor = anchorKeyRef.current;
      const fromIndex = anchor != null ? keys.indexOf(anchor) : 0;
      const toIndex = keys.indexOf(toKey);
      if (fromIndex === -1 || toIndex === -1) return;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeKeys = keys
        .slice(start, end + 1)
        .filter((k) => !disabledKeys.has(k));

      setSelectedKeys(new Set(rangeKeys));
    },
    [selectionMode, disabledKeys, store, setSelectedKeys],
  );

  const selectAll = useCallback(() => {
    if (selectionMode !== 'multiple') return;
    const keys = store.getRegisteredKeys().filter((k) => !disabledKeys.has(k));
    setSelectedKeys(new Set(keys));
  }, [selectionMode, disabledKeys, store, setSelectedKeys]);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
    anchorKeyRef.current = null;
  }, [setSelectedKeys]);

  const setActiveKeyAction = useCallback(
    (key: Key | null) => {
      setActiveKey(key);
    },
    [setActiveKey],
  );

  const registerItem = useCallback(
    (key: Key, textValue?: string) => {
      return store.registerItem(key, textValue);
    },
    [store],
  );

  // -----------------------------------------------------------------------
  // Return
  // -----------------------------------------------------------------------

  const config = useMemo<ListConfigContextValue>(
    () => ({
      selectionMode,
      selectionBehavior,
      density,
      orientation,
      typeahead: typeaheadEnabled,
      loopFocus,
      virtualized,
    }),
    [selectionMode, selectionBehavior, density, orientation, typeaheadEnabled, loopFocus, virtualized],
  );

  const actions = useMemo<ListActionsContextValue>(
    () => ({
      select,
      deselect,
      toggle,
      selectRange,
      selectAll,
      clearSelection,
      setActiveKey: setActiveKeyAction,
      registerItem,
    }),
    [select, deselect, toggle, selectRange, selectAll, clearSelection, setActiveKeyAction, registerItem],
  );

  return { config, store, actions };
}
