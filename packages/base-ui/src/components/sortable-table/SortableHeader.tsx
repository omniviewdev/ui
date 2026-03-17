import { useCallback, type ReactNode } from 'react';
import type { SortConfig } from './useSortableTable';
import styles from './SortableHeader.module.css';

export interface SortableHeaderProps {
  columnId: string;
  sort: SortConfig;
  onSort: (columnId: string) => void;
  sortable?: boolean;
  children: ReactNode;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' }) {
  const label = direction === 'asc' ? 'Sorted ascending' : 'Sorted descending';
  return (
    <svg
      className={styles.SortIcon}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      {direction === 'asc' ? (
        <path d="M5 2L8.5 7H1.5L5 2Z" />
      ) : (
        <path d="M5 8L1.5 3H8.5L5 8Z" />
      )}
    </svg>
  );
}

export function SortableHeader({
  columnId,
  sort,
  onSort,
  sortable = true,
  children,
}: SortableHeaderProps) {
  const isActive = sort.key === columnId;

  const handleClick = useCallback(() => {
    onSort(columnId);
  }, [onSort, columnId]);

  if (!sortable) {
    return <span className={styles.Root}>{children}</span>;
  }

  return (
    <button
      type="button"
      className={styles.Root}
      data-ov-sortable="true"
      data-ov-active={isActive ? 'true' : undefined}
      onClick={handleClick}
    >
      {children}
      {isActive && <SortIcon direction={sort.direction} />}
    </button>
  );
}
