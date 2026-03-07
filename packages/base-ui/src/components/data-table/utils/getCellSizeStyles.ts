import type { CSSProperties } from 'react';
import type { Column } from '@tanstack/react-table';

/**
 * Returns inline styles for cell sizing using CSS variable column widths.
 * Columns that can resize get flex-grow proportional to their size (fills available space).
 * Fixed columns (enableResizing: false) do NOT flex-grow — they stay at their declared size.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getHeaderSizeStyles(headerId: string, column: Column<any, unknown>): CSSProperties {
  const canGrow = column.getCanResize();
  return {
    flex: canGrow
      ? `var(--header-${headerId}-size) 0 0px`
      : `0 0 calc(var(--header-${headerId}-size) * 1px)`,
    width: `calc(var(--header-${headerId}-size) * 1px)`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCellSizeStyles(column: Column<any, unknown>): CSSProperties {
  const canGrow = column.getCanResize();
  return {
    flex: canGrow
      ? `var(--col-${column.id}-size) 0 0px`
      : `0 0 calc(var(--col-${column.id}-size) * 1px)`,
    width: `calc(var(--col-${column.id}-size) * 1px)`,
  };
}
