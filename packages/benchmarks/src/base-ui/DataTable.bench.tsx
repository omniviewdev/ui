import { describe } from 'vitest';
import { DataTable, useDataTable, type DataTableColumnDef } from '@omniviewdev/base-ui';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeRows, type Row } from '../utils/factories';

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'value', header: 'Value' },
];

const rows100 = makeRows(100);
const rows200 = makeRows(200);

function DataTableBench({ data }: { data: Row[] }) {
  const table = useDataTable({
    data,
    columns,
  });

  return (
    <DataTable.Root table={table}>
      <DataTable.Container>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
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
