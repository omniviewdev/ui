import { describe } from 'vitest';
import { BasicList } from '@omniview/base-ui';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeRows, type Row } from '../utils/factories';

// Pre-generate data
const rows200 = makeRows(200);
const rows300 = makeRows(300);

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function BasicListBench({ data }: { data: Row[] }) {
  return (
    <BasicList>
      <BasicList.Viewport>
        {data.map((row) => (
          <BasicList.Item key={row.id} itemKey={row.id} textValue={row.name}>
            <BasicList.ItemLabel>{row.name}</BasicList.ItemLabel>
            <BasicList.ItemMeta>{row.status}</BasicList.ItemMeta>
          </BasicList.Item>
        ))}
      </BasicList.Viewport>
    </BasicList>
  );
}

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe('BasicList', () => {
  benchRender('mount 200 items', () => <BasicListBench data={rows200} />, TIER_1_OPTIONS);

  benchRerender(
    'data change (200 -> 300 items)',
    { initialProps: { data: rows200 }, updatedProps: { data: rows300 } },
    (props) => <BasicListBench {...props} />,
    TIER_1_OPTIONS,
  );
});
