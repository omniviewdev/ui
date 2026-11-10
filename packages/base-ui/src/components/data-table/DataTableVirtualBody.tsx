import {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react';
import { flexRender, type Cell, type TableState, type RowData } from '@tanstack/react-table';
import type { Range } from '@tanstack/react-virtual';
import type { DataTableFeatures, DataTableInstance, DataTableRow } from './types';
import { useVirtualizerSnapshot } from '../../system/useVirtualizerSnapshot';
import { cn } from '../../system/classnames';
import { useDataTableContext, useScrollElement } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getCellSizeStyles } from './utils/getCellSizeStyles';
import { DEFAULT_ESTIMATE_ROW_SIZE, DEFAULT_OVERSCAN } from './constants';
import styles from './DataTable.module.css';

interface ColumnLayout {
  style: CSSProperties;
  pinned: 'start' | 'end' | undefined;
}

interface ColumnLayouts {
  columns: ReadonlyMap<string, ColumnLayout>;
  state: Pick<
    TableState<DataTableFeatures>,
    'columnVisibility' | 'columnOrder' | 'columnPinning' | 'columnSizing'
  >;
  options: {
    meta: unknown;
    enableRowSelection: unknown;
    enableMultiRowSelection: unknown;
    enableSubRowSelection: unknown;
    getRowCanExpand: unknown;
    enableExpanding: unknown;
  };
}

function readTableSnapshot<TData extends RowData>(context: { table: DataTableInstance<TData> }) {
  return {
    rows: context.table.getRowModel().rows,
    columns: context.table.getVisibleLeafColumns(),
  };
}

function readColumnLayouts<TData extends RowData>(
  columns: ReturnType<DataTableInstance<TData>['getVisibleLeafColumns']>,
  state: ColumnLayouts['state'],
  options: ColumnLayouts['options'],
): ColumnLayouts {
  return {
    state,
    options,
    columns: new Map(
      columns.map((column) => [
        column.id,
        {
          style: { ...getCellSizeStyles(column), ...getPinningStyles(column) },
          pinned: column.getIsPinned() || undefined,
        },
      ]),
    ),
  };
}

interface DataCellProps<TData extends RowData> {
  cell: Cell<DataTableFeatures, TData, unknown>;
  table: DataTableInstance<TData>;
  original: TData;
  state: TableState<DataTableFeatures>;
  selected: boolean;
  expanded: boolean;
  layout: ColumnLayouts;
}

