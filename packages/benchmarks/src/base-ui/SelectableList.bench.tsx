import { describe } from 'vitest';
import { SelectableList } from '@omniview/base-ui';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeRows, type Row } from '../utils/factories';

// Pre-generate data
const rows500 = makeRows(500);
const rows25 = makeRows(25);

// Pre-compute selection sets
const noSelection = new Set<number>();
const fiftySelected = new Set<number>(Array.from({ length: 50 }, (_, i) => i));

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function SelectableListBench({
  data,
  selectedKeys,
}: {
  data: Row[];
  selectedKeys?: ReadonlySet<number>;
}) {
  return (
    <SelectableList selectionMode="multiple" selectedKeys={selectedKeys}>
      <SelectableList.Viewport>
        {data.map((row) => (
          <SelectableList.Item key={row.id} itemKey={row.id} textValue={row.name}>
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>{row.name}</SelectableList.ItemLabel>
            <SelectableList.ItemMeta>{row.status}</SelectableList.ItemMeta>
          </SelectableList.Item>
        ))}
      </SelectableList.Viewport>
    </SelectableList>
  );
}

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe('SelectableList', () => {
  benchRender(
    'mount 500 items',
    () => <SelectableListBench data={rows500} />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'selection change (0 -> 50 selected)',
    {
      initialProps: { data: rows500, selectedKeys: noSelection },
      updatedProps: { data: rows500, selectedKeys: fiftySelected },
    },
    (props) => <SelectableListBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 20 instances (25 items each)',
    20,
    (i) => <SelectableListBench key={i} data={rows25} />,
    TIER_1_OPTIONS,
  );
});
