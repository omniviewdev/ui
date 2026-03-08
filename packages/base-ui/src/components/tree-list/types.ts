import type { HTMLAttributes, ReactNode } from 'react';
import type { StyledComponentProps } from '../../system/types';

// ---------------------------------------------------------------------------
// Primitives (reuse Key from list)
// ---------------------------------------------------------------------------

export type Key = string | number;

export type SelectionMode = 'none' | 'single' | 'multiple';
export type SelectionBehavior = 'replace' | 'toggle';
export type ListDensity = 'compact' | 'default' | 'comfortable';

// ---------------------------------------------------------------------------
// Flat node (produced by DFS flattener)
// ---------------------------------------------------------------------------

export interface FlatNode<TItem = unknown> {
  key: Key;
  item: TItem;
  depth: number;
  parentKey: Key | null;
  isBranch: boolean;
  isLastChild: boolean;
  ancestorIsLast: boolean[];
}

// ---------------------------------------------------------------------------
// Node metadata (passed to renderItem)
// ---------------------------------------------------------------------------

export interface TreeNodeMeta {
  key: Key;
  depth: number;
  parentKey: Key | null;
  isBranch: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  isLastChild: boolean;
  ancestorIsLast: boolean[];
}

// ---------------------------------------------------------------------------
// Per-item state (returned by useTreeItem)
// ---------------------------------------------------------------------------

export interface TreeItemState {
  isSelected: boolean;
  isActive: boolean;
  isDisabled: boolean;
  isExpanded: boolean;
  isBranch: boolean;
  isLoading: boolean;
  depth: number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface TreeStoreSnapshot {
  selectedKeys: ReadonlySet<Key>;
  activeKey: Key | null;
  disabledKeys: ReadonlySet<Key>;
  expandedKeys: ReadonlySet<Key>;
  loadingKeys: ReadonlySet<Key>;
  flattenedKeys: readonly Key[];
  visibleCount: number;
}

export interface TreeStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => TreeStoreSnapshot;
  getItemState: (key: Key) => TreeItemState;
  getNodeMeta: (key: Key) => TreeNodeMeta | undefined;
  getFlatNodes: () => readonly FlatNode[];

  // Mutations
  setSelectedKeys: (keys: Set<Key>) => void;
  setActiveKey: (key: Key | null) => void;
  setExpandedKeys: (keys: Set<Key>) => void;
  setLoadingKey: (key: Key, loading: boolean) => void;
  setFlatNodes: (nodes: FlatNode[]) => void;
  registerTextValue: (key: Key, textValue: string) => void;
  getTextValue: (key: Key) => string | undefined;
  getRegisteredKeys: () => Key[];
}

// ---------------------------------------------------------------------------
// Context values
// ---------------------------------------------------------------------------

export interface TreeConfigContextValue {
  listId: string;
  selectionMode: SelectionMode;
  selectionBehavior: SelectionBehavior;
  density: ListDensity;
  typeahead: boolean;
  loopFocus: boolean;
  virtualized: boolean;
  indentation: number;
  showBranchConnectors: boolean;
}

export interface TreeActionsContextValue {
  // Selection
  select: (key: Key) => void;
  deselect: (key: Key) => void;
  toggle: (key: Key) => void;
  selectRange: (toKey: Key) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setActiveKey: (key: Key | null) => void;
  // Tree-specific
  expand: (key: Key) => void;
  collapse: (key: Key) => void;
  toggleExpanded: (key: Key) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface TreeListRootProps<TItem = unknown>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    StyledComponentProps {
  // Data
  items: readonly TItem[];
  itemKey: (item: TItem) => Key;
  getChildren: (item: TItem) => readonly TItem[] | undefined;
  isBranch?: (item: TItem) => boolean;
  getTextValue?: (item: TItem) => string;
  renderItem: (item: TItem, node: TreeNodeMeta) => ReactNode;

  // Expansion
  expandedKeys?: ReadonlySet<Key>;
  defaultExpandedKeys?: Iterable<Key>;
  onExpandedKeysChange?: (keys: ReadonlySet<Key>) => void;

  // Async
  loadChildren?: (key: Key, item: TItem) => Promise<void>;

  // Selection
  selectionMode?: SelectionMode;
  selectionBehavior?: SelectionBehavior;
  selectedKeys?: ReadonlySet<Key>;
  defaultSelectedKeys?: Iterable<Key>;
  onSelectedKeysChange?: (keys: ReadonlySet<Key>) => void;

  activeKey?: Key | null;
  defaultActiveKey?: Key | null;
  onActiveKeyChange?: (key: Key | null) => void;

  disabledKeys?: Iterable<Key>;
  loopFocus?: boolean;
  typeahead?: boolean;
  density?: ListDensity;

  // Virtualization
  virtualized?: boolean;
  overscan?: number;
  estimatedItemSize?: number;

  // Filtering
  filterText?: string;
  defaultFilterText?: string;
  onFilterTextChange?: (filterText: string) => void;
  filterFn?: (item: TItem, filterText: string) => boolean;

  // Visual
  indentation?: number;
  showBranchConnectors?: boolean;

  loading?: boolean;
  error?: ReactNode;

  children?: ReactNode;
}

export interface TreeListItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  itemKey: Key;
  disabled?: boolean;
  textValue?: string;
  children: ReactNode;
}
