import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Table.module.css';

export type TableLayout = 'auto' | 'fixed';
export type TableCellAlign = 'left' | 'center' | 'right';
export type TableCellTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger';

export interface TableProps
  extends Omit<TableHTMLAttributes<HTMLTableElement>, 'color'>, StyledComponentProps {
  layout?: TableLayout;
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
}

export interface TableContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  maxHeight?: number | string;
}

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;
export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;
export type TableFooterProps = HTMLAttributes<HTMLTableSectionElement>;

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  interactive?: boolean;
}

interface TableCellBaseProps {
  align?: TableCellAlign;
  numeric?: boolean;
  mono?: boolean;
  truncate?: boolean;
  tone?: TableCellTone;
}

export interface TableCellProps
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'color' | 'align'>, TableCellBaseProps {}

export interface TableHeaderCellProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'color' | 'align'>, TableCellBaseProps {}

export interface TableCaptionProps extends Omit<HTMLAttributes<HTMLTableCaptionElement>, 'color'> {
  side?: 'top' | 'bottom';
}

function resolveAlign(align: TableCellAlign | undefined, numeric: boolean): TableCellAlign {
  if (align !== undefined) {
    return align;
  }

  if (numeric) {
    return 'right';
  }

  return 'left';
}

function toMaxHeight(maxHeight?: number | string): string | undefined {
  if (typeof maxHeight === 'number') {
    return `${maxHeight}px`;
  }

  return maxHeight;
}

const TableRoot = forwardRef<HTMLTableElement, TableProps>(function TableRoot(
  {
    className,
    variant,
    color,
    size,
    layout = 'auto',
    striped = false,
    hoverable = false,
    stickyHeader = false,
    ...props
  },
  ref,
) {
  return (
    <table
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-layout={layout}
      data-ov-striped={striped ? 'true' : 'false'}
      data-ov-hoverable={hoverable ? 'true' : 'false'}
      data-ov-sticky-header={stickyHeader ? 'true' : 'false'}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    />
  );
});

const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(function TableContainer(
  { className, maxHeight, style, ...props },
  ref,
) {
  const containerStyle: CSSProperties = {
    ...style,
    maxHeight: toMaxHeight(maxHeight),
  };

  return (
    <div ref={ref} className={cn(styles.Container, className)} style={containerStyle} {...props} />
  );
});

const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, ...props },
  ref,
) {
  return <thead ref={ref} className={cn(styles.Head, className)} {...props} />;
});

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, ...props },
  ref,
) {
  return <tbody ref={ref} className={cn(styles.Body, className)} {...props} />;
});

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(function TableFooter(
  { className, ...props },
  ref,
) {
  return <tfoot ref={ref} className={cn(styles.Footer, className)} {...props} />;
});

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected = false, interactive = false, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={cn(styles.Row, className)}
      data-ov-selected={selected ? 'true' : 'false'}
      data-ov-interactive={interactive ? 'true' : 'false'}
      {...props}
    />
  );
});

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, align, numeric = false, mono = false, truncate = false, tone = 'default', ...props },
  ref,
) {
  return (
    <td
      ref={ref}
      className={cn(styles.Cell, className)}
      data-ov-align={resolveAlign(align, numeric)}
      data-ov-mono={mono ? 'true' : 'false'}
      data-ov-truncate={truncate ? 'true' : 'false'}
      data-ov-tone={tone}
      {...props}
    />
  );
});

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell(
    {
      className,
      align,
      numeric = false,
      mono = false,
      truncate = false,
      tone = 'default',
      scope = 'col',
      ...props
    },
    ref,
  ) {
    return (
      <th
        ref={ref}
        scope={scope}
        className={cn(styles.HeaderCell, className)}
        data-ov-align={resolveAlign(align, numeric)}
        data-ov-mono={mono ? 'true' : 'false'}
        data-ov-truncate={truncate ? 'true' : 'false'}
        data-ov-tone={tone}
        {...props}
      />
    );
  },
);

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(function TableCaption(
  { className, side = 'bottom', ...props },
  ref,
) {
  return (
    <caption ref={ref} className={cn(styles.Caption, className)} data-ov-side={side} {...props} />
  );
});

type TableCompound = typeof TableRoot & {
  Root: typeof TableRoot;
  Container: typeof TableContainer;
  Head: typeof TableHead;
  Body: typeof TableBody;
  Footer: typeof TableFooter;
  Row: typeof TableRow;
  Cell: typeof TableCell;
  HeaderCell: typeof TableHeaderCell;
  Caption: typeof TableCaption;
};

TableRoot.displayName = 'Table';
TableContainer.displayName = 'Table.Container';
TableHead.displayName = 'Table.Head';
TableBody.displayName = 'Table.Body';
TableFooter.displayName = 'Table.Footer';
TableRow.displayName = 'Table.Row';
TableCell.displayName = 'Table.Cell';
TableHeaderCell.displayName = 'Table.HeaderCell';
TableCaption.displayName = 'Table.Caption';

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  Container: TableContainer,
  Head: TableHead,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Cell: TableCell,
  HeaderCell: TableHeaderCell,
  Caption: TableCaption,
}) as TableCompound;
