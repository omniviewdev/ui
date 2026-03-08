import { useMemo } from 'react';

export type PaginationItem = number | 'ellipsis';

/**
 * Compute the list of page items to display in a pagination component.
 *
 * Returns an array of page numbers (1-indexed) and `'ellipsis'` sentinels.
 *
 * Algorithm:
 *  1. Always show the first `boundaryCount` pages and last `boundaryCount` pages.
 *  2. Always show `siblingCount` pages on each side of the current page, plus the
 *     current page itself.
 *  3. Insert an `'ellipsis'` between disjoint ranges.
 */
export function buildPaginationRange(
  count: number,
  page: number,
  siblingCount: number,
  boundaryCount: number,
): PaginationItem[] {
  // Utility to create a range [start, end] inclusive
  const range = (start: number, end: number): number[] => {
    const length = Math.max(end - start + 1, 0);
    return Array.from({ length }, (_, i) => start + i);
  };

  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
  // If total pages fit without any ellipsis, return them all
  if (totalPageNumbers >= count) {
    return range(1, count);
  }

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );

  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0]! - 2 : count - 1,
  );

  const items: PaginationItem[] = [...startPages];

  // Left ellipsis
  if (siblingsStart > boundaryCount + 2) {
    items.push('ellipsis');
  } else if (boundaryCount + 1 < count - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  // Sibling pages
  items.push(...range(siblingsStart, siblingsEnd));

  // Right ellipsis
  if (siblingsEnd < count - boundaryCount - 1) {
    items.push('ellipsis');
  } else if (count - boundaryCount >= boundaryCount + 1) {
    items.push(count - boundaryCount);
  }

  items.push(...endPages);

  return items;
}

export function usePaginationRange(
  count: number,
  page: number,
  siblingCount: number,
  boundaryCount: number,
): PaginationItem[] {
  return useMemo(
    () => buildPaginationRange(count, page, siblingCount, boundaryCount),
    [count, page, siblingCount, boundaryCount],
  );
}
