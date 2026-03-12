import { describe, bench } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { DataTable, ThemeProvider } from '@omniview/base-ui';

interface Row {
  id: number;
  name: string;
  status: string;
  value: number;
}

const columnHelper = createColumnHelper<Row>();

const columns: ColumnDef<Row, unknown>[] = [
  columnHelper.accessor('id', { header: 'ID' }),
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('value', { header: 'Value' }),
];

function generateRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'inactive',
    value: (i * 7 + 13) % 1000,
  }));
}

// Pre-generate data so row construction isn't measured
const rows100 = generateRows(100);
const rows1000 = generateRows(1000);

/**
 * Wrapper component that calls useReactTable internally and renders
 * DataTable with its compound children.
 */
function DataTableBench({ data }: { data: Row[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTable table={table}>
      <DataTable.Header />
      <DataTable.Body />
    </DataTable>
  );
}

function wrapWithTheme(element: React.ReactElement) {
  return createElement(ThemeProvider, { persist: false }, element);
}

describe('DataTable', () => {
  // Raw bench() used here because DataTable requires useReactTable() internally,
  // so the generic benchRender/benchRerender helpers don't apply.
  bench('mount 100 rows', () => {
    render(wrapWithTheme(<DataTableBench data={rows100} />));
    cleanup();
  });

  bench('mount 1000 rows', () => {
    render(wrapWithTheme(<DataTableBench data={rows1000} />));
    cleanup();
  });
});
