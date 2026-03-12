import { describe } from 'vitest';
import { CommandList } from '@omniview/base-ui';
import type { CommandItemMeta } from '@omniview/base-ui';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeCommandItems, type CommandItem } from '../utils/factories';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const itemKey = (item: CommandItem) => item.id;
const getTextValue = (item: CommandItem) => item.label;
const renderItem = (item: CommandItem, meta: CommandItemMeta) => (
  <CommandList.Item itemKey={meta.key}>
    <CommandList.ItemLabel>{item.label}</CommandList.ItemLabel>
  </CommandList.Item>
);

// Pre-generate data
const items500 = makeCommandItems(500);
const items600 = makeCommandItems(600);
const items25 = makeCommandItems(25);

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function CommandListBench({ items }: { items: CommandItem[] }) {
  return (
    <CommandList
      items={items}
      itemKey={itemKey}
      getTextValue={getTextValue}
      renderItem={renderItem}
    >
      <CommandList.Results />
    </CommandList>
  );
}

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe('CommandList', () => {
  benchRender('mount 500 items', () => <CommandListBench items={items500} />, TIER_1_OPTIONS);

  benchRerender(
    'data change (500 -> 600 items)',
    { initialProps: { items: items500 }, updatedProps: { items: items600 } },
    (props) => <CommandListBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 20 instances (25 items each)',
    20,
    (i) => <CommandListBench key={i} items={items25} />,
    TIER_1_OPTIONS,
  );
});
