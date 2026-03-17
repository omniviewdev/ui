import { forwardRef, memo, useEffect, useRef, type HTMLAttributes } from 'react';
import type { Cell, Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../system/classnames';
import { useDataTableContext, useScrollElement } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getCellSizeStyles } from './utils/getCellSizeStyles';
import { DEFAULT_ESTIMATE_ROW_SIZE, DEFAULT_OVERSCAN } from './constants';
import styles from './DataTable.module.css';

// ---------------------------------------------------------------------------
// Memoized cell — prevents re-rendering cells whose content hasn't changed.
// Selection-only updates (e.g. "Select all") change `contentKey` for the
// checkbox column but leave other cells' keys stable, skipping ~85% of work.
//
// `'use no memo'` is required inside the render body because TanStack Table v8
// uses mutable row/cell objects that the React Compiler can't track.
// ---------------------------------------------------------------------------

interface DataCellProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell: Cell<any, unknown>;
  /**
   * Opaque key encoding cell identity + any state that should trigger re-render.
   * For selection-sensitive columns: `${cell.id}-${stateRevision}`
   * For data-only columns: `cell.id`
   */
  contentKey: string;
}

const DataCell = memo(function DataCell({ cell }: DataCellProps) {
  'use no memo'; // TanStack Table v8 mutable objects — Compiler can't track state reads
  const pinningStyles = getPinningStyles(cell.column);
  const sizeStyles = getCellSizeStyles(cell.column);
  const meta = cell.column.columnDef.meta as Record<string, unknown> | undefined;
  const align = meta?.align as string | undefined;

  return (
    <td
      className={styles.Cell}
      style={{
        ...sizeStyles,
        ...pinningStyles,
      }}
      data-ov-pinned={cell.column.getIsPinned() || undefined}
      data-ov-align={align}
    >
      <span className={styles.CellContent}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </span>
    </td>
  );
}, (prev, next) => prev.contentKey === next.contentKey);

DataCell.displayName = 'DataTable.DataCell';

// ---------------------------------------------------------------------------
// Memoized row — skips re-render when data/position unchanged.
// Selection state changes only affect the `data-ov-selected` attribute on the
// <tr> (via ref) and the checkbox cell (via DataCell's contentKey).
// ---------------------------------------------------------------------------

// Set of column IDs that depend on row selection/expansion state.
// These columns get `stateRevision` baked into their contentKey so they
// re-render when selection changes. All other columns use a stable key.
const SELECTION_SENSITIVE_COLUMNS = new Set(['select']);

interface VirtualRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: Row<any>;
  virtualStart: number;
  /** Opaque revision counter — changes whenever this row's selection/expansion state changes */
  stateRevision: number;
  dataIndex: number;
  /** When set, enforces exact row height (used with fixedRowHeight mode) */
  rowHeight?: number;
  measureRef?: (node: HTMLTableRowElement | null) => void;
}

function VirtualRowInner({
  row,
  virtualStart,
  stateRevision,
  dataIndex,
  rowHeight,
  measureRef,
}: VirtualRowProps) {
  'use no memo'; // TanStack Table v8 mutable objects — Compiler breaks cell context
  const isSelected = row.getIsSelected();
  const isExpanded = row.getIsExpanded();

  // Update data-ov-selected/expanded via ref to avoid re-rendering the <tr>
  // on selection-only changes. The initial render sets the correct values;
  // subsequent selection changes are handled by the ref callback below.
  const trRef = useRef<HTMLTableRowElement | null>(null);

  // Combine forwarded measureRef with our local ref
  const setRefs = (node: HTMLTableRowElement | null) => {
    trRef.current = node;
    measureRef?.(node);
  };

  // Sync data attributes whenever stateRevision changes
  if (trRef.current) {
    trRef.current.dataset.ovSelected = isSelected ? 'true' : 'false';
    trRef.current.dataset.ovExpanded = isExpanded ? 'true' : 'false';
  }

  return (
    <tr
      data-index={dataIndex}
      ref={setRefs}
      className={styles.Row}
      data-ov-selected={isSelected ? 'true' : 'false'}
      data-ov-expanded={isExpanded ? 'true' : 'false'}
      style={{
        display: 'flex',
        position: 'absolute',
        transform: `translateY(${virtualStart}px)`,
        width: '100%',
        ...(rowHeight != null && { height: rowHeight, overflow: 'hidden' }),
      }}
    >
      {row.getVisibleCells().map((cell) => {
        // Selection-sensitive columns include stateRevision in their key
        // so DataCell re-renders them when selection changes.
        // All other columns use a stable key — DataCell skips them entirely.
        const contentKey = SELECTION_SENSITIVE_COLUMNS.has(cell.column.id)
          ? `${cell.id}-${stateRevision}`
          : cell.id;

        return (
          <DataCell
            key={cell.id}
            cell={cell}
            contentKey={contentKey}
          />
        );
      })}
    </tr>
  );
}

