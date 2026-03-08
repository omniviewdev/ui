import type { HTMLAttributes, ReactNode } from 'react';
import type { ListRootProps, ListItemProps, Key } from '../list';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type CheckBehavior = 'checkbox' | 'radio';

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface SelectableListRootProps extends ListRootProps {
  /**
   * Visual indicator type.
   * Defaults to 'checkbox' when selectionMode='multiple',
   * 'radio' when selectionMode='single'.
   */
  checkBehavior?: CheckBehavior;
}

export type SelectableListItemProps = ListItemProps;

export type SelectableListItemIndicatorProps = HTMLAttributes<HTMLSpanElement>;

export interface SelectableListSelectAllProps
  extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface SelectableListSelectionSummaryProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Custom render function. If omitted, renders "N of M selected" */
  children?: ReactNode | ((selected: number, total: number) => ReactNode);
}

export interface SelectableListGroupSelectAllProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Keys of items in this group, used to compute indeterminate state */
  groupKeys: readonly Key[];
  children?: ReactNode;
}
