import { describe } from 'vitest';
import { BasicList } from '@omniview/base-ui';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeRows, type Row } from '../utils/factories';

// Pre-generate data
const rows500 = makeRows(500);
const rows600 = makeRows(600);
const rows25 = makeRows(25);

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
  benchRender('mount 500 items', () => <BasicListBench data={rows500} />, TIER_1_OPTIONS);

  benchRerender(
    'data change (500 -> 600 items)',
    { initialProps: { data: rows500 }, updatedProps: { data: rows600 } },
    (props) => <BasicListBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 20 instances (25 items each)',
    20,
    (i) => <BasicListBench key={i} data={rows25} />,
    TIER_1_OPTIONS,
  );
});
