import { useMemo } from 'react';
import type { DataTableInstance } from '../types';
import type { RowData, TableState } from '@tanstack/react-table';
import type { DataTableFeatures } from '../types';
import { getSizeVariable } from '../utils/getCellSizeStyles';

/**
 * Computes CSS custom properties for all column widths.
 * Applied at the root table element so cells reference them via
 * `width: calc(var(--header-{encoded-id}-size) * 1px)` without per-cell inline styles.
 *
 * Recomputes when column definitions, visibility, or sizing change.
 */
export function useColumnSizeVars<TData extends RowData>(
  table: DataTableInstance<TData>,
  state: TableState<DataTableFeatures> = table.state,
  options: DataTableInstance<TData>['options'] = table.options,
): Record<string, number> {
  const columnResizing = state.columnResizing;
  const columnSizing = state.columnSizing;
  const columnVisibility = state.columnVisibility;
  const columnOrder = state.columnOrder;
  const columnPinning = state.columnPinning;

  return useMemo(() => {
    const headers = table.getFlatHeaders();
    const vars: Record<string, number> = { '--_dt-table-size': table.getTotalSize() };
    for (const header of headers) {
      vars[getSizeVariable(header.id, 'header')] = header.getSize();
      vars[getSizeVariable(header.column.id)] = header.column.getSize();
    }
    return vars;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    table,
    options,
    state.grouping,
    columnSizing,
    columnResizing,
    columnVisibility,
    columnOrder,
    columnPinning,
  ]);
}
