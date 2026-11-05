import { forwardRef, memo, type CSSProperties, type HTMLAttributes } from 'react';
import { flexRender, type RowData } from '@tanstack/react-table';
import { cn } from '../../system/classnames';
import { useDataTableContext, type DataTableContextValue } from './context/DataTableContext';
import { getPinningStyles } from './utils/getPinningStyles';
import { getHeaderSizeStyles } from './utils/getCellSizeStyles';
import styles from './DataTable.module.css';

export type DataTableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

type DataTableHeaderRenderProps = DataTableHeaderProps & {
  context: DataTableContextValue<RowData>;
};

export const DataTableHeader = forwardRef<HTMLTableSectionElement, DataTableHeaderProps>(
  function DataTableHeader(props, ref) {
    const context = useDataTableContext<RowData>();
    return <DataTableHeaderRender {...props} context={context} ref={ref} />;
  },
);

// The subscribed context snapshot is a changing prop at this memo boundary.
const DataTableHeaderRender = memo(
  forwardRef<HTMLTableSectionElement, DataTableHeaderRenderProps>(function DataTableHeaderRender(
    { className, context, ...props },
    ref,
  ) {
    const { table, features, state } = context;
    const isResizing = state.columnResizing.isResizingColumn;

    const headers = table.getHeaderGroups().map((group) => ({
      ...group,
      headers: group.headers.map((header) => ({
        header,
        content: flexRender(header.column.columnDef.header, header.getContext()),
        canSort: features.sorting && header.column.getCanSort(),
        sorted: header.column.getIsSorted(),
        canResize: features.columnResizing && header.column.getCanResize(),
        pinningStyles: getPinningStyles(header.column),
        sizeStyles: getHeaderSizeStyles(header.id, header.column),
        pinned: header.column.getIsPinned() || undefined,
      })),
    }));

    return (
      <thead ref={ref} className={cn(styles.Header, className)} {...props}>
        {headers.map((headerGroup) => (
          <tr key={headerGroup.id} className={styles.HeaderRow}>
            {headerGroup.headers.map(
              ({
                header,
                canSort,
                sorted,
                canResize,
                pinningStyles,
                sizeStyles,
                pinned,
                content,
              }) => {
                const meta = header.column.columnDef.meta as Record<string, unknown> | undefined;
                const align = meta?.align as string | undefined;
                const headerStyle = { ...sizeStyles, ...pinningStyles } as CSSProperties &
                  Record<`--_dt-${string}`, string | number | undefined>;

                const ariaSortValue =
                  sorted === 'asc'
                    ? ('ascending' as const)
                    : sorted === 'desc'
                      ? ('descending' as const)
                      : undefined;

                const sortAriaLabel =
                  (typeof meta?.sortAriaLabel === 'string' ? meta.sortAriaLabel : undefined) ??
                  (typeof header.column.columnDef.header === 'string'
                    ? header.column.columnDef.header
                    : undefined);

                if (process.env.NODE_ENV !== 'production' && canSort && !sortAriaLabel) {
                  console.warn(
                    `DataTable: sortable column "${header.column.id}" has a non-string header ` +
                      `but no meta.sortAriaLabel — the sort button will lack an accessible name.`,
                  );
                }

                return (
                  <th
                    key={header.id}
                    className={styles.HeaderCell}
                    style={
                      {
                        '--_dt-cell-grow': headerStyle['--_dt-cell-grow'],
                        '--_dt-cell-basis': headerStyle['--_dt-cell-basis'],
                        '--_dt-cell-size': headerStyle['--_dt-cell-size'],
                        '--_dt-pin-start': headerStyle['--_dt-pin-start'],
                        '--_dt-pin-end': headerStyle['--_dt-pin-end'],
                        '--_dt-pin-shadow': headerStyle['--_dt-pin-shadow'],
                      } as CSSProperties
                    }
                    aria-sort={ariaSortValue}
                    data-ov-sortable={canSort ? 'true' : 'false'}
                    data-ov-pinned={pinned}
                    data-ov-align={align}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className={styles.SortButton}
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={sortAriaLabel ? `Sort by ${sortAriaLabel}` : undefined}
                      >
                        {content}

                        {/* Intentional: only render the sort indicator when actively sorted.
                          Sortable-but-unsorted columns rely on the cursor/hover style
                          (via data-ov-sortable) rather than a persistent muted glyph,
                          keeping the header row visually clean. */}
                        {sorted && (
                          <span className={styles.SortIndicator} data-ov-active="true">
                            {sorted === 'asc' ? '\u2191' : '\u2193'}
                          </span>
                        )}
                      </button>
                    ) : (
                      content
                    )}

                    {canResize && (
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        tabIndex={0}
                        className={styles.ResizeHandle}
                        data-ov-resizing={isResizing === header.column.id ? 'true' : 'false'}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => header.column.resetSize()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') header.column.resetSize();
                        }}
                      />
                    )}
                  </th>
                );
              },
            )}
          </tr>
        ))}
      </thead>
    );
  }),
);

DataTableHeader.displayName = 'DataTable.Header';
