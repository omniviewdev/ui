import type { HTMLAttributes, ReactNode } from 'react';
import type { StyledComponentProps } from '../../system/types';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type Key = string | number;

export type ListDensity = 'compact' | 'default' | 'comfortable';

// ---------------------------------------------------------------------------
// Highlight ranges (from fuzzy matcher)
// ---------------------------------------------------------------------------

/** Range of characters to highlight in a label (from server-side fuzzy matcher). */
export interface HighlightRange {
  /** Inclusive start index. */
  start: number;
  /** Exclusive end index. */
  end: number;
}

// ---------------------------------------------------------------------------
// Per-item metadata (passed to renderItem)
// ---------------------------------------------------------------------------

export interface CommandItemMeta {
  key: Key;
  isActive: boolean;
  isDisabled: boolean;
  groupKey?: string;
  score?: number;
  highlights?: HighlightRange[];
}

// ---------------------------------------------------------------------------
// Per-item state (returned by useCommandListItem)
// ---------------------------------------------------------------------------

export interface CommandListItemState {
  isActive: boolean;
  isDisabled: boolean;
}

// ---------------------------------------------------------------------------
// Internal processed item
// ---------------------------------------------------------------------------

export interface ProcessedItem<TItem = unknown> {
  key: Key;
  item: TItem;
  groupKey?: string;
  score?: number;
  highlights?: HighlightRange[];
  disabled: boolean;
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

export interface CommandGroup<TItem = unknown> {
  key: string;
  label: string;
  items: ProcessedItem<TItem>[];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface CommandListStoreSnapshot {
  activeIndex: number;
  activeKey: Key | null;
  query: string;
  visibleCount: number;
  loading: boolean;
}

export interface CommandListStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CommandListStoreSnapshot;
  getItemState: (key: Key) => CommandListItemState;

  setActiveIndex: (index: number) => void;
  setActiveKey: (key: Key | null) => void;
  setQuery: (query: string) => void;
  setItems: (items: ProcessedItem[]) => void;
  setLoading: (loading: boolean) => void;
  getItems: () => readonly ProcessedItem[];
  getItemByIndex: (index: number) => ProcessedItem | undefined;
}

// ---------------------------------------------------------------------------
// Context values
// ---------------------------------------------------------------------------

export interface CommandListConfigContextValue {
  listId: string;
  virtualized: boolean;
  density: ListDensity;
  loopFocus: boolean;
  placeholder: string;
  estimatedItemSize: number;
  overscan: number;
}

export interface CommandListActionsContextValue {
  invoke: (key: Key) => void;
  moveActive: (delta: number) => void;
  setActiveKey: (key: Key | null) => void;
  setQuery: (query: string) => void;
  dismiss: () => void;
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface CommandListRootProps<TItem = unknown>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, StyledComponentProps {
  /** Items to display. For external search, update this when results arrive. */
  items: readonly TItem[];
  itemKey: (item: TItem) => Key;

  /** Extract display label for client-side filtering and highlight rendering. */
  getTextValue?: (item: TItem) => string;

  /** Render a single command item. */
  renderItem: (item: TItem, meta: CommandItemMeta) => ReactNode;

  // Query
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;

  // Client-side filtering (optional — skip for external search)
  /** Return `true`/`false` for include/exclude, or a number for scored ranking. */
  filterFn?: (item: TItem, query: string) => boolean | number;
  /** Sort filtered results by score. Default true when filterFn returns numbers. */
  sortByScore?: boolean;

  // Grouping
  groupBy?: (item: TItem) => string;
  groupOrder?: readonly string[];
  groupLabel?: (groupKey: string) => string;

  // Server-provided highlights (per-item, keyed)
  highlights?: ReadonlyMap<Key, HighlightRange[]>;

  // Disabled items
  disabledKeys?: Iterable<Key>;

  // Action
  onAction?: (key: Key, item: TItem) => void;
  onDismiss?: () => void;

  // State
  loading?: boolean;
  density?: ListDensity;
  loopFocus?: boolean;
  placeholder?: string;

  // Virtualization
  virtualized?: boolean;
  overscan?: number;
  estimatedItemSize?: number;

  children?: ReactNode;
}

export interface CommandListItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  itemKey: Key;
  disabled?: boolean;
  children: ReactNode;
}
