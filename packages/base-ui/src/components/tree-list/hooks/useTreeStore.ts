import { useCallback, useRef } from 'react';
import type { Key, TreeStore, TreeStoreSnapshot, TreeItemState, TreeNodeMeta, FlatNode } from '../types';

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
  const nodeMetaMapRef = useRef(new Map<Key, TreeNodeMeta>());
  const textValuesRef = useRef(new Map<Key, string>());
  const disabledKeysRef = useRef(disabledKeys);

  const versionRef = useRef(0);
  const snapshotRef = useRef<TreeStoreSnapshot>({
    selectedKeys: new Set(),
    activeKey: null,
    disabledKeys: new Set(),
    expandedKeys: new Set(),
    loadingKeys: new Set(),
    flattenedKeys: [],
    visibleCount: 0,
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
    const flatNodes = flatNodesRef.current;
    snapshotRef.current = {
      selectedKeys: new Set(selectedKeysRef.current),
      activeKey: activeKeyRef.current,
      disabledKeys: new Set(disabledKeysRef.current),
      expandedKeys: new Set(expandedKeysRef.current),
      loadingKeys: new Set(loadingKeysRef.current),
      flattenedKeys: flatNodes.map((n) => n.key),
      visibleCount: flatNodes.length,
    };
    for (const l of listenersRef.current) l();
  }, []);

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
    return nodeMetaMapRef.current.get(key);
  }, []);

  const getFlatNodes = useCallback((): readonly FlatNode[] => {
    return flatNodesRef.current;
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

  const setExpandedKeys = useCallback(
    (keys: Set<Key>) => {
      expandedKeysRef.current = keys;
      emit();
    },
    [emit],
  );

  const setLoadingKey = useCallback(
    (key: Key, loading: boolean) => {
      if (loading) {
        loadingKeysRef.current.add(key);
      } else {
        loadingKeysRef.current.delete(key);
      }
      emit();
    },
    [emit],
  );

  const setFlatNodes = useCallback(
    (nodes: FlatNode[]) => {
      flatNodesRef.current = nodes;
      // Rebuild node meta map
      const metaMap = new Map<Key, TreeNodeMeta>();
      for (const node of nodes) {
        metaMap.set(node.key, {
          key: node.key,
          depth: node.depth,
          parentKey: node.parentKey,
          isBranch: node.isBranch,
          isExpanded: expandedKeysRef.current.has(node.key),
          isLoading: loadingKeysRef.current.has(node.key),
          isLastChild: node.isLastChild,
          ancestorIsLast: node.ancestorIsLast,
        });
      }
      nodeMetaMapRef.current = metaMap;
      emit();
    },
    [emit],
  );

  const registerTextValue = useCallback((key: Key, textValue: string) => {
    textValuesRef.current.set(key, textValue);
  }, []);

  const getTextValue = useCallback((key: Key): string | undefined => {
    return textValuesRef.current.get(key);
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
  const storeRef = useRef<TreeStore>({
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
    getTextValue,
    getRegisteredKeys,
  });

  return storeRef.current;
}
