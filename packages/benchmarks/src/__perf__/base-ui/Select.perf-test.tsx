import { test } from 'vitest';
import { measureRenders } from 'reassure';
import { fireEvent, screen } from '@testing-library/react';
import { Select } from '@omniview/base-ui';
import { makeOptions } from '../../utils/factories';
import { ThemeWrapper } from '../utils/theme-wrapper';

const options = makeOptions(20);

test('Select: mount with 20 options', async () => {
  await measureRenders(
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
    </Select>,
    { wrapper: ThemeWrapper },
  );
});

/**
 * Opening a Select triggers portal mount, positioner layout, and popup render.
 * High render counts here signal excessive context notifications.
 */
test('Select: open dropdown', async () => {
  await measureRenders(
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
    </Select>,
    {
      wrapper: ThemeWrapper,
      scenario: async () => {
        const trigger = screen.getByRole('combobox');
        fireEvent.click(trigger);
      },
    },
  );
});
