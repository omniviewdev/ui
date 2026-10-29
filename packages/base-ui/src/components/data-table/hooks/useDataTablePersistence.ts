import { useEffect, useRef } from 'react';
import type { DataTableInstance } from '../types';

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
export function useDataTablePersistence(table: DataTableInstance<any>, key: string | undefined) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Restore on mount
  useEffect(() => {
    if (!key) return;
    try {
      const stored = localStorage.getItem(`ov-datatable-${key}`);
      if (stored === null) {
        // Key exists but nothing stored — reset to defaults
        table.setColumnSizing({});
        table.setColumnVisibility({});
        table.setColumnOrder([]);
        table.setSorting([]);
        return;
      }
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

  // Persist on change (debounced)
  useEffect(() => {
    if (!key) return;
    const schedulePersist = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const state: PersistableState = {
          columnSizing: table.atoms.columnSizing.get(),
          columnVisibility: table.atoms.columnVisibility.get(),
          columnOrder: table.atoms.columnOrder.get(),
          sorting: table.atoms.sorting.get(),
        };
        try {
          localStorage.setItem(`ov-datatable-${key}`, JSON.stringify(state));
        } catch {
          // Quota exceeded, ignore
        }
      }, 300);
    };
    const subscriptions = [
      table.atoms.columnSizing.subscribe(schedulePersist),
      table.atoms.columnVisibility.subscribe(schedulePersist),
      table.atoms.columnOrder.subscribe(schedulePersist),
      table.atoms.sorting.subscribe(schedulePersist),
    ];
    schedulePersist();
    return () => {
      for (const subscription of subscriptions) subscription.unsubscribe();
      clearTimeout(timerRef.current);
    };
  }, [key, table]);
}
