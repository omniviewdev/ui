import { describe } from 'vitest';
import { RowList } from '@omniview/base-ui';
import type { ColumnDef } from '@omniview/base-ui';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
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
const rows500 = makeRows(500);
const rows600 = makeRows(600);
const rows25 = makeRows(25);

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
  benchRender('mount 500 rows', () => <RowListBench data={rows500} />, TIER_1_OPTIONS);

  benchRerender(
    'data change (500 -> 600 rows)',
    { initialProps: { data: rows500 }, updatedProps: { data: rows600 } },
    (props) => <RowListBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 20 instances (25 rows each)',
    20,
    (i) => <RowListBench key={i} data={rows25} />,
    TIER_1_OPTIONS,
  );
});
