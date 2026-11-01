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
  const textValuesRef = useRef(new Map<Key, string>());
  const nonSelectableKeysRef = useRef(new Set<Key>());
  const sourceNonSelectableKeysRef = useRef<ReadonlySet<Key> | undefined>(undefined);
  const disabledKeysRef = useRef(disabledKeys);

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

  // Internal: rebuild the snapshot object from current refs.
  const rebuildSnapshot = useCallback(() => {
    const flatNodes = flatNodesRef.current;
    snapshotRef.current = {
      selectedKeys: new Set(selectedKeysRef.current),
      activeKey: activeKeyRef.current,
      disabledKeys: new Set(disabledKeysRef.current),
      expandedKeys: new Set(expandedKeysRef.current),
      loadingKeys: new Set(loadingKeysRef.current),
      flattenedKeys: flattenedKeysRef.current,
      flatNodes,
      nodeMetaByKey: nodeMetaMapRef.current,
      visibleCount: flatNodes.length,
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

  const getSnapshot = useCallback((): TreeStoreSnapshot => {
    return snapshotRef.current;
  }, []);

  const getItemState = useCallback((key: Key): TreeItemState => {
    const node = nodeMetaMapRef.current.get(key);
    return {
      isSelected: selectedKeysRef.current.has(key),
      isActive: activeKeyRef.current === key,
      isDisabled: disabledKeysRef.current.has(key),
      isExpanded: expandedKeysRef.current.has(key),
      isBranch: node?.isBranch ?? false,
      isLoading: loadingKeysRef.current.has(key),
      depth: node?.depth ?? 0,
    };
  }, []);

  const getNodeMeta = useCallback((key: Key): TreeNodeMeta | undefined => {
    const cached = nodeMetaMapRef.current.get(key);
    if (!cached) return undefined;
    // Derive volatile flags from live refs so callers never see stale state
    return {
      ...cached,
      isExpanded: expandedKeysRef.current.has(key),
      isLoading: loadingKeysRef.current.has(key),
    };
  }, []);

  const getFlatNodes = useCallback((): readonly FlatNode[] => {
    return flatNodesRef.current;
  }, []);

  const setSelectedKeys = useCallback(
    (keys: Set<Key>, silent?: boolean) => {
      selectedKeysRef.current = keys;
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
      if (!silent) emit();
    },
    [emit],
  );

  const setFlatNodes = useCallback(
    (nodes: FlatNode[], silent?: boolean) => {
      flatNodesRef.current = nodes;
      flattenedKeysRef.current = nodes.map((node) => node.key);
      // Rebuild node meta map
      const metaMap = new Map<Key, TreeNodeMeta>();
      const siblingCounts = new Map<Key | null, number>();
      const siblingPositions = new Map<Key | null, number>();
      for (const node of nodes) {
        siblingCounts.set(node.parentKey, (siblingCounts.get(node.parentKey) ?? 0) + 1);
      }
      for (const node of nodes) {
        const position = (siblingPositions.get(node.parentKey) ?? 0) + 1;
        siblingPositions.set(node.parentKey, position);
        metaMap.set(node.key, {
          key: node.key,
          depth: node.depth,
          parentKey: node.parentKey,
          isBranch: node.isBranch,
          isExpanded: expandedKeysRef.current.has(node.key),
          isLoading: loadingKeysRef.current.has(node.key),
          isLastChild: node.isLastChild,
          ancestorIsLast: node.ancestorIsLast,
          posInSet: position,
          setSize: siblingCounts.get(node.parentKey),
        });
      }
      nodeMetaMapRef.current = metaMap;
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
      emit();
    }
  }, [disabledKeys, emit]);

  return store;
}
