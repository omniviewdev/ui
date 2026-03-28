import { describe } from 'vitest';
import { RowList } from '@omniviewdev/base-ui';
import type { ColumnDef } from '@omniviewdev/base-ui';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeRows, type Row } from '../utils/factories';

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns: ColumnDef[] = [
  { id: 'id', header: 'ID', width: '60px' },
  { id: 'name', header: 'Name', width: '1fr' },
  { id: 'status', header: 'Status', width: '100px' },
  { id: 'value', header: 'Value', width: '80px', align: 'end' },
];

// Pre-generate data
const rows200 = makeRows(200);
const rows300 = makeRows(300);

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function RowListBench({ data }: { data: Row[] }) {
  return (
    <RowList columns={columns}>
      <RowList.Header />
      <RowList.Viewport>
        {data.map((row) => (
          <RowList.Item key={row.id} itemKey={row.id} textValue={row.name}>
            <RowList.Cell column="id">{row.id}</RowList.Cell>
            <RowList.Cell column="name">{row.name}</RowList.Cell>
            <RowList.Cell column="status">{row.status}</RowList.Cell>
            <RowList.Cell column="value">{row.value}</RowList.Cell>
          </RowList.Item>
        ))}
      </RowList.Viewport>
    </RowList>
  );
}

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe('RowList', () => {
  benchRender('mount 200 rows', () => <RowListBench data={rows200} />, TIER_1_OPTIONS);

  benchRerender(
    'data change (200 -> 300 rows)',
    { initialProps: { data: rows200 }, updatedProps: { data: rows300 } },
    (props) => <RowListBench {...props} />,
    TIER_1_OPTIONS,
  );
});
