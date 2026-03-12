import { describe } from 'vitest';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { DataTable } from '@omniview/base-ui';
import { benchRender, benchRerender } from '../utils/bench-render';
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
const rows200 = makeRows(200);

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

  benchRerender(
    'data change (100 → 200 rows)',
    { initialProps: { data: rows100 }, updatedProps: { data: rows200 } },
    (props) => <DataTableBench {...props} />,
    TIER_1_OPTIONS,
  );
});
