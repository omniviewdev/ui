import { useCallback, useMemo, useRef } from 'react';
import type {
  Key,
  TreeConfigContextValue,
  TreeActionsContextValue,
  TreeStore,
  TreeListRootProps,
} from '../types';
import {
  DEFAULT_SELECTION_MODE,
  DEFAULT_SELECTION_BEHAVIOR,
  DEFAULT_DENSITY,
  DEFAULT_INDENTATION,
} from '../constants';
import { useControllableState } from '../../list/hooks/useControllableState';
import { useTreeStore } from './useTreeStore';
import { useTreeFlattener } from './useTreeFlattener';

interface TreeStateReturn {
  config: Omit<TreeConfigContextValue, 'listId'>;
  store: TreeStore;
  actions: TreeActionsContextValue;
}

/**
 * Core state orchestrator for TreeList.Root.
 * Creates the store, wires controlled/uncontrolled state,
 * runs the DFS flattener, and returns the three context values.
 */
export function useTreeState<TItem>(props: TreeListRootProps<TItem>): TreeStateReturn {
  const {
    items,
    itemKey,
    getChildren,
    isBranch: isBranchProp,
    getTextValue,
    loadChildren,
    selectionMode = DEFAULT_SELECTION_MODE,
    selectionBehavior = DEFAULT_SELECTION_BEHAVIOR,
    selectedKeys: selectedKeysProp,
    defaultSelectedKeys,
    onSelectedKeysChange,
    activeKey: activeKeyProp,
    defaultActiveKey = null,
    onActiveKeyChange,
    disabledKeys: disabledKeysProp,
    expandedKeys: expandedKeysProp,
    defaultExpandedKeys,
    onExpandedKeysChange,
    loopFocus = false,
    typeahead: typeaheadEnabled = true,
    density = DEFAULT_DENSITY,
    virtualized = false,
    indentation = DEFAULT_INDENTATION,
    showBranchConnectors = false,
    filterText: filterTextProp,
    defaultFilterText,
    onFilterTextChange,
    filterFn: filterFnProp,
    onLoadError,
  } = props;

  const disabledKeys = useMemo(
    () => new Set(disabledKeysProp ?? []),
    [disabledKeysProp],
  );

  // Fallback isBranch: check if getChildren returns non-empty
  const isBranch = useCallback(
    (item: TItem): boolean => {
      if (isBranchProp) return isBranchProp(item);
      const children = getChildren(item);
      return children !== undefined && children !== null;
    },
    [isBranchProp, getChildren],
  );

  const store = useTreeStore(disabledKeys);

  // Controlled/uncontrolled selection
  const [selectedKeys, setSelectedKeys] = useControllableState<Set<Key>>(
    selectedKeysProp as Set<Key> | undefined,
    new Set(defaultSelectedKeys ?? []),
    onSelectedKeysChange as ((keys: Set<Key>) => void) | undefined,
  );

  // Controlled/uncontrolled active key
  const [activeKey, setActiveKey] = useControllableState<Key | null>(
    activeKeyProp,
    defaultActiveKey,
    onActiveKeyChange,
  );

  // Controlled/uncontrolled expanded keys
  const [expandedKeys, setExpandedKeys] = useControllableState<Set<Key>>(
    expandedKeysProp as Set<Key> | undefined,
    new Set(defaultExpandedKeys ?? []),
    onExpandedKeysChange as ((keys: Set<Key>) => void) | undefined,
  );

  // Controlled/uncontrolled filter text
  const [filterText] = useControllableState<string>(
    filterTextProp,
    defaultFilterText ?? '',
    onFilterTextChange,
  );

  // Build the resolved filter function — stable reference via useMemo
  const resolvedFilterFn = useMemo(() => {
    if (filterFnProp) return filterFnProp;
    if (!getTextValue) return undefined;
    return (item: TItem, text: string) => {
      const value = getTextValue(item);
      return value ? value.toLowerCase().includes(text.toLowerCase()) : false;
    };
  }, [filterFnProp, getTextValue]);

  // Flatten tree (with optional filtering)
  const flatNodes = useTreeFlattener(
    items, itemKey, getChildren, isBranch, expandedKeys,
    filterText, resolvedFilterFn,
  );

  // Sync state to store synchronously during render so that
  // the Viewport's useSyncExternalStore sees the data on the first render pass.
  // This mirrors how the List store syncs disabledKeys in its render body.
  const prevFlatNodesRef = useRef<typeof flatNodes | null>(null);
  const prevExpandedKeysRef = useRef<typeof expandedKeys | null>(null);
  const prevSelectedKeysRef = useRef<typeof selectedKeys | null>(null);
  const prevActiveKeyRef = useRef<typeof activeKey | undefined>(undefined);

  if (prevExpandedKeysRef.current !== expandedKeys) {
    prevExpandedKeysRef.current = expandedKeys;
    store.setExpandedKeys(expandedKeys);
  }

  if (prevFlatNodesRef.current !== flatNodes) {
    prevFlatNodesRef.current = flatNodes;
    store.setFlatNodes(flatNodes);
    if (getTextValue) {
      for (const node of flatNodes) {
        const text = getTextValue(node.item as TItem);
        if (text) store.registerTextValue(node.key, text);
      }
    }
  }

  if (prevSelectedKeysRef.current !== selectedKeys) {
    prevSelectedKeysRef.current = selectedKeys;
    store.setSelectedKeys(selectedKeys);
  }

  if (prevActiveKeyRef.current !== activeKey) {
    prevActiveKeyRef.current = activeKey;
    store.setActiveKey(activeKey);
  }

  // Anchor for range selection
  const anchorKeyRef = useRef<Key | null>(null);

  // -----------------------------------------------------------------------
  // Selection actions (same pattern as List)
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

  // -----------------------------------------------------------------------
  // Tree expansion actions
  // -----------------------------------------------------------------------

  const expand = useCallback(
    (key: Key) => {
      const flatNode = flatNodes.find((n) => n.key === key);
      if (!flatNode) return;

      const item = flatNode.item as TItem;
      const children = getChildren(item);
      // undefined = children not yet loaded; [] = loaded but empty.
      // Only trigger loadChildren when children are truly unknown.
      const notYetLoaded = children === undefined || children === null;

      if (loadChildren && isBranch(item) && notYetLoaded) {
        // Guard against duplicate concurrent loads
        if (store.getSnapshot().loadingKeys.has(key)) return;
        store.setLoadingKey(key, true);
        loadChildren(key, item).then(
          () => {
            store.setLoadingKey(key, false);
            setExpandedKeys((prev) => {
              const next = new Set(prev);
              next.add(key);
              return next;
            });
          },
          (err) => {
            store.setLoadingKey(key, false);
            onLoadError?.(err, key, item);
          },
        );
      } else {
        setExpandedKeys((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    },
    [flatNodes, getChildren, isBranch, loadChildren, onLoadError, store, setExpandedKeys],
  );

  const collapse = useCallback(
    (key: Key) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [setExpandedKeys],
  );

  const toggleExpanded = useCallback(
    (key: Key) => {
      if (expandedKeys.has(key)) {
        collapse(key);
      } else {
        expand(key);
      }
    },
    [expandedKeys, expand, collapse],
  );

  // NOTE: expandAll performs a synchronous full-tree traversal. For trees
  // with 10k+ nodes this may cause a noticeable frame drop. Prefer
  // expandAllAsync for very large datasets.
  const expandAll = useCallback(() => {
    const allBranchKeys = new Set<Key>();
    function walk(siblings: readonly TItem[]) {
      for (const item of siblings) {
        if (isBranch(item)) {
          allBranchKeys.add(itemKey(item));
          const children = getChildren(item);
          if (children) walk(children);
        }
      }
    }
    walk(items);
    setExpandedKeys(allBranchKeys);
  }, [items, itemKey, getChildren, isBranch, setExpandedKeys]);

  const expandAllAsync = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const allBranchKeys = new Set<Key>();
        const stack: (readonly TItem[])[] = [items];
        function chunk() {
          const deadline = performance.now() + 4; // ~4ms budget per frame
          while (stack.length > 0 && performance.now() < deadline) {
            const siblings = stack.pop()!;
            for (const item of siblings) {
              if (isBranch(item)) {
                allBranchKeys.add(itemKey(item));
                const children = getChildren(item);
                if (children && children.length > 0) stack.push(children);
              }
            }
          }
          if (stack.length > 0) {
            setTimeout(chunk, 0);
          } else {
            setExpandedKeys(allBranchKeys);
            resolve();
          }
        }
        chunk();
      }),
    [items, itemKey, getChildren, isBranch, setExpandedKeys],
  );

  const collapseAll = useCallback(() => {
    setExpandedKeys(new Set());
  }, [setExpandedKeys]);

  // -----------------------------------------------------------------------
  // Return
  // -----------------------------------------------------------------------

  const config = useMemo(
    () => ({
      selectionMode,
      selectionBehavior,
      density,
      typeahead: typeaheadEnabled,
      loopFocus,
      virtualized,
      indentation,
      showBranchConnectors,
    }),
    [selectionMode, selectionBehavior, density, typeaheadEnabled, loopFocus, virtualized, indentation, showBranchConnectors],
  );

  const actions = useMemo<TreeActionsContextValue>(
    () => ({
      select,
      deselect,
      toggle,
      selectRange,
      selectAll,
      clearSelection,
      setActiveKey: setActiveKeyAction,
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      expandAllAsync,
      collapseAll,
    }),
    [select, deselect, toggle, selectRange, selectAll, clearSelection, setActiveKeyAction, expand, collapse, toggleExpanded, expandAll, expandAllAsync, collapseAll],
  );

  return { config, store, actions };
}
