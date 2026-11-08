import type { ReactNode } from 'react';
import type { Key } from '../tree-list/types';

/** The generic projection the rail and its flyouts read. Nothing here knows about a domain. */
export interface NavigationModel<TItem> {
  itemKey: (item: TItem) => Key;
  getChildren: (item: TItem) => readonly TItem[] | undefined;
  getTextValue: (item: TItem) => string;
  getIcon: ((item: TItem) => ReactNode) | undefined;
  getBadge: ((item: TItem) => ReactNode) | undefined;
  getSectionLabel: ((item: TItem) => string | undefined) | undefined;
  getOpenLabel: (item: TItem) => string;
  isSelectable: (item: TItem) => boolean;
  isDisabled: (key: Key) => boolean;
  selectedKey: Key | null;
  /** Every group that contains the selected item, outermost first. */
  selectedAncestors: ReadonlySet<Key>;
  /** The top-level key that is, or contains, the selected item. */
  selectedRootKey: Key | null;
  onAction: (key: Key, item: TItem) => void;
}

const NO_CHILDREN: readonly never[] = [];
const NO_KEYS: ReadonlySet<Key> = new Set<Key>();

export function childrenOf<TItem>(model: NavigationModel<TItem>, item: TItem): readonly TItem[] {
  return model.getChildren(item) ?? NO_CHILDREN;
}

export function isGroup<TItem>(model: NavigationModel<TItem>, item: TItem): boolean {
  return childrenOf(model, item).length > 0;
}

export function hasBadge(badge: ReactNode): boolean {
  return badge !== null && badge !== undefined && badge !== false && badge !== true;
}

function findPath<TItem>(
  items: readonly TItem[],
  target: Key,
  itemKey: (item: TItem) => Key,
  getChildren: (item: TItem) => readonly TItem[] | undefined,
  path: Key[],
): Key[] | null {
  for (const item of items) {
    const key = itemKey(item);
    if (key === target) return path;
    const children = getChildren(item);
    if (children && children.length > 0) {
      path.push(key);
      const found = findPath(children, target, itemKey, getChildren, path);
      if (found) return found;
      path.pop();
    }
  }
  return null;
}

/** One depth-first search that exits at the selection, so cost never exceeds one tree walk. */
export function findSelection<TItem>(
  items: readonly TItem[],
  selectedKey: Key | null,
  itemKey: (item: TItem) => Key,
  getChildren: (item: TItem) => readonly TItem[] | undefined,
): { ancestors: ReadonlySet<Key>; rootKey: Key | null } {
  if (selectedKey === null) return { ancestors: NO_KEYS, rootKey: null };
  const path = findPath(items, selectedKey, itemKey, getChildren, []);
  if (!path) return { ancestors: NO_KEYS, rootKey: null };
  return { ancestors: new Set(path), rootKey: path[0] ?? selectedKey };
}

export function fallbackGlyph(label: string): string {
  return Array.from(label.trim())[0]?.toUpperCase() ?? '?';
}
