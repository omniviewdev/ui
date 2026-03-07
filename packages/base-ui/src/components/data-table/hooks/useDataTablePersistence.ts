import { useEffect } from 'react';
import type { Table } from '@tanstack/react-table';

interface PersistableState {
  columnSizing?: Record<string, number>;
  columnVisibility?: Record<string, boolean>;
  columnOrder?: string[];
  sorting?: Array<{ id: string; desc: boolean }>;
}

/**
 * Persists select table state to localStorage under the given key.
 * Restores on mount. Only persists column sizing, visibility, order, and sorting.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDataTablePersistence(table: Table<any>, key: string | undefined) {
  // Restore on mount
  useEffect(() => {
    if (!key) return;
    try {
      const stored = localStorage.getItem(`ov-datatable-${key}`);
      if (!stored) return;
      const state: PersistableState = JSON.parse(stored);
      if (state.columnSizing) table.setColumnSizing(state.columnSizing);
      if (state.columnVisibility) table.setColumnVisibility(state.columnVisibility);
      if (state.columnOrder) table.setColumnOrder(state.columnOrder);
      if (state.sorting) table.setSorting(state.sorting);
    } catch {
      // Ignore corrupt localStorage
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on change
  useEffect(() => {
    if (!key) return;
    const state: PersistableState = {
      columnSizing: table.getState().columnSizing,
      columnVisibility: table.getState().columnVisibility,
      columnOrder: table.getState().columnOrder,
      sorting: table.getState().sorting,
    };
    try {
      localStorage.setItem(`ov-datatable-${key}`, JSON.stringify(state));
    } catch {
      // Quota exceeded, ignore
    }
  }, [
    key,
    table.getState().columnSizing,
    table.getState().columnVisibility,
    table.getState().columnOrder,
    table.getState().sorting,
  ]);
}
