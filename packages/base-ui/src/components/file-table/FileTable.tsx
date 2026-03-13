import {
  useState,
  useMemo,
  useEffect,
  Children,
  isValidElement,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { LuFolder, LuFile } from 'react-icons/lu';
import { useSortableTable } from '../sortable-table/useSortableTable';
import type { SortConfig, SortableColumnDef } from '../sortable-table/useSortableTable';
import { SortableHeader } from '../sortable-table/SortableHeader';
import {
  FileTableProvider,
  useFileTableContext,
  type FileTableItem,
  type FileTableColumnConfig,
} from './FileTableContext';
import { formatBytes, formatDate, fileTypeLabel } from './utils';
import styles from './FileTable.module.css';

// ---------------------------------------------------------------------------
// FileTable.Column — config-only, renders null
// ---------------------------------------------------------------------------

export interface FileTableColumnProps<T extends FileTableItem = FileTableItem> {
  id: string;
  header: ReactNode;
  accessor: (item: T) => ReactNode;
  sortAccessor?: (item: T) => string | number | Date | undefined;
  sortFn?: (a: T, b: T) => number;
  width?: number | string;
  sortable?: boolean;
  mono?: boolean;
  align?: 'left' | 'right';
}

export function FileTableColumn<T extends FileTableItem = FileTableItem>(
  _props: FileTableColumnProps<T>,
): null {
  return null;
}

FileTableColumn.displayName = 'FileTableColumn';

// ---------------------------------------------------------------------------
// FileTable.Header — collects Column children, registers extra columns
// ---------------------------------------------------------------------------

export interface FileTableHeaderProps {
  children?: ReactNode;
}

export function FileTableHeader({ children }: FileTableHeaderProps) {
  const ctx = useFileTableContext();

  useEffect(() => {
    const cols: FileTableColumnConfig[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === FileTableColumn) {
        cols.push(child.props as FileTableColumnConfig);
      }
    });
    ctx.setExtraColumns(cols);
  }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

  const builtInHeaders: Array<{
    id: string;
    label?: string;
    sortable: boolean;
    width?: string;
  }> = [
    { id: '__icon', sortable: false, width: '28px' },
    { id: 'name', label: 'Filename', sortable: true },
    { id: '__actions', sortable: false, width: '28px' },
    { id: 'size', label: 'Size', sortable: true, width: '80px' },
    { id: 'type', label: 'Type', sortable: true, width: '80px' },
    { id: 'modified', label: 'Last Modified', sortable: true, width: '120px' },
  ];

  return (
    <thead>
      <tr>
        {builtInHeaders.map((col) => (
          <th key={col.id} style={col.width ? { width: col.width } : undefined}>
            {'label' in col ? (
              <SortableHeader
                columnId={col.id}
                sort={ctx.sort}
                onSort={ctx.onSort}
                sortable={col.sortable}
              >
                {col.label}
              </SortableHeader>
            ) : null}
          </th>
        ))}
        {ctx.extraColumns.map((col) => (
          <th
            key={col.id}
            style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : undefined}
          >
            <SortableHeader
              columnId={col.id}
              sort={ctx.sort}
              onSort={ctx.onSort}
              sortable={col.sortable ?? false}
            >
              {col.header}
            </SortableHeader>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ---------------------------------------------------------------------------
// FileTable.Body — renders rows
// ---------------------------------------------------------------------------

export interface FileTableBodyProps {
  rowActions?: (item: FileTableItem) => ReactNode;
}

export function FileTableBody({ rowActions }: FileTableBodyProps) {
  const ctx = useFileTableContext();
  const actions = rowActions ?? ctx.rowActions;

  return (
    <tbody>
      {ctx.showParent && (
        <tr
          className={styles.ParentRow}
          onDoubleClick={ctx.onNavigateUp}
        >
          <td />
          <td>..</td>
          <td />
          <td />
          <td />
          <td />
          {ctx.extraColumns.map((col) => <td key={col.id} />)}
        </tr>
      )}
      {ctx.sortedItems.map((item) => (
        <tr
          key={item.id}
          data-ov-selected={ctx.selectedId === item.id ? 'true' : undefined}
          onClick={() => ctx.onSelect?.(item)}
          onDoubleClick={() => {
            if (item.type === 'folder') ctx.onNavigate?.(item);
          }}
        >
          <td>
            <span className={styles.FileIcon} data-ov-filetype={item.type}>
              {item.type === 'folder' ? <LuFolder size={14} /> : <LuFile size={14} />}
            </span>
          </td>
          <td>{item.name}</td>
          <td>
            {actions && (
              <span className={styles.RowActions}>
                {actions(item)}
              </span>
            )}
          </td>
          <td className={styles.SizeCell}>
            {item.size != null ? formatBytes(item.size) : item.type === 'folder' ? '—' : '0 B'}
          </td>
          <td className={styles.TypeCell}>{fileTypeLabel(item)}</td>
          <td className={styles.DateCell}>{item.modified ? formatDate(item.modified) : '—'}</td>
          {ctx.extraColumns.map((col) => (
            <td
              key={col.id}
              className={col.mono ? styles.MonoCell : undefined}
              style={col.align ? { textAlign: col.align } : undefined}
            >
              {col.accessor(item)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ---------------------------------------------------------------------------
// FileTable.Status — auto-computed counts
// ---------------------------------------------------------------------------

export function FileTableStatus() {
  const { items } = useFileTableContext();

  const counts = useMemo(() => {
    const files = items.filter((n) => n.type === 'file').length;
    const folders = items.filter((n) => n.type === 'folder').length;
    const size = items.reduce((sum, n) => sum + (n.size ?? 0), 0);
    return { files, folders, size };
  }, [items]);

  return (
    <div className={styles.Status}>
      <span>Files: {counts.files}</span>
      <span>Folders: {counts.folders}</span>
      <span>Size: {formatBytes(counts.size)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileTable.Root — manages state, provides context
// ---------------------------------------------------------------------------

export interface FileTableRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: FileTableItem[];
  onNavigate?: (folder: FileTableItem) => void;
  onSelect?: (item: FileTableItem) => void;
  selectedId?: string;
  showParent?: boolean;
  onNavigateUp?: () => void;
  defaultSort?: SortConfig;
  children: ReactNode;
}

export const FileTableRoot = forwardRef<HTMLDivElement, FileTableRootProps>(
  function FileTableRoot(
    {
      items,
      onNavigate,
      onSelect,
      selectedId,
      showParent,
      onNavigateUp,
      defaultSort,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const [extraColumns, setExtraColumns] = useState<FileTableColumnConfig[]>([]);

    const sortableColumns = useMemo<SortableColumnDef<FileTableItem>[]>(() => {
      const builtIn: SortableColumnDef<FileTableItem>[] = [
        { id: 'name', header: 'Filename', accessor: (i) => i.name },
        { id: 'size', header: 'Size', accessor: (i) => i.size ?? 0 },
        { id: 'type', header: 'Type', accessor: (i) => i.extension ?? '' },
        { id: 'modified', header: 'Modified', accessor: (i) => i.modified ?? '' },
      ];

      const extra: SortableColumnDef<FileTableItem>[] = extraColumns
        .filter((c) => c.sortable)
        .map((c) => ({
          id: c.id,
          header: c.header,
          accessor: c.sortAccessor ?? (() => undefined),
          sortFn: c.sortFn,
        }));

      return [...builtIn, ...extra];
    }, [extraColumns]);

    const { sortedData: rawSorted, sort, onSort } = useSortableTable({
      data: items,
      columns: sortableColumns,
      defaultSort: defaultSort ?? { key: 'name', direction: 'asc' },
    });

    const sortedItems = useMemo(() => {
      return [...rawSorted].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return 0;
      });
    }, [rawSorted]);

    const ctxValue = useMemo(
      () => ({
        items,
        sortedItems,
        sort,
        onSort,
        selectedId,
        onSelect,
        onNavigate,
        showParent,
        onNavigateUp,
        extraColumns,
        setExtraColumns,
      }),
      [items, sortedItems, sort, onSort, selectedId, onSelect, onNavigate, showParent, onNavigateUp, extraColumns],
    );

    return (
      <FileTableProvider value={ctxValue}>
        <div ref={ref} className={`${styles.Root}${className ? ` ${className}` : ''}`} {...rest}>
          <div className={styles.TableWrap}>
            <table className={styles.Table}>
              {children}
            </table>
          </div>
        </div>
      </FileTableProvider>
    );
  },
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type FileTableCompound = typeof FileTableRoot & {
  Root: typeof FileTableRoot;
  Header: typeof FileTableHeader;
  Body: typeof FileTableBody;
  Status: typeof FileTableStatus;
  Column: typeof FileTableColumn;
};

export const FileTable = Object.assign(FileTableRoot, {
  Root: FileTableRoot,
  Header: FileTableHeader,
  Body: FileTableBody,
  Status: FileTableStatus,
  Column: FileTableColumn,
}) as FileTableCompound;
