import { createContext, useContext, type ReactNode } from 'react';
import type { SortConfig } from '../sortable-table/useSortableTable';

export interface FileTableItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: string;
  extension?: string;
  children?: FileTableItem[];
}

export interface FileTableColumnConfig {
  id: string;
  header: ReactNode;
  accessor: (item: any) => ReactNode;
  sortAccessor?: (item: any) => string | number | Date | undefined;
  sortFn?: (a: any, b: any) => number;
  width?: number | string;
  sortable?: boolean;
  mono?: boolean;
  align?: 'left' | 'right';
}

export interface FileTableContextValue {
  items: FileTableItem[];
  sortedItems: FileTableItem[];
  sort: SortConfig;
  onSort: (columnId: string) => void;
  selectedId?: string;
  onSelect?: (item: FileTableItem) => void;
  onNavigate?: (folder: FileTableItem) => void;
  showParent?: boolean;
  onNavigateUp?: () => void;
  extraColumns: FileTableColumnConfig[];
  setExtraColumns: (cols: FileTableColumnConfig[]) => void;
  rowActions?: (item: FileTableItem) => ReactNode;
}

const FileTableContext = createContext<FileTableContextValue | null>(null);

export function FileTableProvider({
  value,
  children,
}: {
  value: FileTableContextValue;
  children: ReactNode;
}) {
  return <FileTableContext.Provider value={value}>{children}</FileTableContext.Provider>;
}

export function useFileTableContext(): FileTableContextValue {
  const ctx = useContext(FileTableContext);
  if (!ctx) throw new Error('FileTable compound components must be used inside FileTable.Root');
  return ctx;
}
