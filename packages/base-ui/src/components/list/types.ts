import type { HTMLAttributes, ReactNode } from 'react';
import type { StyledComponentProps } from '../../system/types';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type Key = string | number;

export type SelectionMode = 'none' | 'single' | 'multiple';
export type SelectionBehavior = 'replace' | 'toggle';
export type ListDensity = 'compact' | 'default' | 'comfortable';
export type ListOrientation = 'vertical' | 'horizontal';

// ---------------------------------------------------------------------------
// Per-item state (returned by useListItem)
// ---------------------------------------------------------------------------

export interface ItemState {
  isSelected: boolean;
  isActive: boolean;
  isDisabled: boolean;
}

// ---------------------------------------------------------------------------
// Store (internal, exposed via context)
// ---------------------------------------------------------------------------

export interface ListStoreSnapshot {
  selectedKeys: ReadonlySet<Key>;
  activeKey: Key | null;
  disabledKeys: ReadonlySet<Key>;
  registeredKeys: Key[];
}

export interface ListStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ListStoreSnapshot;
  getItemState: (key: Key) => ItemState;

  // Mutations (called by actions context)
  setSelectedKeys: (keys: Set<Key>) => void;
  setActiveKey: (key: Key | null) => void;
  registerItem: (key: Key, textValue?: string) => () => void;
  getRegisteredKeys: () => Key[];
  getTextValue: (key: Key) => string | undefined;
}

// ---------------------------------------------------------------------------
// Context values
// ---------------------------------------------------------------------------

export interface ListConfigContextValue {
  listId: string;
  selectionMode: SelectionMode;
  selectionBehavior: SelectionBehavior;
  density: ListDensity;
  orientation: ListOrientation;
  typeahead: boolean;
  loopFocus: boolean;
  virtualized: boolean;
}

export interface ListActionsContextValue {
  select: (key: Key) => void;
  deselect: (key: Key) => void;
  toggle: (key: Key) => void;
  selectRange: (toKey: Key) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setActiveKey: (key: Key | null) => void;
  registerItem: (key: Key, textValue?: string) => () => void;
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface ListRootProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, StyledComponentProps {
  selectionMode?: SelectionMode;
  selectionBehavior?: SelectionBehavior;
  selectedKeys?: ReadonlySet<Key>;
  defaultSelectedKeys?: Iterable<Key>;
  onSelectedKeysChange?: (keys: ReadonlySet<Key>) => void;

  activeKey?: Key | null;
  defaultActiveKey?: Key | null;
  onActiveKeyChange?: (key: Key | null) => void;

  disabledKeys?: Iterable<Key>;

  orientation?: ListOrientation;
  loopFocus?: boolean;
  typeahead?: boolean;

  density?: ListDensity;

  virtualized?: boolean;
  overscan?: number;
  estimatedItemSize?: number;

  loading?: boolean;
  error?: ReactNode;

  children?: ReactNode;
}

export interface ListViewportProps extends HTMLAttributes<HTMLDivElement> {
  onReachEnd?: () => void;
}

export interface ListItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  itemKey: Key;
  disabled?: boolean;
  textValue?: string;
  children: ReactNode;
}

export interface ListGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface ListHandle {
  focus: () => void;
  scrollToKey: (key: Key, align?: ScrollLogicalPosition) => void;
  getSelectedKeys: () => ReadonlySet<Key>;
  clearSelection: () => void;
  selectAll: () => void;
}
