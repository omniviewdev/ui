import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { Spacing } from '../../system/types';
import styles from './Grid.module.css';

export type GridSpacing = Spacing;

/** Breakpoints matching common responsive design thresholds. */
export type GridBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** A span value can be a plain number or a per-breakpoint responsive object. */
export type ResponsiveSpan = number | Partial<Record<GridBreakpoint, number>>;

interface GridBaseProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: GridSpacing;
  rowSpacing?: GridSpacing;
  columnSpacing?: GridSpacing;
}

interface GridPropsWithColumns extends GridBaseProps {
  columns?: number;
  minChildWidth?: never;
}

interface GridPropsWithMinChildWidth extends GridBaseProps {
  columns?: never;
  minChildWidth?: string;
}

export type GridProps = GridPropsWithColumns | GridPropsWithMinChildWidth;

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Column span — number for all sizes, or { xs: 12, md: 6 } for responsive. */
  span?: ResponsiveSpan;
  rowSpan?: number;
}

const BREAKPOINTS: GridBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

function spanDataAttributes(span: ResponsiveSpan | undefined): Record<string, number> {
  if (span == null) return {};
  if (typeof span === 'number') return { 'data-ov-span': span };

  const attrs: Record<string, number> = {};
  for (const bp of BREAKPOINTS) {
    if (span[bp] != null) {
      attrs[`data-ov-span-${bp}`] = span[bp]!;
    }
  }
  return attrs;
}

const GridRoot = forwardRef<HTMLDivElement, GridProps>(function GridRoot(
  { className, style, columns, minChildWidth, spacing = 2, rowSpacing, columnSpacing, ...props },
  ref,
) {
  const isAuto = minChildWidth != null;
  const effectiveColumns = isAuto ? undefined : (columns ?? 12);

  const mergedStyle: CSSProperties = isAuto
    ? ({ '--_ov-min-child-width': minChildWidth, ...style } as CSSProperties)
    : { ...style };

  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      style={mergedStyle}
      data-ov-grid-mode={isAuto ? 'auto' : 'fixed'}
      {...(effectiveColumns != null ? { 'data-ov-columns': effectiveColumns } : undefined)}
      data-ov-spacing={spacing}
      {...(rowSpacing != null ? { 'data-ov-row-spacing': rowSpacing } : undefined)}
      {...(columnSpacing != null ? { 'data-ov-column-spacing': columnSpacing } : undefined)}
      {...props}
    />
  );
});

GridRoot.displayName = 'Grid';

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(function GridItem(
  { className, span, rowSpan, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Item, className)}
      {...spanDataAttributes(span)}
      {...(rowSpan != null ? { 'data-ov-row-span': rowSpan } : undefined)}
      {...props}
    />
  );
});

GridItem.displayName = 'GridItem';

type GridCompound = typeof GridRoot & { Item: typeof GridItem };

export const Grid = Object.assign(GridRoot, { Item: GridItem }) as GridCompound;
