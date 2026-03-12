import { describe } from 'vitest';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { DataTable } from '@omniview/base-ui';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeRows, type Row } from '../utils/factories';

const columnHelper = createColumnHelper<Row>();

const columns: ColumnDef<Row, unknown>[] = [
  columnHelper.accessor('id', { header: 'ID' }),
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('value', { header: 'Value' }),
];

const rows100 = makeRows(100);
const rows500 = makeRows(500);
const rows600 = makeRows(600);

function DataTableBench({ data }: { data: Row[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTable table={table}>
      <DataTable.Container>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable>
  );
}

describe('DataTable', () => {
  benchRender('mount 100 rows', () => <DataTableBench data={rows100} />, TIER_1_OPTIONS);
  benchRender('mount 500 rows', () => <DataTableBench data={rows500} />, TIER_1_OPTIONS);

  benchRerender(
    'data change (500 → 600 rows)',
    { initialProps: { data: rows500 }, updatedProps: { data: rows600 } },
    (props) => <DataTableBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 50 tables (10 rows each)',
    50,
    (i) => <DataTableBench key={i} data={rows100.slice(0, 10)} />,
    TIER_1_OPTIONS,
  );
});
