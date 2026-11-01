import { useMemo } from 'react';
import type { Key, FlatNode, TreeOrder } from '../types';
import { applySiblingOrder } from '../order';

/**
 * Pure DFS computation: items + expandedKeys → FlatNode[].
 *
 * When `filterText` is non-empty and a `filterFn` is provided, runs a
 * two-phase DFS inside a single useMemo:
 *
 *   Phase 1 — Mark: post-order DFS over the *entire* tree to build a Set<Key>
 *   of nodes that either match the filter or have matching descendants.
 *   O(total nodes), runs only when filter is active.
 *
 *   Phase 2 — Flatten: DFS over marked nodes only, auto-expanding all
 *   branches so matches are always visible. O(matching subtree).
 *
 * When filterText is empty the fast path runs: standard DFS that skips
 * children of collapsed branches. O(visible nodes). Zero overhead.
 */
export function useTreeFlattener<TItem>(
  items: readonly TItem[],
  itemKey: (item: TItem) => Key,
  getChildren: (item: TItem) => readonly TItem[] | undefined,
  isBranch: (item: TItem) => boolean,
  expandedKeys: ReadonlySet<Key>,
  filterText: string,
  filterFn: ((item: TItem, filterText: string) => boolean) | undefined,
  order?: TreeOrder,
): FlatNode<TItem>[] {
  return useMemo(() => {
    const result: FlatNode<TItem>[] = [];
    function resolveOrderedSiblings(
      siblings: readonly TItem[],
      parentKey: Key | null,
    ): readonly TItem[] {
      if (!order!.has(parentKey)) return siblings;
      return applySiblingOrder(siblings, parentKey, order!, itemKey);
    }

    const isFiltering = filterText.length > 0 && filterFn !== undefined;

    // ------------------------------------------------------------------
    // Filtered path: two-phase DFS
    // ------------------------------------------------------------------
    if (isFiltering) {
      // Phase 1: mark matching subtrees
      const matchSet = new Set<Key>();
      const matchFn = filterFn!;

      function markMatches(siblings: readonly TItem[]): boolean {
        let anyMatch = false;
        for (const item of siblings) {
          const key = itemKey(item);
          const selfMatches = matchFn(item, filterText);
          let descendantMatches = false;

          const children = getChildren(item);
          if (children && children.length > 0) {
            descendantMatches = markMatches(children);
          }

          if (selfMatches || descendantMatches) {
            matchSet.add(key);
            anyMatch = true;
          }
        }
        return anyMatch;
      }
      markMatches(items);

      // Phase 2: flatten only matched nodes, auto-expanding branches
      function walkFiltered(
        siblings: readonly TItem[],
        depth: number,
        parentKey: Key | null,
        ancestorIsLast: boolean[],
      ) {
        // Pre-filter to only matching siblings so isLastChild is correct
        const visible: TItem[] = [];
        for (const item of siblings) {
          if (matchSet.has(itemKey(item))) {
            visible.push(item);
          }
        }

        for (let i = 0; i < visible.length; i++) {
          const item = visible[i]!;
          const key = itemKey(item);
          const isLast = i === visible.length - 1;
          const branch = isBranch(item);

          const node: FlatNode<TItem> = {
            key,
            item,
            depth,
            parentKey,
            isBranch: branch,
            posInSet: i + 1,
            setSize: visible.length,
            isLastChild: isLast,
            ancestorIsLast: [...ancestorIsLast],
          };
          result.push(node);

          // Auto-expand: always recurse into branches when filtering
          if (branch) {
            const childStart = result.length;
            const children = getChildren(item);
            if (children && children.length > 0) {
              walkFiltered(children, depth + 1, key, [...ancestorIsLast, isLast]);
            }
            node.filterExpanded = result.length > childStart;
          }
        }
      }

      function walkFilteredOrdered(
        siblings: readonly TItem[],
        depth: number,
        parentKey: Key | null,
        ancestorIsLast: boolean[],
      ) {
        const orderedSiblings = resolveOrderedSiblings(siblings, parentKey);
        const visible: TItem[] = [];
        for (const item of orderedSiblings) {
          if (matchSet.has(itemKey(item))) {
            visible.push(item);
          }
        }

        for (let i = 0; i < visible.length; i++) {
          const item = visible[i]!;
          const key = itemKey(item);
          const isLast = i === visible.length - 1;
          const branch = isBranch(item);

          const node: FlatNode<TItem> = {
            key,
            item,
            depth,
            parentKey,
            isBranch: branch,
            posInSet: i + 1,
            setSize: visible.length,
            isLastChild: isLast,
            ancestorIsLast: [...ancestorIsLast],
          };
          result.push(node);

          if (branch) {
            const childStart = result.length;
            const children = getChildren(item);
            if (children && children.length > 0) {
              walkFilteredOrdered(children, depth + 1, key, [...ancestorIsLast, isLast]);
            }
            node.filterExpanded = result.length > childStart;
          }
        }
      }

      if (order === undefined) {
        walkFiltered(items, 0, null, []);
      } else {
        walkFilteredOrdered(items, 0, null, []);
      }

      return result;
    }

    // ------------------------------------------------------------------
    // Unfiltered path: standard DFS (existing fast path)
    // ------------------------------------------------------------------
    function walk(
      siblings: readonly TItem[],
      depth: number,
      parentKey: Key | null,
      ancestorIsLast: boolean[],
    ) {
      for (let i = 0; i < siblings.length; i++) {
        const item = siblings[i]!;
        const key = itemKey(item);
        const isLast = i === siblings.length - 1;
        const branch = isBranch(item);

        result.push({
          key,
          item,
          depth,
          parentKey,
          isBranch: branch,
          posInSet: i + 1,
          setSize: siblings.length,
          isLastChild: isLast,
          ancestorIsLast: [...ancestorIsLast],
        });

        if (branch && expandedKeys.has(key)) {
          const children = getChildren(item);
          if (children && children.length > 0) {
            walk(children, depth + 1, key, [...ancestorIsLast, isLast]);
          }
        }
      }
    }
    function walkOrdered(
      siblings: readonly TItem[],
      depth: number,
      parentKey: Key | null,
      ancestorIsLast: boolean[],
    ) {
      const orderedSiblings = resolveOrderedSiblings(siblings, parentKey);
      for (let i = 0; i < orderedSiblings.length; i++) {
        const item = orderedSiblings[i]!;
        const key = itemKey(item);
        const isLast = i === orderedSiblings.length - 1;
        const branch = isBranch(item);

        result.push({
          key,
          item,
          depth,
          parentKey,
          isBranch: branch,
          posInSet: i + 1,
          setSize: orderedSiblings.length,
          isLastChild: isLast,
          ancestorIsLast: [...ancestorIsLast],
        });

        if (branch && expandedKeys.has(key)) {
          const children = getChildren(item);
          if (children && children.length > 0) {
            walkOrdered(children, depth + 1, key, [...ancestorIsLast, isLast]);
          }
        }
      }
    }

    if (order === undefined) {
      walk(items, 0, null, []);
    } else {
      walkOrdered(items, 0, null, []);
    }
    return result;
  }, [items, itemKey, getChildren, isBranch, expandedKeys, filterText, filterFn, order]);
}
