import type { CSSProperties } from 'react';
import type { RowData } from '@tanstack/react-table';
import type { DataTableColumn } from '../types';

/** Encode arbitrary IDs as CSS identifiers; escape underscores to prevent collisions. */
export function getSizeVariable(id: string, kind: 'col' | 'header' = 'col'): string {
  const key = id.replace(
    /[^a-zA-Z0-9-]/g,
    (character) => `_${character.charCodeAt(0).toString(16)}_`,
  );
  return `--${kind}-${key}-size`;
}

/**
 * Returns CSS custom properties for column sizing.
 * Columns that can resize get flex-grow proportional to their size (fills available space).
 * Fixed columns (enableResizing: false) do NOT flex-grow — they stay at their declared size.
 */
export function getHeaderSizeStyles<TData extends RowData>(
  headerId: string,
  column: DataTableColumn<TData, unknown>,
): CSSProperties {
  const canGrow = column.getCanResize();
  const size = `var(${getSizeVariable(headerId, 'header')})`;
  return {
    '--_dt-cell-grow': canGrow ? size : 0,
    '--_dt-cell-basis': `calc(${size} * 1px)`,
    '--_dt-cell-size': size,
  } as CSSProperties;
}

export function getCellSizeStyles<TData extends RowData>(
  column: DataTableColumn<TData, unknown>,
): CSSProperties {
  const canGrow = column.getCanResize();
  const size = `var(${getSizeVariable(column.id)})`;
  return {
    '--_dt-cell-grow': canGrow ? size : 0,
    '--_dt-cell-basis': `calc(${size} * 1px)`,
    '--_dt-cell-size': size,
  } as CSSProperties;
}
