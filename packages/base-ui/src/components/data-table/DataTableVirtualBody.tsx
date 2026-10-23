import {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useRef,
  type ForwardedRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react';
import {
  flexRender,
  type Cell,
  type Row,
  type Table,
  type TableState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../system/classnames';
import { useDataTableContext, useScrollElement } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getCellSizeStyles } from './utils/getCellSizeStyles';
import { DEFAULT_ESTIMATE_ROW_SIZE, DEFAULT_OVERSCAN } from './constants';
import styles from './DataTable.module.css';

interface DataCellProps<TData> {
  cell: Cell<TData, unknown>;
  original: TData;
  state: TableState;
  selected: boolean;
  expanded: boolean;
  layout: unknown;
}

function DataCellInner<TData>({ cell }: DataCellProps<TData>) {
  'use no memo';
  const meta = cell.column.columnDef.meta as { align?: string } | undefined;
  return (
    <td
      className={styles.Cell}
      style={{ ...getCellSizeStyles(cell.column), ...getPinningStyles(cell.column) }}
      data-ov-pinned={cell.column.getIsPinned() || undefined}
      data-ov-align={meta?.align}
    >
      <span className={styles.CellContent}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </span>
    </td>
  );
}

/**
 * Cells may opt into data-only memoization via meta.dataTableCellDependencies =
 * 'data'. The safe default observes table state, not a magic checkbox column ID.
 * Data-only renderers must not read row/table selection, expansion or filter state.
 */
const DataCell = memo(DataCellInner, (previous, next) => {
  const meta = next.cell.column.columnDef.meta as
    | { dataTableCellDependencies?: 'data' }
    | undefined;
  return (
    previous.original === next.original &&
    previous.layout === next.layout &&
    previous.cell.column.columnDef.cell === next.cell.column.columnDef.cell &&
    (meta?.dataTableCellDependencies === 'data' ||
      (previous.state === next.state &&
        previous.selected === next.selected &&
        previous.expanded === next.expanded))
  );
}) as typeof DataCellInner;

export interface DataTableVirtualBodyProps<
  TData = unknown,
> extends HTMLAttributes<HTMLTableSectionElement> {
  estimateRowSize?: number;
  overscan?: number;
  /** Fixed parent-row height only. Expanded content is always dynamically measured. */
  fixedRowHeight?: boolean;
  /** Estimate for an unmeasured detail slot; actual asynchronous height is observed. */
  estimateExpandedRowSize?: number;
  /**
   * Same original-data slot as Body. Children mount only while expanded AND in
   * the virtual range. Retain query/cache ownership outside this component if
   * it must survive scrolling away. Collapse always removes the slot.
   * Use DataTable.ExpansionToggle for the disclosure. Custom disclosure buttons
   * need data-ov-expansion-toggle="" for parent-focus recovery after collapse.
   */
  renderExpandedRow?: (original: TData) => ReactNode;
  /** Plain-cell pointer convenience; expose equivalent actions in native controls. */
  onRowClick?: (row: Row<TData>, event: MouseEvent<HTMLTableRowElement>) => void;
  /** Internal positioning and measurement attributes take precedence. */
  getRowProps?: (row: Row<TData>) => HTMLAttributes<HTMLTableRowElement>;
}

interface VirtualRowProps<TData> {
  row: Row<TData>;
  start: number;
  index: number;
  height?: number;
  selected: boolean;
  expanded: boolean;
  state: TableState;
  layout: unknown;
  measureRef?: (node: HTMLTableRowElement | null) => void;
  getRowProps?: DataTableVirtualBodyProps<TData>['getRowProps'];
  onRowClick?: DataTableVirtualBodyProps<TData>['onRowClick'];
}

function VirtualRowInner<TData>({
  row,
  start,
  index,
  height,
  selected,
  expanded,
  state,
  layout,
  measureRef,
  getRowProps,
  onRowClick,
}: VirtualRowProps<TData>) {
  'use no memo';
  const { className, style, onClick, ...extraProps } = getRowProps?.(row) ?? {};
  return (
    <tr
      {...extraProps}
      ref={measureRef}
      data-index={index}
      data-ov-row-id={row.id}
      className={cn(styles.Row, className)}
      data-ov-selected={selected ? 'true' : 'false'}
      data-ov-expanded={expanded ? 'true' : 'false'}
      onClick={
        onClick || onRowClick
          ? (event) => {
              const target = event.target;
              // Interactive descendants and nested tables own their actions.
              // Do not stop propagation: consumers may still observe the event.
              const interactive =
                target instanceof Element
                  ? target.closest(
                      'button, a[href], input, select, textarea, label, summary, ' +
                        '[contenteditable]:not([contenteditable="false"]), [tabindex], ' +
                        '[role="button"], [role="link"], [role="checkbox"], [role="switch"], ' +
                        '[role="textbox"], [role="combobox"], [role="menuitem"], [role="slider"]',
                    )
                  : null;
              if (
                event.defaultPrevented ||
                !(target instanceof Element) ||
                target.closest('tr') !== event.currentTarget ||
                target.closest('table') !== event.currentTarget.closest('table') ||
                (interactive &&
                  interactive !== event.currentTarget &&
                  event.currentTarget.contains(interactive))
              ) return;
              onClick?.(event);
              if (!event.defaultPrevented) onRowClick?.(row, event);
            }
          : undefined
      }
      style={{
        ...style,
        display: 'flex',
        position: 'absolute',
        transform: `translateY(${start}px)`,
        width: '100%',
        ...(height == null ? {} : { height, overflow: 'hidden' }),
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <DataCell
          key={cell.id}
          cell={cell}
          original={row.original}
          state={state}
          layout={layout}
          selected={selected}
          expanded={expanded}
        />
      ))}
    </tr>
  );
}
const VirtualRow = memo(VirtualRowInner) as typeof VirtualRowInner;

