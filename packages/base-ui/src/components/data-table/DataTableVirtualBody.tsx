import {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
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
  type TableState,
  type RowData,
} from '@tanstack/react-table';
import type { DataTableFeatures, DataTableInstance, DataTableRow } from './types';
import { useVirtualizer } from '@tanstack/react-virtual';
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

type ColumnLayouts = ReadonlyMap<string, ColumnLayout>;

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
  const presentation = layout.get(cell.column.id)!;
  const content = flexRender(cell.column.columnDef.cell, { ...cell.getContext(), table });
  const meta = cell.column.columnDef.meta as { align?: string } | undefined;
  return (
    <td
      className={styles.Cell}
      style={presentation.style}
      data-ov-pinned={presentation.pinned}
      data-ov-align={meta?.align}
    >
      <span className={styles.CellContent}>
        {content}
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
  state,
  layout,
  measureRef,
  getRowProps,
  onRowClick,
}: VirtualRowProps<TData>) {
  const { className, style, onClick, ...extraProps } = useMemo(
    () => getRowProps?.(row) ?? {},
    [row, state, layout, getRowProps],
  );
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
              ) return;
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

type Slot<TData extends RowData> = { key: string; row: DataTableRow<TData>; detail: boolean };

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
  'use no memo';
  const context = useDataTableContext<TData>();
  const { table } = context;
  const scrollElement = useScrollElement();
  const rows = useMemo(() => table.getRowModel().rows, [table, context.state, context.options]);
  const { state, options } = context;
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
      state.columnResizing,
    ],
  );
  const columns = table.getVisibleLeafColumns();
  const layout = useMemo(
    // Mutable column getters stay inside the existing virtualizer boundary.
    () => new Map<string, ColumnLayout>(columns.map((column) => [
      column.id,
      {
        style: { ...getCellSizeStyles(column), ...getPinningStyles(column) },
        pinned: column.getIsPinned() || undefined,
      },
    ])),
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
  clickRef.current = onRowClick;
  const handleClick = useCallback(
    (row: DataTableRow<TData>, event: MouseEvent<HTMLTableRowElement>) => clickRef.current?.(row, event),
    [],
  );

  if (rows.length === 0) return null;
  const bodyStyle = {
    ...style,
    '--_dt-body-height': `${virtualizer.getTotalSize()}px`,
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

export const DataTableVirtualBody = forwardRef(VirtualBodyInner) as <TData extends RowData = RowData>(
  props: DataTableVirtualBodyProps<TData> & RefAttributes<HTMLTableSectionElement>,
) => ReactElement | null;
