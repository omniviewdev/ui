import { forwardRef, type HTMLAttributes } from 'react';
import { LuChevronsLeft, LuChevronLeft, LuChevronRight, LuChevronsRight } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import { IconButton } from '../icon-button';
import styles from './DataTable.module.css';

export type DataTablePaginationProps = HTMLAttributes<HTMLDivElement>;

export const DataTablePagination = forwardRef<HTMLDivElement, DataTablePaginationProps>(
  function DataTablePagination({ className, ...props }, ref) {
    const { table } = useDataTableContext();
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const totalRows = table.getRowCount();

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
            dense
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <LuChevronsLeft />
          </IconButton>
          <IconButton
            dense
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <LuChevronLeft />
          </IconButton>
          <IconButton
            dense
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <LuChevronRight />
          </IconButton>
          <IconButton
            dense
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
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
