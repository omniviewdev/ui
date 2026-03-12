'use no memo'; // TanStack Table uses a stable ref — Compiler can't track internal state changes

import { useMemo } from 'react';
import type { Table } from '@tanstack/react-table';

/**
 * Computes CSS custom properties for all column widths.
 * Applied at the root table element so cells reference them via
 * `width: calc(var(--header-{id}-size) * 1px)` without per-cell inline styles.
 *
 * Only recomputes when columnSizing or columnSizingInfo changes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useColumnSizeVars(table: Table<any>): Record<string, number> {
  const columnSizingInfo = table.getState().columnSizingInfo;
  const columnSizing = table.getState().columnSizing;
  const columnVisibility = table.getState().columnVisibility;
  const columnOrder = table.getState().columnOrder;
  const columnPinning = table.getState().columnPinning;

  return useMemo(() => {
    const headers = table.getFlatHeaders();
    const vars: Record<string, number> = {};
    for (const header of headers) {
      vars[`--header-${header.id}-size`] = header.getSize();
      vars[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return vars;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnSizing, columnSizingInfo, columnVisibility, columnOrder, columnPinning]);
}
