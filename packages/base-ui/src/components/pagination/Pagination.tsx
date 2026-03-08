import { forwardRef, type HTMLAttributes, useCallback } from 'react';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import { usePaginationRange } from './usePaginationRange';
import styles from './Pagination.module.css';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Total number of pages. */
  count: number;
  /** Current active page (1-indexed). */
  page: number;
  /** Called when the user selects a page. */
  onChange: (page: number) => void;
  /** Number of sibling pages to show on each side of the current page. @default 1 */
  siblingCount?: number;
  /** Number of boundary pages to always show at start/end. @default 1 */
  boundaryCount?: number;
  /** Whether to show first/last navigation buttons. @default true */
  showFirstLast?: boolean;
  /** Component size. @default 'md' */
  size?: ComponentSize;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    className,
    count,
    page,
    onChange,
    siblingCount = 1,
    boundaryCount = 1,
    showFirstLast = true,
    size = 'md',
    ...props
  },
  ref,
) {
  const items = usePaginationRange(count, page, siblingCount, boundaryCount);

  const handleClick = useCallback(
    (target: number) => () => {
      if (target >= 1 && target <= count) {
        onChange(target);
      }
    },
    [count, onChange],
  );

  const isFirstPage = page <= 1;
  const isLastPage = page >= count;

  return (
    <nav
      ref={ref}
      aria-label="pagination"
      className={cn(styles.Root, className)}
      data-ov-size={size}
      {...props}
    >
      {showFirstLast && (
        <button
          type="button"
          className={styles.Item}
          aria-label="Go to first page"
          disabled={isFirstPage}
          onClick={handleClick(1)}
        >
          {'\u00AB'}
        </button>
      )}

      <button
        type="button"
        className={styles.Item}
        aria-label="Go to previous page"
        disabled={isFirstPage}
        onClick={handleClick(page - 1)}
      >
        {'\u2039'}
      </button>

      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className={styles.Ellipsis} aria-hidden="true">
            {'\u2026'}
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={styles.Item}
            aria-current={item === page ? 'page' : undefined}
            data-ov-active={item === page ? 'true' : undefined}
            onClick={handleClick(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.Item}
        aria-label="Go to next page"
        disabled={isLastPage}
        onClick={handleClick(page + 1)}
      >
        {'\u203A'}
      </button>

      {showFirstLast && (
        <button
          type="button"
          className={styles.Item}
          aria-label="Go to last page"
          disabled={isLastPage}
          onClick={handleClick(count)}
        >
          {'\u00BB'}
        </button>
      )}
    </nav>
  );
});

Pagination.displayName = 'Pagination';
