import { useCallback, useMemo, useRef } from 'react';
import type {
  Key,
  CommandListConfigContextValue,
  CommandListActionsContextValue,
  CommandListStore,
  CommandListRootProps,
  ProcessedItem,
  CommandGroup,
} from '../types';
import { DEFAULT_DENSITY, DEFAULT_PLACEHOLDER } from '../constants';
import { useControllableState } from '../../list/hooks/useControllableState';
import { useCommandListStore } from './useCommandListStore';

interface CommandListStateReturn {
  config: Omit<CommandListConfigContextValue, 'listId'>;
  store: CommandListStore;
  actions: CommandListActionsContextValue;
  groups: CommandGroup[];
}

/**
 * Core state orchestrator for CommandList.Root.
 * Creates the store, wires controlled/uncontrolled query state,
 * processes items (filter/sort/group), and returns context values.
 */
export function useCommandListState<TItem>(
  props: CommandListRootProps<TItem>,
): CommandListStateReturn {
  const {
    items,
    itemKey,
    filterFn,
    sortByScore,
    groupBy,
    groupOrder,
    groupLabel,
    highlights: highlightsProp,
    disabledKeys: disabledKeysProp,
    query: queryProp,
    defaultQuery,
    onQueryChange,
    onAction,
    onDismiss,
    loading = false,
    loopFocus = true,
    density = DEFAULT_DENSITY,
    virtualized = false,
    placeholder = DEFAULT_PLACEHOLDER,
  } = props;

  const disabledKeys = useMemo(
    () => new Set(disabledKeysProp ?? []),
    [disabledKeysProp],
  );

  const store = useCommandListStore();

  // Controlled/uncontrolled query
  const [query, setQuery] = useControllableState<string>(
    queryProp,
    defaultQuery ?? '',
    onQueryChange,
  );

  // Process items: filter → score → sort → wrap into ProcessedItem[]
  const processedItems = useMemo(() => {
    let result: ProcessedItem<TItem>[] = items.map((item) => ({
      key: itemKey(item),
      item,
      groupKey: groupBy?.(item),
      score: undefined as number | undefined,
      highlights: highlightsProp?.get(itemKey(item)),
      disabled: disabledKeys.has(itemKey(item)),
    }));

    // Client-side filtering
    if (filterFn && query) {
      const filtered: ProcessedItem<TItem>[] = [];
      for (const proc of result) {
        const filterResult = filterFn(proc.item, query);
        if (typeof filterResult === 'number') {
          if (filterResult > 0) {
            proc.score = filterResult;
            filtered.push(proc);
          }
        } else if (filterResult) {
          filtered.push(proc);
        }
      }
      result = filtered;
    }

    // Sort by score (descending — higher is better)
    const shouldSort = sortByScore ?? (filterFn != null && query.length > 0);
    if (shouldSort) {
      result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }

    return result;
  }, [items, itemKey, filterFn, sortByScore, query, groupBy, highlightsProp, disabledKeys]);

  // Group items
  const groups = useMemo<CommandGroup<TItem>[]>(() => {
    if (!groupBy) {
      return [{ key: '__default', label: '', items: processedItems }];
    }
    const groupMap = new Map<string, ProcessedItem<TItem>[]>();
    for (const item of processedItems) {
      const gKey = item.groupKey ?? '__ungrouped';
      if (!groupMap.has(gKey)) groupMap.set(gKey, []);
      groupMap.get(gKey)!.push(item);
    }
    const order = groupOrder ?? [...groupMap.keys()];
    return order
      .filter((k) => groupMap.has(k))
      .map((k) => ({
        key: k,
        label: groupLabel?.(k) ?? k,
        items: groupMap.get(k)!,
      }));
  }, [processedItems, groupBy, groupOrder, groupLabel]);

  // Flatten groups into ordered item list for the store
  const flatItems = useMemo<ProcessedItem[]>(() => {
    const result: ProcessedItem[] = [];
    for (const group of groups) {
      for (const item of group.items) {
        result.push(item);
      }
    }
    return result;
  }, [groups]);

  // Sync to store during render (same pattern as TreeList)
  const prevItemsRef = useRef<typeof flatItems | null>(null);
  const prevQueryRef = useRef<typeof query | null>(null);
  const prevLoadingRef = useRef<typeof loading | null>(null);

  if (prevItemsRef.current !== flatItems) {
    prevItemsRef.current = flatItems;
    store.setItems(flatItems);
  }

  if (prevQueryRef.current !== query) {
    prevQueryRef.current = query;
    store.setQuery(query);
  }

  if (prevLoadingRef.current !== loading) {
    prevLoadingRef.current = loading;
    store.setLoading(loading);
  }

  // Stable ref for items lookup in actions
  const itemsMapRef = useRef<Map<Key, TItem>>(new Map());
  const map = new Map<Key, TItem>();
  for (const item of items) {
    map.set(itemKey(item), item);
  }
  itemsMapRef.current = map;

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const invoke = useCallback(
    (key: Key) => {
      const item = itemsMapRef.current.get(key);
      if (item !== undefined) {
        onAction?.(key, item);
      }
    },
    [onAction],
  );

  const moveActive = useCallback(
    (delta: number) => {
      const snapshot = store.getSnapshot();
      const items = store.getItems();
      const len = items.length;
      if (len === 0) return;

      let nextIndex = snapshot.activeIndex + delta;
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= len) nextIndex = len - 1;
      store.setActiveIndex(nextIndex);
    },
    [store],
  );

  const setActiveKeyAction = useCallback(
    (key: Key | null) => {
      store.setActiveKey(key);
    },
    [store],
  );

  const setQueryAction = useCallback(
    (q: string) => {
      setQuery(q);
    },
    [setQuery],
  );

  const dismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  // -----------------------------------------------------------------------
  // Return
  // -----------------------------------------------------------------------

  const config = useMemo(
    () => ({
      virtualized,
      density,
      loopFocus,
      placeholder,
    }),
    [virtualized, density, loopFocus, placeholder],
  );

  const actions = useMemo<CommandListActionsContextValue>(
    () => ({
      invoke,
      moveActive,
      setActiveKey: setActiveKeyAction,
      setQuery: setQueryAction,
      dismiss,
    }),
    [invoke, moveActive, setActiveKeyAction, setQueryAction, dismiss],
  );

  return { config, store, actions, groups };
}
