import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
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

export interface TreeStateReturn<TItem> {
  config: Omit<TreeConfigContextValue, 'listId'>;
  store: TreeStore;
  actions: TreeActionsContextValue;
  activeKey: Key | null;
  expandedKeys: Set<Key>;
  filterText: string;
  filterFn: TreeListRootProps<TItem>['filterFn'];
  isBranch: (item: TItem) => boolean;
}

/**
 * Core state orchestrator for TreeList.Root.
 * Creates the store, wires controlled/uncontrolled state,
 * returns persistent state independently of optional ordering and DnD.
 */
export function useTreeState<TItem>(props: TreeListRootProps<TItem>): TreeStateReturn<TItem> {
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
    onAction,
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
    overscan,
    estimatedItemSize,
    indentation = DEFAULT_INDENTATION,
    indentGuide = 'none',
    filterText: filterTextProp,
    defaultFilterText,
    onFilterTextChange,
    filterFn: filterFnProp,
    onLoadError,
  } = props;
  const onActionRef = useRef(onAction);
  useLayoutEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  const disabledKeys = useMemo(() => new Set(disabledKeysProp ?? []), [disabledKeysProp]);

  // Fallback isBranch: check if getChildren returns non-empty
  const isBranch = useCallback(
    (item: TItem): boolean => {
      if (isBranchProp) return isBranchProp(item);
      const children = getChildren(item);
      return children != null && children.length > 0;
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

  // Commit only changed slices before the batched notification. In particular,
  // focus changes must not mark unchanged selection/expansion sets dirty.
  useLayoutEffect(() => {
    store.setExpandedKeys(expandedKeys, true);
  }, [expandedKeys, store]);
  useLayoutEffect(() => {
    store.setSelectedKeys(selectedKeys, true);
  }, [selectedKeys, store]);
  useLayoutEffect(() => {
    store.setActiveKey(activeKey, true);
  }, [activeKey, store]);
  useLayoutEffect(() => {
    store.emit();
  }, [expandedKeys, selectedKeys, activeKey, store]);

  // Anchor for range selection
  const anchorKeyRef = useRef<Key | null>(null);

  // -----------------------------------------------------------------------
  // Selection actions (same pattern as List)
  // -----------------------------------------------------------------------

  const select = useCallback(
    (key: Key) => {
      if (selectionMode === 'none' || store.isDisabled(key) || !store.isSelectable(key)) return;
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
    [selectionMode, selectionBehavior, store, setSelectedKeys],
  );

  const deselect = useCallback(
    (key: Key) => {
      if (store.isDisabled(key)) return;
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [setSelectedKeys, store],
  );

  const toggle = useCallback(
    (key: Key) => {
      if (selectionMode === 'none' || store.isDisabled(key) || !store.isSelectable(key)) return;
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
    [selectionMode, store, setSelectedKeys],
  );

  const selectRange = useCallback(
    (toKey: Key) => {
      if (selectionMode !== 'multiple' || store.isDisabled(toKey)) return;
      const keys = store.getRegisteredKeys();
      const anchor = anchorKeyRef.current;
      const fromIndex = anchor != null ? store.getNodeIndex(anchor) : 0;
      const toIndex = store.getNodeIndex(toKey);
      if (fromIndex === -1 || toIndex === -1) return;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeKeys = keys
        .slice(start, end + 1)
        .filter((k) => !store.isDisabled(k) && store.isSelectable(k));

      setSelectedKeys(new Set(rangeKeys));
    },
    [selectionMode, store, setSelectedKeys],
  );

  const selectAll = useCallback(() => {
    if (selectionMode !== 'multiple') return;
    const keys = store
      .getRegisteredKeys()
      .filter((k) => !store.isDisabled(k) && store.isSelectable(k));
    setSelectedKeys(new Set(keys));
  }, [selectionMode, store, setSelectedKeys]);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
    anchorKeyRef.current = null;
  }, [setSelectedKeys]);

  const setActiveKeyAction = useCallback(
    (key: Key | null) => {
      if (key != null && store.isDisabled(key)) return;
      setActiveKey(key);
    },
    [setActiveKey, store],
  );

  const activate = useCallback(
    (key: Key) => {
      if (store.getNodeIndex(key) !== -1 && !store.isDisabled(key)) onActionRef.current?.(key);
    },
    [store],
  );

  // -----------------------------------------------------------------------
  // Tree expansion actions
  // -----------------------------------------------------------------------

  const loadBranch = useCallback(
    (key: Key, item: TItem) => {
      if (!loadChildren || store.getSnapshot().loadingKeys.has(key)) return;
      store.setLoadingKey(key, true);
      loadChildren(key, item).then(
        () => {
          const disabled = store.isDisabled(key);
          store.setLoadingKey(key, false, !disabled);
          if (disabled) return;
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
    },
    [loadChildren, onLoadError, store, setExpandedKeys],
  );

  const expand = useCallback(
    (key: Key) => {
      if (store.isDisabled(key)) return;
      const flatNode = store.getFlatNodes()[store.getNodeIndex(key)];
      if (!flatNode?.isBranch) return;

      const item = flatNode.item as TItem;
      // Unknown children load lazily; an empty array is already loaded.
      if (loadChildren && getChildren(item) == null) {
        loadBranch(key, item);
      } else {
        setExpandedKeys((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    },
    [getChildren, loadChildren, loadBranch, store, setExpandedKeys],
  );

  const expandSiblings = useCallback(
    (key: Key) => {
      if (store.isDisabled(key)) return;
      const activeMeta = store.getNodeMeta(key);
      if (!activeMeta) return;
      const loadedKeys: Key[] = [];
      for (const node of store.getFlatNodes()) {
        if (
          node.parentKey !== activeMeta.parentKey ||
          node.depth !== activeMeta.depth ||
          !node.isBranch ||
          store.isDisabled(node.key)
        ) {
          continue;
        }
        const item = node.item as TItem;
        if (loadChildren && getChildren(item) == null) {
          loadBranch(node.key, item);
        } else {
          loadedKeys.push(node.key);
        }
      }
      if (loadedKeys.length === 0) return;
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        for (const siblingKey of loadedKeys) next.add(siblingKey);
        return next;
      });
    },
    [getChildren, loadChildren, loadBranch, store, setExpandedKeys],
  );

  const collapse = useCallback(
    (key: Key) => {
      if (store.isDisabled(key)) return;
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [setExpandedKeys, store],
  );

  const toggleExpanded = useCallback(
    (key: Key) => {
      if (store.isDisabled(key)) return;
      if (expandedKeys.has(key)) {
        collapse(key);
      } else {
        expand(key);
      }
    },
    [expandedKeys, expand, collapse, store],
  );

  // NOTE: expandAll performs a synchronous full-tree traversal. For trees
  // with 10k+ nodes this may cause a noticeable frame drop. Prefer
  // expandAllAsync for very large datasets.
  const expandAll = useCallback(() => {
    const allBranchKeys = new Set([...expandedKeys].filter((key) => store.isDisabled(key)));
    function walk(siblings: readonly TItem[]) {
      for (const item of siblings) {
        if (isBranch(item)) {
          const key = itemKey(item);
          if (!store.isDisabled(key)) allBranchKeys.add(key);
          const children = getChildren(item);
          if (children) walk(children);
        }
      }
    }
    walk(items);
    setExpandedKeys(allBranchKeys);
  }, [items, itemKey, getChildren, isBranch, expandedKeys, store, setExpandedKeys]);

  const expandAllAsync = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const allBranchKeys = new Set([...expandedKeys].filter((key) => store.isDisabled(key)));
        const stack: (readonly TItem[])[] = [items];
        function chunk() {
          const deadline = performance.now() + 4; // ~4ms budget per frame
          while (stack.length > 0 && performance.now() < deadline) {
            const siblings = stack.pop()!;
            for (const item of siblings) {
              if (isBranch(item)) {
                const key = itemKey(item);
                if (!store.isDisabled(key)) allBranchKeys.add(key);
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
    [items, itemKey, getChildren, isBranch, expandedKeys, store, setExpandedKeys],
  );

  const collapseAll = useCallback(() => {
    setExpandedKeys((prev) => new Set([...prev].filter((key) => store.isDisabled(key))));
  }, [setExpandedKeys, store]);

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
      overscan,
      estimatedItemSize,
      indentation,
      indentGuide,
    }),
    [
      selectionMode,
      selectionBehavior,
      density,
      typeaheadEnabled,
      loopFocus,
      virtualized,
      overscan,
      estimatedItemSize,
      indentation,
      indentGuide,
    ],
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
      activate,
      expand,
      expandSiblings,
      collapse,
      toggleExpanded,
      expandAll,
      expandAllAsync,
      collapseAll,
    }),
    [
      select,
      deselect,
      toggle,
      selectRange,
      selectAll,
      clearSelection,
      setActiveKeyAction,
      activate,
      expand,
      expandSiblings,
      collapse,
      toggleExpanded,
      expandAll,
      expandAllAsync,
      collapseAll,
    ],
  );

  return {
    config,
    store,
    actions,
    activeKey,
    expandedKeys,
    filterText,
    filterFn: resolvedFilterFn,
    isBranch,
  };
}
