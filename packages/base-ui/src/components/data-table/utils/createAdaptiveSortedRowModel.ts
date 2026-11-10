import {
  createSortedRowModel,
  type Row,
  type RowData,
  type RowModel,
  type Table,
  type TableFeatures,
} from '@tanstack/react-table';

/**
 * Start each sort from the previous order, using only the new model's rows. Native adaptive sorts
 * then handle sparse immutable patches in near-linear work instead of sorting shuffled source
 * order again. TanStack still owns comparison, stable ties, grouping and pagination resets.
 */
export function createAdaptiveSortedRowModel<TFeatures extends TableFeatures, TData extends RowData>() {
  const createSorted = createSortedRowModel<TFeatures, TData>();
  return (table: Table<TFeatures, TData>) => {
    let order: string[] | undefined;
    let input: RowModel<TFeatures, TData> | undefined;
    let prepared: RowModel<TFeatures, TData> | undefined;
    let previousResult: RowModel<TFeatures, TData> | undefined;

    // Inherit live options and atoms; do not copy a table's current-value getters or mutate it.
    const sortingView = Object.create(table, {
      getPreSortedRowModel: {
        value: () => {
          const next = table.getPreSortedRowModel();
          if (next === input) return prepared!;
          input = next;
          if (!order || next.rows.length < 2) return (prepared = next);
          if (order.length === next.rows.length) {
            let sameOrder = true;
            for (let index = 0; index < order.length; index++) {
              if (order[index] !== next.rows[index]!.id) { sameOrder = false; break; }
            }
            if (sameOrder) return (prepared = next);
          }

          const remaining = new Map<string, Row<TFeatures, TData>>();
          for (const row of next.rows) remaining.set(row.id, row);
          const rows = new Array<Row<TFeatures, TData>>(next.rows.length);
          let index = 0;
          let changed = false;
          for (const id of order) {
            const row = remaining.get(id);
            if (!row) continue;
            if (row !== next.rows[index]) changed = true;
            rows[index++] = row;
            remaining.delete(id);
          }
          for (const row of remaining.values()) {
            if (row !== next.rows[index]) changed = true;
            rows[index++] = row;
          }
          return (prepared = changed ? { ...next, rows } : next);
        },
      },
    }) as Table<TFeatures, TData>;
    const getSorted = createSorted(sortingView);
    return () => {
      const result = getSorted();
      if (result !== previousResult) {
        previousResult = result;
        // An upstream early return means sorting is absent or unavailable. Restore source order.
        order = result === prepared ? undefined : result.rows.map((row) => row.id);
      }
      return result === prepared && input ? input : result;
    };
  };
}
