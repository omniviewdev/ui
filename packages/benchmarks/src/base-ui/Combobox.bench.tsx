import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeOptions, type Option } from '../utils/factories';
import { Combobox } from '@omniview/base-ui';

const options100 = makeOptions(100);
const options200 = makeOptions(200);
const options10 = makeOptions(10);

function ComboboxBench({ options }: { options: Option[] }) {
  return (
    <Combobox.Root
      items={options}
      itemToStringLabel={(item: Option) => item.label}
      itemToStringValue={(item: Option) => item.value}
      defaultOpen
    >
      <Combobox.Input placeholder="Select..." />
      <Combobox.Trigger aria-label="Open" />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.List>
              {(item: Option) => (
                <Combobox.Item key={item.value} value={item}>
                  {item.label}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

describe('Combobox', () => {
  benchRender(
    'mount with 100 options',
    () => <ComboboxBench options={options100} />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'options change (100 → 200)',
    { initialProps: { options: options100 }, updatedProps: { options: options200 } },
    (props) => <ComboboxBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 100 instances (10 options each)',
    100,
    (i) => <ComboboxBench key={i} options={options10} />,
    TIER_1_OPTIONS,
  );
});
