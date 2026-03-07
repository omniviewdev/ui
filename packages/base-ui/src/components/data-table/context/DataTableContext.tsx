import { createContext, useContext, type ReactNode } from 'react';
import type { Table } from '@tanstack/react-table';
import type { DataTableFeatures } from '../types';

interface DataTableContextValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
  features: DataTableFeatures;
  stickyHeader: boolean;
  hoverable: boolean;
  striped: boolean;
}

const DataTableContext = createContext<DataTableContextValue | null>(null);

export function useDataTableContext(): DataTableContextValue {
  const ctx = useContext(DataTableContext);
  if (!ctx) {
    throw new Error('DataTable compound components must be used within <DataTable.Root>');
  }
  return ctx;
}

interface DataTableProviderProps extends DataTableContextValue {
  children: ReactNode;
}

export function DataTableProvider({ children, ...value }: DataTableProviderProps) {
  return <DataTableContext.Provider value={value}>{children}</DataTableContext.Provider>;
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
