import type { CSSProperties } from 'react';
import type { RowData } from '@tanstack/react-table';
import type { DataTableColumn } from '../types';

/**
 * Returns CSS custom properties for column sizing.
 * Columns that can resize get flex-grow proportional to their size (fills available space).
 * Fixed columns (enableResizing: false) do NOT flex-grow — they stay at their declared size.
 */
export function getHeaderSizeStyles<TData extends RowData>(headerId: string, column: DataTableColumn<TData, unknown>): CSSProperties {
  const canGrow = column.getCanResize();
  return {
    '--_dt-cell-grow': canGrow ? `var(--header-${headerId}-size)` : 0,
    '--_dt-cell-basis': canGrow ? '0px' : `calc(var(--header-${headerId}-size) * 1px)`,
    '--_dt-cell-size': `var(--header-${headerId}-size)`,
  } as CSSProperties;
}

export function getCellSizeStyles<TData extends RowData>(column: DataTableColumn<TData, unknown>): CSSProperties {
  const canGrow = column.getCanResize();
  return {
    '--_dt-cell-grow': canGrow ? `var(--col-${column.id}-size)` : 0,
    '--_dt-cell-basis': canGrow ? '0px' : `calc(var(--col-${column.id}-size) * 1px)`,
    '--_dt-cell-size': `var(--col-${column.id}-size)`,
  } as CSSProperties;
}
