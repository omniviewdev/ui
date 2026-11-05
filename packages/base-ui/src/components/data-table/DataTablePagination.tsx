import { forwardRef, useCallback, type HTMLAttributes } from 'react';
import type { RowData } from '@tanstack/react-table';
import { LuChevronsLeft, LuChevronLeft, LuChevronRight, LuChevronsRight } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import { useDataTableContext, type DataTableContextValue } from './context/DataTableContext';
import { IconButton } from '../icon-button';
import styles from './DataTable.module.css';

export type DataTablePaginationProps = HTMLAttributes<HTMLDivElement>;

function readPaginationSnapshot<TData extends RowData>({ table }: DataTableContextValue<TData>) {
  return { pageCount: table.getPageCount(), totalRows: table.getRowCount() };
}

export const DataTablePagination = forwardRef<HTMLDivElement, DataTablePaginationProps>(
  function DataTablePagination({ className, ...props }, ref) {
    const context = useDataTableContext();
    const { table, state } = context;
    const pageIndex = state.pagination.pageIndex;
    const { pageCount, totalRows } = readPaginationSnapshot(context);

    const handleFirstPage = useCallback(() => table.firstPage(), [table]);
    const handlePreviousPage = useCallback(() => table.previousPage(), [table]);
    const handleNextPage = useCallback(() => table.nextPage(), [table]);
    const handleLastPage = useCallback(() => table.lastPage(), [table]);

    return (
      <div ref={ref} className={cn(styles.Pagination, className)} {...props}>
        <div className={styles.PaginationInfo}>
          <span>
            Page {pageIndex + 1} of {pageCount}
          </span>
          <span>&middot;</span>
          <span>{totalRows} rows</span>
        </div>
        <div className={styles.PaginationControls}>
          <IconButton
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={handleFirstPage}
            disabled={pageIndex <= 0}
            aria-label="First page"
          >
            <LuChevronsLeft />
          </IconButton>
          <IconButton
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={handlePreviousPage}
            disabled={pageIndex <= 0}
            aria-label="Previous page"
          >
            <LuChevronLeft />
          </IconButton>
          <IconButton
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={handleNextPage}
            disabled={pageCount !== -1 && (pageCount === 0 || pageIndex >= pageCount - 1)}
            aria-label="Next page"
          >
            <LuChevronRight />
          </IconButton>
          <IconButton
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={handleLastPage}
            disabled={pageCount !== -1 && (pageCount === 0 || pageIndex >= pageCount - 1)}
            aria-label="Last page"
          >
            <LuChevronsRight />
          </IconButton>
        </div>
      </div>
    );
  },
);

DataTablePagination.displayName = 'DataTable.Pagination';
