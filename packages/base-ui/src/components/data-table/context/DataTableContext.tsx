import { createContext, useContext, type ReactNode } from 'react';
import type { DataTableInstance } from '../types';
import type { DataTableFeatureFlags } from '../types';
import type { RowData, TableState } from '@tanstack/react-table';
import type { DataTableFeatures } from '../types';

interface DataTableContextValue<TData extends RowData> {
  table: DataTableInstance<TData>;
  features: DataTableFeatureFlags;
  state: TableState<DataTableFeatures>;
  options: DataTableInstance<TData>['options'];
  stickyHeader: boolean;
  hoverable: boolean;
  striped: boolean;
}

// React contexts cannot quantify over the row type supplied by each Root.
// Erase only the context payload; providers retain their concrete table type.
const DataTableContext = createContext<unknown>(null);

// Compound children must use the row type of their enclosing Root.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDataTableContext<TData extends RowData = any>(): DataTableContextValue<TData> {
  const ctx = useContext(DataTableContext) as DataTableContextValue<TData> | null;
  if (!ctx) {
    throw new Error('DataTable compound components must be used within <DataTable.Root>');
  }
  return ctx;
}

interface DataTableProviderProps<TData extends RowData>
  extends Omit<DataTableContextValue<TData>, 'state' | 'options'> {
  children: ReactNode;
}

export function DataTableProvider<TData extends RowData>({
  children,
  ...value
}: DataTableProviderProps<TData>) {
  const { table } = value;
  // React's table adapter synchronizes plain options during the owning render.
  // State subscriptions handle edits; provider renders carry new data and columns.
  return (
    <table.Subscribe selector={(state) => state}>
      {(state) => (
        <DataTableContext.Provider value={{ ...value, state, options: table.options }}>
          {children}
        </DataTableContext.Provider>
      )}
    </table.Subscribe>
  );
}

// ---------------------------------------------------------------------------
// Scroll container element context — set by Container, consumed by VirtualBody
// Uses the DOM element directly (via useState) so that setting it triggers a
// re-render, which is required for the virtualizer to pick up the scroll element.
// ---------------------------------------------------------------------------

const ScrollElementContext = createContext<HTMLDivElement | null>(null);

export function ScrollElementProvider({
  element,
  children,
}: {
  element: HTMLDivElement | null;
  children: ReactNode;
}) {
  return <ScrollElementContext.Provider value={element}>{children}</ScrollElementContext.Provider>;
}

export function useScrollElement(): HTMLDivElement | null {
  return useContext(ScrollElementContext);
}
