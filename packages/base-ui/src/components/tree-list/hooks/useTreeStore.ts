import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type {
  Key,
  TreeStore,
  TreeStoreSnapshot,
  TreeItemState,
  TreeNodeMeta,
  FlatNode,
} from '../types';

const EMPTY_TREE_NODES: readonly FlatNode[] = [];
const EMPTY_TREE_META: ReadonlyMap<Key, TreeNodeMeta> = new Map();

/**
 * Creates a lightweight external store for tree state.
 * Items subscribe via useSyncExternalStore to their own key's slice,
 * preventing cascading re-renders when selection/active/expanded state changes.
 */
export function useTreeStore(disabledKeys: Set<Key>): TreeStore {
  const listenersRef = useRef(new Set<() => void>());
  const selectedKeysRef = useRef<Set<Key>>(new Set());
  const activeKeyRef = useRef<Key | null>(null);
  const expandedKeysRef = useRef<Set<Key>>(new Set());
  const loadingKeysRef = useRef<Set<Key>>(new Set());
  const flatNodesRef = useRef<FlatNode[]>([]);
  const flattenedKeysRef = useRef<Key[]>([]);
  const nodeMetaMapRef = useRef(new Map<Key, TreeNodeMeta>());
  const nodeIndexRef = useRef(new Map<Key, number>());
  const itemStatesRef = useRef(new Map<Key, TreeItemState>());
  const localDisabledKeysRef = useRef(new Set<Key>());
  const textValuesRef = useRef(new Map<Key, string>());
  const nonSelectableKeysRef = useRef(new Set<Key>());
  const sourceNonSelectableKeysRef = useRef<ReadonlySet<Key> | undefined>(undefined);
  const disabledKeysRef = useRef(disabledKeys);

  const dirtySetsRef = useRef({
    selected: false,
    disabled: false,
    expanded: false,
    loading: false,
  });
  const snapshotRef = useRef<TreeStoreSnapshot>({
    selectedKeys: new Set(),
    activeKey: null,
    disabledKeys: new Set(disabledKeys),
    expandedKeys: new Set(),
    loadingKeys: new Set(),
    flattenedKeys: [],
    flatNodes: EMPTY_TREE_NODES,
    nodeMetaByKey: EMPTY_TREE_META,
    visibleCount: 0,
  });

  // Preserve immutable slices until their source changes. Focus updates must
  // not copy sets or traverse flattened nodes.
  const rebuildSnapshot = useCallback(() => {
    const previous = snapshotRef.current;
    const dirty = dirtySetsRef.current;
    if (dirty.expanded || dirty.loading) {
      let nextMetadata: Map<Key, TreeNodeMeta> | undefined;
      for (const [key, metadata] of nodeMetaMapRef.current) {
        const index = nodeIndexRef.current.get(key);
        const isExpanded =
          (index === undefined ? undefined : flatNodesRef.current[index]?.filterExpanded) ??
          expandedKeysRef.current.has(key);
        const isLoading = loadingKeysRef.current.has(key);
        if (metadata.isExpanded === isExpanded && metadata.isLoading === isLoading) continue;
        if (!nextMetadata) nextMetadata = new Map(nodeMetaMapRef.current);
        nextMetadata.set(key, { ...metadata, isExpanded, isLoading });
      }
      if (nextMetadata) nodeMetaMapRef.current = nextMetadata;
    }
    snapshotRef.current = {
      selectedKeys: dirty.selected ? new Set(selectedKeysRef.current) : previous.selectedKeys,
      activeKey: activeKeyRef.current,
      disabledKeys: dirty.disabled
        ? new Set([...disabledKeysRef.current, ...localDisabledKeysRef.current])
        : previous.disabledKeys,
      expandedKeys: dirty.expanded ? new Set(expandedKeysRef.current) : previous.expandedKeys,
      loadingKeys: dirty.loading ? new Set(loadingKeysRef.current) : previous.loadingKeys,
      flattenedKeys: flattenedKeysRef.current,
      flatNodes: flatNodesRef.current,
      nodeMetaByKey: nodeMetaMapRef.current,
      visibleCount: flatNodesRef.current.length,
    };
    dirty.selected = false;
    dirty.disabled = false;
    dirty.expanded = false;
    dirty.loading = false;
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

  const getSnapshot = useCallback((): TreeStoreSnapshot => {
    return snapshotRef.current;
  }, []);

  const getNodeIndex = useCallback((key: Key): number => nodeIndexRef.current.get(key) ?? -1, []);
  const isDisabled = useCallback(
    (key: Key): boolean =>
      disabledKeysRef.current.has(key) || localDisabledKeysRef.current.has(key),
    [],
  );

  const getItemState = useCallback((key: Key): TreeItemState => {
    const node = nodeMetaMapRef.current.get(key);
    const index = nodeIndexRef.current.get(key);
    const isSelected = selectedKeysRef.current.has(key);
    const isActive = activeKeyRef.current === key;
    const disabled = disabledKeysRef.current.has(key) || localDisabledKeysRef.current.has(key);
    const isExpanded =
      (index === undefined ? undefined : flatNodesRef.current[index]?.filterExpanded) ??
      expandedKeysRef.current.has(key);
    const isBranch = node?.isBranch ?? false;
    const isLoading = loadingKeysRef.current.has(key);
    const depth = node?.depth ?? 0;
    const previous = itemStatesRef.current.get(key);
    if (
      previous &&
      previous.isSelected === isSelected &&
      previous.isActive === isActive &&
      previous.isDisabled === disabled &&
      previous.isExpanded === isExpanded &&
      previous.isBranch === isBranch &&
      previous.isLoading === isLoading &&
      previous.depth === depth
    )
      return previous;
    const next = {
      isSelected,
      isActive,
      isDisabled: disabled,
      isExpanded,
      isBranch,
      isLoading,
      depth,
    };
    itemStatesRef.current.set(key, next);
    return next;
  }, []);

  const getNodeMeta = useCallback(
    (key: Key): TreeNodeMeta | undefined => snapshotRef.current.nodeMetaByKey.get(key),
    [],
  );

  const getFlatNodes = useCallback((): readonly FlatNode[] => {
    return flatNodesRef.current;
  }, []);

  const registerDisabled = useCallback(
    (key: Key, disabled: boolean) => {
      if (localDisabledKeysRef.current.has(key) === disabled) return;
      if (disabled) localDisabledKeysRef.current.add(key);
      else localDisabledKeysRef.current.delete(key);
      dirtySetsRef.current.disabled = true;
      emit();
    },
    [emit],
  );

  const setSelectedKeys = useCallback(
    (keys: Set<Key>, silent?: boolean) => {
      selectedKeysRef.current = keys;
      dirtySetsRef.current.selected = true;
      if (!silent) emit();
    },
    [emit],
  );

  const setActiveKey = useCallback(
    (key: Key | null, silent?: boolean) => {
      activeKeyRef.current = key;
      if (!silent) emit();
    },
    [emit],
  );

  const setExpandedKeys = useCallback(
    (keys: Set<Key>, silent?: boolean) => {
      expandedKeysRef.current = keys;
      dirtySetsRef.current.expanded = true;
      if (!silent) emit();
    },
    [emit],
  );

  const setLoadingKey = useCallback(
    (key: Key, loading: boolean, silent?: boolean) => {
      if (loading) {
        loadingKeysRef.current.add(key);
      } else {
        loadingKeysRef.current.delete(key);
      }
      dirtySetsRef.current.loading = true;
      if (!silent) emit();
    },
    [emit],
  );

  const setFlatNodes = useCallback(
    (nodes: FlatNode[], silent?: boolean) => {
      flatNodesRef.current = nodes;
      const flattenedKeys: Key[] = [];
      // Rebuild node meta map
      const metaMap = new Map<Key, TreeNodeMeta>();
      const indices = new Map<Key, number>();
      for (const node of nodes) {
        indices.set(node.key, flattenedKeys.length);
        flattenedKeys.push(node.key);
        metaMap.set(node.key, {
          key: node.key,
          depth: node.depth,
          parentKey: node.parentKey,
          isBranch: node.isBranch,
          isExpanded: node.filterExpanded ?? expandedKeysRef.current.has(node.key),
          isLoading: loadingKeysRef.current.has(node.key),
          isLastChild: node.isLastChild,
          ancestorIsLast: node.ancestorIsLast,
          posInSet: node.posInSet,
          setSize: node.setSize,
        });
      }
      nodeMetaMapRef.current = metaMap;
      flattenedKeysRef.current = flattenedKeys;
      nodeIndexRef.current = indices;
      itemStatesRef.current.clear();
      for (const key of localDisabledKeysRef.current) {
        if (!indices.has(key)) {
          localDisabledKeysRef.current.delete(key);
          dirtySetsRef.current.disabled = true;
        }
      }
      if (!silent) emit();
    },
    [emit],
  );

  const registerTextValue = useCallback((key: Key, textValue: string) => {
    textValuesRef.current.set(key, textValue);
  }, []);

  const getTextValue = useCallback((key: Key): string | undefined => {
    return textValuesRef.current.get(key);
  }, []);

  const registerSelectable = useCallback((key: Key, selectable: boolean) => {
    if (selectable) nonSelectableKeysRef.current.delete(key);
    else nonSelectableKeysRef.current.add(key);
  }, []);

  const setSourceNonSelectableKeys = useCallback((keys: ReadonlySet<Key> | undefined) => {
    sourceNonSelectableKeysRef.current = keys;
  }, []);

  const isSelectable = useCallback((key: Key): boolean => {
    return !nonSelectableKeysRef.current.has(key) && !sourceNonSelectableKeysRef.current?.has(key);
  }, []);

  const getRegisteredKeys = useCallback((): Key[] => {
    return flatNodesRef.current.map((n) => n.key);
  }, []);

  // Stable ref so the store identity never changes across renders.
  // All callbacks listed here (subscribe, getSnapshot, getItemState,
  // getNodeMeta, getFlatNodes, setSelectedKeys, setActiveKey,
  // setExpandedKeys, setLoadingKey, setFlatNodes, registerTextValue,
  // getTextValue, getRegisteredKeys) and their shared dependency `emit`
  // must remain referentially stable (empty dependency arrays) — adding
  // changing deps to any of them will silently break useSyncExternalStore
  // consumers that hold the initial store reference.
  const [store] = useState<TreeStore>(() => ({
    subscribe,
    getSnapshot,
    getItemState,
    getNodeMeta,
    getFlatNodes,
    getNodeIndex,
    isDisabled,
    registerDisabled,
    setSelectedKeys,
    setActiveKey,
    setExpandedKeys,
    setLoadingKey,
    setFlatNodes,
    registerTextValue,
    registerSelectable,
    setSourceNonSelectableKeys,
    isSelectable,
    getTextValue,
    getRegisteredKeys,
    emit,
  }));

  useLayoutEffect(() => {
    if (disabledKeysRef.current !== disabledKeys) {
      disabledKeysRef.current = disabledKeys;
      dirtySetsRef.current.disabled = true;
      emit();
    }
  }, [disabledKeys, emit]);

  return store;
}