const VirtualRow = memo(VirtualRowInner, (prev, next) =>
  prev.row === next.row &&
  prev.virtualStart === next.virtualStart &&
  prev.stateRevision === next.stateRevision &&
  prev.dataIndex === next.dataIndex &&
  prev.rowHeight === next.rowHeight,
);

VirtualRow.displayName = 'DataTable.VirtualRow';

// ---------------------------------------------------------------------------

export interface DataTableVirtualBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  estimateRowSize?: number;
  overscan?: number;
  /**
   * When true, skips dynamic row measurement via `getBoundingClientRect`.
   * Use this when all rows have the same height (set via `estimateRowSize`)
   * to avoid forced reflow on mount — a significant perf win for large tables.
   */
  fixedRowHeight?: boolean;
}

export const DataTableVirtualBody = forwardRef<HTMLTableSectionElement, DataTableVirtualBodyProps>(
  function DataTableVirtualBody(
    {
      className,
      estimateRowSize = DEFAULT_ESTIMATE_ROW_SIZE,
      overscan = DEFAULT_OVERSCAN,
      fixedRowHeight = false,
      ...props
    },
    ref,
  ) {
    'use no memo'; // TanStack Table v8 mutable objects — Compiler breaks state reads
    const { table } = useDataTableContext();
    const scrollElement = useScrollElement();
    const { rows } = table.getRowModel();

    // Virtualizer follows the exact TanStack pattern:
    // - getScrollElement returns the Container div (via context)
    // - measureElement for dynamic row heights (disabled in Firefox)
    const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
      count: rows.length,
      estimateSize: () => estimateRowSize,
      getScrollElement: () => scrollElement,
      measureElement:
        fixedRowHeight
          ? undefined
          : typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
            ? (element) => element.getBoundingClientRect().height
            : undefined,
      overscan,
    });

    // Re-measure when data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rowVirtualizer.measure is identity-stable; only re-measure when row count changes
    useEffect(() => {
      rowVirtualizer.measure();
    }, [rows.length]);

    // Read selection & expansion state maps so we can compute per-row revision
    // keys. These are plain objects — identity changes when the state changes.
    const rowSelection = table.getState().rowSelection;
    const expanded = table.getState().expanded;

    if (rows.length === 0) return null;

    return (
      <tbody
        ref={ref}
        className={cn(styles.Body, className)}
        style={{
          display: 'grid',
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
        {...props}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;

          // Encode this row's selection+expansion as a number so the memo
          // can compare cheaply. Bit 0 = selected, bit 1 = expanded.
          const stateRevision =
            (rowSelection[row.id] ? 1 : 0) |
            (typeof expanded === 'boolean' ? (expanded ? 2 : 0) : (expanded as Record<string, boolean>)?.[row.id] ? 2 : 0);

          return (
            <VirtualRow
              key={row.id}
              row={row}
              virtualStart={virtualRow.start}
              stateRevision={stateRevision}
              dataIndex={virtualRow.index}
              rowHeight={fixedRowHeight ? estimateRowSize : undefined}
              measureRef={fixedRowHeight ? undefined : (node) => {
                if (node) rowVirtualizer.measureElement(node);
              }}
            />
          );
        })}
      </tbody>
    );
  },
);

DataTableVirtualBody.displayName = 'DataTable.VirtualBody';
