import { type HTMLAttributes, type RefAttributes } from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import type { RowData } from '@tanstack/react-table';
import type { DataTableInstance, DataTableFeatureFlags } from './types';
import { DEFAULT_FEATURES } from './constants';
import { DataTableProvider } from './context/DataTableContext';
import styles from './DataTable.module.css';

import { DataTableContainer } from './DataTableContainer';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { DataTableVirtualBody } from './DataTableVirtualBody';
import { DataTableFooter } from './DataTableFooter';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTableColumnVisibility } from './DataTableColumnVisibility';
import { DataTablePagination } from './DataTablePagination';
import { DataTableEmpty } from './DataTableEmpty';
import { DataTableLoading } from './DataTableLoading';
import { DataTableExpansionToggle } from './DataTableExpansionToggle';

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface DataTableRootProps<TData extends RowData = RowData>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, StyledComponentProps {
  table: DataTableInstance<TData>;
  features?: DataTableFeatureFlags;
  stickyHeader?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  ref?: RefAttributes<HTMLDivElement>['ref'];
}

function DataTableRoot<TData extends RowData>(
  {
    className,
    variant,
    color,
    size,
    table,
    features: featuresProp,
    stickyHeader = false,
    hoverable = false,
    striped = false,
    children,
    ref,
    ...props
  }: DataTableRootProps<TData>,
) {
  const features = { ...DEFAULT_FEATURES, ...featuresProp };

  return (
    <DataTableProvider
      table={table}
      features={features}
      stickyHeader={stickyHeader}
      hoverable={hoverable}
      striped={striped}
    >
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-hoverable={hoverable ? 'true' : 'false'}
        data-ov-sticky-header={stickyHeader ? 'true' : 'false'}
        data-ov-striped={striped ? 'true' : 'false'}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      >
        {children}
      </div>
    </DataTableProvider>
  );
}

// ---------------------------------------------------------------------------
// Compound type
// ---------------------------------------------------------------------------

type DataTableCompound = typeof DataTableRoot & {
  Root: typeof DataTableRoot;
  Container: typeof DataTableContainer;
  Header: typeof DataTableHeader;
  Body: typeof DataTableBody;
  VirtualBody: typeof DataTableVirtualBody;
  Footer: typeof DataTableFooter;
  Toolbar: typeof DataTableToolbar;
  ColumnVisibility: typeof DataTableColumnVisibility;
  Pagination: typeof DataTablePagination;
  Empty: typeof DataTableEmpty;
  Loading: typeof DataTableLoading;
  ExpansionToggle: typeof DataTableExpansionToggle;
};

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

DataTableRoot.displayName = 'DataTable';

// ---------------------------------------------------------------------------
// Export compound
// ---------------------------------------------------------------------------

export const DataTable = Object.assign(DataTableRoot, {
  Root: DataTableRoot,
  Container: DataTableContainer,
  Header: DataTableHeader,
  Body: DataTableBody,
  VirtualBody: DataTableVirtualBody,
  Footer: DataTableFooter,
  Toolbar: DataTableToolbar,
  ColumnVisibility: DataTableColumnVisibility,
  Pagination: DataTablePagination,
  Empty: DataTableEmpty,
  Loading: DataTableLoading,
  ExpansionToggle: DataTableExpansionToggle,
}) as DataTableCompound;
