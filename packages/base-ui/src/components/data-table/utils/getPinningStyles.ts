import type { CSSProperties } from 'react';
import type { RowData } from '@tanstack/react-table';
import type { DataTableColumn } from '../types';

/**
 * Returns CSS custom properties for pinned column offsets and boundary shadows.
 * Data attributes select sticky positioning in the table stylesheet.
 */
export function getPinningStyles<TData extends RowData>(column: DataTableColumn<TData, unknown>): CSSProperties {
  const isPinned = column.getIsPinned();
  if (!isPinned) return {};

  const isLastLeft = isPinned === 'start' && column.getIsLastColumn('start');
  const isFirstRight = isPinned === 'end' && column.getIsFirstColumn('end');

  return {
    '--_dt-pin-start': isPinned === 'start' ? `${column.getStart('start')}px` : undefined,
    '--_dt-pin-end': isPinned === 'end' ? `${column.getAfter('end')}px` : undefined,
    '--_dt-pin-shadow': isLastLeft
      ? 'var(--_dt-pin-shadow-start)'
      : isFirstRight
        ? 'var(--_dt-pin-shadow-end)'
        : undefined,
  } as CSSProperties;
}
