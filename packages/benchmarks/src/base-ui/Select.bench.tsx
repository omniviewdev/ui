import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { makeOptions } from '../utils/factories';
import { Select } from '@omniview/base-ui';

const options = makeOptions(20);

describe('Select', () => {
  benchRender('mount with 20 options', () => (
    <Select defaultValue={options[0]!.value}>
      <Select.Trigger>
        <Select.Value placeholder="Choose..." />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {options.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select>
  ), TIER_2_OPTIONS);

  benchRerender(
    'disabled toggle',
    { initialProps: { disabled: false }, updatedProps: { disabled: true } },
    (props) => (
      <Select defaultValue={options[0]!.value}>
        <Select.Trigger {...props}>
          <Select.Value placeholder="Choose..." />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <Select.List>
                {options.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select>
    ),
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 50', 50, (i) => (
    <Select key={i} defaultValue="option-0">
      <Select.Trigger>
        <Select.Value placeholder="Choose..." />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              <Select.Item value="a">A</Select.Item>
              <Select.Item value="b">B</Select.Item>
              <Select.Item value="c">C</Select.Item>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select>
  ), TIER_2_OPTIONS);
});