type Slot<TData> = { key: string; row: Row<TData>; detail: boolean };

function VirtualBodyInner<TData>(
  {
    className,
    style,
    estimateRowSize = DEFAULT_ESTIMATE_ROW_SIZE,
    overscan = DEFAULT_OVERSCAN,
    fixedRowHeight = false,
    estimateExpandedRowSize = 160,
    renderExpandedRow,
    onRowClick,
    getRowProps,
    ...props
  }: DataTableVirtualBodyProps<TData>,
  ref: ForwardedRef<HTMLTableSectionElement>,
) {
  'use no memo';
  const context = useDataTableContext();
  const table = context.table as Table<TData>;
  const scrollElement = useScrollElement();
  const { rows } = table.getRowModel();
  const state = table.getState();
  const hasDetails = context.features.rowExpansion && renderExpandedRow != null;
  const slots = useMemo(() => {
    const result: Slot<TData>[] = [];
    for (const row of rows) {
      result.push({ key: JSON.stringify(['row', row.id]), row, detail: false });
      if (hasDetails && row.getIsExpanded())
        result.push({ key: JSON.stringify(['detail', row.id]), row, detail: true });
    }
    return result;
  }, [rows, state.expanded, hasDetails]);
  const getItemKey = useCallback((index: number) => slots[index]!.key, [slots]);
  const estimateSize = useCallback(
    (index: number) => (slots[index]?.detail ? estimateExpandedRowSize : estimateRowSize),
    [slots, estimateExpandedRowSize, estimateRowSize],
  );
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: slots.length,
    getItemKey,
    getScrollElement: () => scrollElement,
    estimateSize,
    overscan,
  });
  // Preserve data-only memoization across immutable patches. Geometry and arbitrary
  // cell renderers still observe all table-state slices, including custom controls.
  const cellState = useMemo(
    () => state,
    [
      state.columnFilters,
      state.globalFilter,
      state.sorting,
      state.grouping,
      state.expanded,
      state.pagination,
      state.rowSelection,
      state.columnVisibility,
      state.columnOrder,
      state.columnPinning,
      state.columnSizing,
      state.columnSizingInfo,
    ],
  );
  const layout = useMemo(
    () => ({}),
    [
      table.options.columns,
      table.options.meta,
      table.options.enableRowSelection,
      table.options.enableMultiRowSelection,
      table.options.enableSubRowSelection,
      table.options.getRowCanExpand,
      table.options.enableExpanding,
      state.columnVisibility,
      state.columnOrder,
      state.columnPinning,
      state.columnSizing,
    ],
  );
  const clickRef = useRef(onRowClick);
  clickRef.current = onRowClick;
  const handleClick = useCallback(
    (row: Row<TData>, event: MouseEvent<HTMLTableRowElement>) => clickRef.current?.(row, event),
    [],
  );

  if (rows.length === 0) return null;
  return (
    <tbody
      {...props}
      ref={ref}
      className={cn(styles.Body, className)}
      style={{
        ...style,
        display: 'grid',
        height: virtualizer.getTotalSize(),
        position: 'relative',
      }}
    >
      {virtualizer.getVirtualItems().map((item) => {
        const slot = slots[item.index];
        if (!slot) return null;
        const { row } = slot;
        if (slot.detail)
          return (
            <tr
              key={item.key}
              ref={virtualizer.measureElement}
              data-index={item.index}
              data-ov-detail-for={row.id}
              className={styles.ExpandedRow}
              style={{
                display: 'flex',
                position: 'absolute',
                width: '100%',
                transform: `translateY(${item.start}px)`,
              }}
            >
              <td
                className={styles.ExpandedRowContent}
                colSpan={row.getVisibleCells().length}
                style={{ width: '100%', minWidth: 0 }}
              >
                {renderExpandedRow?.(row.original)}
              </td>
            </tr>
          );
        return (
          <VirtualRow
            key={item.key}
            row={row}
            start={item.start}
            index={item.index}
            height={fixedRowHeight ? estimateRowSize : undefined}
            selected={row.getIsSelected()}
            expanded={row.getIsExpanded()}
            state={cellState}
            layout={layout}
            getRowProps={getRowProps}
            onRowClick={onRowClick ? handleClick : undefined}
            measureRef={fixedRowHeight ? undefined : virtualizer.measureElement}
          />
        );
      })}
    </tbody>
  );
}

export const DataTableVirtualBody = forwardRef(VirtualBodyInner) as <TData = unknown>(
  props: DataTableVirtualBodyProps<TData> & RefAttributes<HTMLTableSectionElement>,
) => ReactElement | null;
