import { describe } from 'vitest';
import { CommandList } from '@omniview/base-ui';
import type { CommandItemMeta } from '@omniview/base-ui';
import { benchRender, benchRerender } from '../utils/bench-render';
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
const items200 = makeCommandItems(200);
const items300 = makeCommandItems(300);

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
  benchRender('mount 200 items', () => <CommandListBench items={items200} />, TIER_1_OPTIONS);

  benchRerender(
    'data change (200 -> 300 items)',
    { initialProps: { items: items200 }, updatedProps: { items: items300 } },
    (props) => <CommandListBench {...props} />,
    TIER_1_OPTIONS,
  );
});
