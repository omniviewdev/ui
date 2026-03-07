import type { CSSProperties } from 'react';
import type { Column } from '@tanstack/react-table';

/**
 * Returns inline styles for a pinned column cell (header or body).
 * Uses sticky positioning with computed left/right offsets from TanStack.
 * Adds inset box-shadows at the pinned boundary for visual separation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPinningStyles(column: Column<any, unknown>): CSSProperties {
  const isPinned = column.getIsPinned();
  if (!isPinned) return {};

  const isLastLeft = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRight = isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    position: 'sticky',
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    zIndex: 1,
    boxShadow: isLastLeft
      ? '-4px 0 4px -4px rgb(0 0 0 / 0.12) inset'
      : isFirstRight
        ? '4px 0 4px -4px rgb(0 0 0 / 0.12) inset'
        : undefined,
  };
}