function DataCellInner<TData extends RowData>({ cell, table, layout }: DataCellProps<TData>) {
  // Every rendered cell belongs to a visible column in this layout snapshot.
  const presentation = layout.columns.get(cell.column.id)!;
  const content = flexRender(cell.column.columnDef.cell, { ...cell.getContext(), table });
  const meta = cell.column.columnDef.meta as { align?: string } | undefined;
  return (
    <td
      className={styles.Cell}
      style={presentation.style}
      data-ov-pinned={presentation.pinned}
      data-ov-align={meta?.align}
    >
      <span className={styles.CellContent}>{content}</span>
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
    { dataTableCellDependencies?: 'data' } | undefined;
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
  TData extends RowData = RowData,
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
  onRowClick?: (row: DataTableRow<TData>, event: MouseEvent<HTMLTableRowElement>) => void;
  /** Internal positioning and measurement attributes take precedence. */
  getRowProps?: (row: DataTableRow<TData>) => HTMLAttributes<HTMLTableRowElement>;
}

interface VirtualRowProps<TData extends RowData> {
  row: DataTableRow<TData>;
  table: DataTableInstance<TData>;
  start: number;
  index: number;
  height?: number;
  selected: boolean;
  expanded: boolean;
  stripe: boolean;
  state: TableState<DataTableFeatures>;
  layout: ColumnLayouts;
  measureRef?: (node: HTMLTableRowElement | null) => void;
  getRowProps?: DataTableVirtualBodyProps<TData>['getRowProps'];
  onRowClick?: DataTableVirtualBodyProps<TData>['onRowClick'];
}

function VirtualRowInner<TData extends RowData>({
  row,
  table,
  start,
  index,
  height,
  selected,
  expanded,
  stripe,
  state,
  layout,
  measureRef,
  getRowProps,
  onRowClick,
}: VirtualRowProps<TData>) {
  const { className, style, onClick, ...extraProps } = getRowProps?.(row) ?? {};
  const cells = table.getRow(row.id).getVisibleCells();
  const rowStyle = {
    ...style,
    '--_dt-row-offset': `${start}px`,
    '--_dt-row-height': height == null ? undefined : `${height}px`,
  } as CSSProperties;
  // Virtualizer geometry takes precedence over consumer row styles.
  delete rowStyle.display;
  delete rowStyle.position;
  delete rowStyle.transform;
  delete rowStyle.width;
  if (height != null) {
    delete rowStyle.height;
    delete rowStyle.overflow;
  }
  return (
    <tr
      {...extraProps}
      ref={measureRef}
      data-index={index}
      data-ov-row-id={row.id}
      className={cn(styles.Row, styles.VirtualRow, height != null && styles.FixedRow, className)}
      data-ov-selected={selected ? 'true' : 'false'}
      data-ov-expanded={expanded ? 'true' : 'false'}
      data-ov-stripe={stripe ? 'true' : undefined}
      data-ov-fixed-height={height == null ? undefined : 'true'}
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
              )
                return;
              onClick?.(event);
              if (!event.defaultPrevented) onRowClick?.(row, event);
            }
          : undefined
      }
      style={rowStyle}
    >
      {cells.map((cell) => (
        <DataCell
          key={cell.id}
          cell={cell}
          table={table}
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

// Item keys identify rows across reorders and keep detail slots in their own namespace.
// Distinct one-character prefixes cannot collide, whatever the row ids contain.
const rowKey = (id: string) => `r:${id}`;
const detailKey = (id: string) => `d:${id}`;

type Slot<TData extends RowData> = {
  key: string;
  row: DataTableRow<TData>;
  detail: boolean;
  /** Position among rows, excluding detail slots. */
  ordinal: number;
};

function VirtualBodyInner<TData extends RowData>(
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
  const context = useDataTableContext<TData>();
  const { table, striped } = context;
  const scrollElement = useScrollElement();
  const { rows, columns } = readTableSnapshot(context);
  const { state, options } = context;
  const getIsRowExpanded = options.getIsRowExpanded;
  const hasDetails = context.features.rowExpansion && renderExpandedRow != null;
  // Detail slots interleave with rows only for expandable tables. Everywhere else the
  // slot index is the row index, so no slot object or key string is built per row.
  const detailSlots = useMemo(() => {
    if (!hasDetails) return undefined;
    const result: Slot<TData>[] = [];
    for (let ordinal = 0; ordinal < rows.length; ordinal++) {
      const row = rows[ordinal]!;
      result.push({ key: rowKey(row.id), row, detail: false, ordinal });
      const expanded =
        getIsRowExpanded?.(row) ??
        (state.expanded === true ||
          (Object.hasOwn(state.expanded, row.id) && !!state.expanded[row.id]));
      if (expanded) result.push({ key: detailKey(row.id), row, detail: true, ordinal });
    }
    return result;
  }, [rows, state.expanded, hasDetails, getIsRowExpanded]);
  const count = detailSlots ? detailSlots.length : rows.length;
  const getItemKey = useCallback(
    (index: number) => (detailSlots ? detailSlots[index]!.key : rowKey(rows[index]!.id)),
    [detailSlots, rows],
  );
  const estimateSize = useCallback(
    (index: number) => (detailSlots?.[index]?.detail ? estimateExpandedRowSize : estimateRowSize),
    [detailSlots, estimateExpandedRowSize, estimateRowSize],
  );
  const rangeExtractor = useMemo(() => {
    if (!fixedRowHeight || hasDetails || overscan < 2) return undefined;
    // Keep a small, stable window while the viewport moves inside overscan.
    // Rebuilding the React range for each crossed row adds commit/layout work
    // even though the already-mounted rows cover the next several frames.
    const step = Math.min(4, Math.floor(overscan / 2));
    let start = -1;
    let end = -1;
    let indices: number[] = [];
    return (range: Range) => {
      const nextStart = Math.max(0, Math.floor((range.startIndex - range.overscan) / step) * step);
      const nextEnd = Math.min(range.count - 1, Math.ceil((range.endIndex + range.overscan + 1) / step) * step - 1);
      if (start !== nextStart || end !== nextEnd) {
        start = nextStart;
        end = nextEnd;
        indices = Array.from({ length: end - start + 1 }, (_, index) => start + index);
      }
      return indices;
    };
  }, [fixedRowHeight, hasDetails, overscan]);
  const virtualizer = useVirtualizerSnapshot<HTMLDivElement, HTMLTableRowElement>({
    count,
    getItemKey,
    getScrollElement: () => scrollElement,
    estimateSize,
    overscan,
    rangeExtractor,
  });
  const { measure } = virtualizer;
  const previousFixedRowHeight = useRef(fixedRowHeight);
  useLayoutEffect(() => {
    if (previousFixedRowHeight.current === fixedRowHeight) return;
    previousFixedRowHeight.current = fixedRowHeight;
    // Fixed rows cannot reuse heights measured from wrapping or custom cell content.
    measure();
  }, [fixedRowHeight, measure]);
  // Preserve data-only memoization across immutable patches. Geometry and arbitrary
  // cell renderers still observe all table-state slices, including custom controls.
  const cellState = useMemo(
    () => ({
      columnFilters: state.columnFilters,
      globalFilter: state.globalFilter,
      sorting: state.sorting,
      grouping: state.grouping,
      expanded: state.expanded,
      pagination: state.pagination,
      rowSelection: state.rowSelection,
      columnVisibility: state.columnVisibility,
      columnOrder: state.columnOrder,
      columnPinning: state.columnPinning,
      columnSizing: state.columnSizing,
      columnResizing: state.columnResizing,
    }),
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
      state.columnResizing,
    ],
  );
  const layout = useMemo(
    // Keep the selected immutable inputs with the derived column layout.
    () =>
      readColumnLayouts(
        columns,
        {
          columnVisibility: state.columnVisibility,
          columnOrder: state.columnOrder,
          columnPinning: state.columnPinning,
          columnSizing: state.columnSizing,
        },
        {
          meta: options.meta,
          enableRowSelection: options.enableRowSelection,
          enableMultiRowSelection: options.enableMultiRowSelection,
          enableSubRowSelection: options.enableSubRowSelection,
          getRowCanExpand: options.getRowCanExpand,
          enableExpanding: options.enableExpanding,
        },
      ),
    [
      columns,
      options.meta,
      options.enableRowSelection,
      options.enableMultiRowSelection,
      options.enableSubRowSelection,
      options.getRowCanExpand,
      options.enableExpanding,
      state.columnVisibility,
      state.columnOrder,
      state.columnPinning,
      state.columnSizing,
    ],
  );
  const clickRef = useRef(onRowClick);
  useLayoutEffect(() => {
    clickRef.current = onRowClick;
  }, [onRowClick]);
  const handleClick = useCallback(
    (row: DataTableRow<TData>, event: MouseEvent<HTMLTableRowElement>) =>
      clickRef.current?.(row, event),
    [],
  );

  if (rows.length === 0) return null;
  const bodyStyle = {
    ...style,
    '--_dt-body-height': `${virtualizer.totalSize}px`,
  } as CSSProperties;
  delete bodyStyle.display;
  delete bodyStyle.position;
  delete bodyStyle.height;
  return (
    <tbody
      {...props}
      ref={ref}
      className={cn(styles.Body, styles.VirtualBody, className)}
      style={bodyStyle}
    >
      {virtualizer.virtualItems.map((item) => {
        const slot = detailSlots?.[item.index];
        const row = slot ? slot.row : rows[item.index];
        if (!row) return null;
        if (slot?.detail)
          return (
            <tr
              key={item.key}
              ref={virtualizer.measureElement}
              data-index={item.index}
              data-ov-detail-for={row.id}
              className={cn(styles.ExpandedRow, styles.VirtualExpandedRow)}
              style={{ '--_dt-row-offset': `${item.start}px` } as CSSProperties}
            >
              <td
                className={cn(styles.ExpandedRowContent, styles.VirtualExpandedRowContent)}
                colSpan={row.getVisibleCells().length}
              >
                {renderExpandedRow?.(row.original)}
              </td>
            </tr>
          );
        return (
          <VirtualRow
            key={item.key}
            row={row}
            table={table}
            start={item.start}
            index={item.index}
            height={fixedRowHeight ? estimateRowSize : undefined}
            selected={row.getIsSelected()}
            expanded={row.getIsExpanded()}
            stripe={striped && (slot ? slot.ordinal : item.index) % 2 === 1}
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

export const DataTableVirtualBody = forwardRef(VirtualBodyInner) as <
  TData extends RowData = RowData,
>(
  props: DataTableVirtualBodyProps<TData> & RefAttributes<HTMLTableSectionElement>,
) => ReactElement | null;
