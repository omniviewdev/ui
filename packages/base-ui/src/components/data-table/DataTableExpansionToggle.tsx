import type { ButtonHTMLAttributes } from 'react';
import type { RowData } from '@tanstack/react-table';
import type { DataTableRow } from './types';
import { useDataTableContext } from './context/DataTableContext';
import { cn } from '../../system/classnames';
import styles from './DataTable.module.css';

export interface DataTableExpansionToggleProps<TData extends RowData> extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'aria-expanded'
> {
  row: DataTableRow<TData>;
  /** Row-specific accessible name, e.g. the displayed resource name. */
  label: string;
  /** Localize the complete accessible name; defaults to English Expand/Collapse plus label. */
  getAccessibleLabel?: (expanded: boolean, label: string) => string;
}

/** Native Tab/Enter/Space behavior; does not turn the table into a grid. */
export function DataTableExpansionToggle<TData extends RowData>({
  row,
  label,
  getAccessibleLabel,
  className,
  children,
  disabled,
  onClick,
  ...props
}: DataTableExpansionToggleProps<TData>) {
  useDataTableContext();
  // Row identity stays stable while controlled options and expansion state change.
  // Read current values on every context render rather than caching by row identity.
  const canExpand = row.getCanExpand();
  const expanded = row.getIsExpanded();
  return (
    <button
      {...props}
      type="button"
      className={cn(styles.ExpandToggle, className)}
      disabled={disabled || !canExpand}
      aria-label={
        getAccessibleLabel?.(expanded, label) ?? `${expanded ? 'Collapse' : 'Expand'} ${label}`
      }
      aria-expanded={expanded}
      data-ov-expanded={expanded ? 'true' : 'false'}
      data-ov-expansion-toggle=""
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) row.toggleExpanded();
      }}
    >
      {children ?? (
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
        >
          <path d="m6 3 5 5-5 5" />
        </svg>
      )}
    </button>
  );
}
