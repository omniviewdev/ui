import { describe } from 'vitest';
import { Select as OvSelect } from '@omniviewdev/base-ui';
import MuiSelect from '@mui/material/Select';
import MuiMenuItem from '@mui/material/MenuItem';
import { benchCompare } from '../utils/bench-compare';
import { wrapOv, wrapMui, wrapRaw } from './implementations/wrappers';

const options = Array.from({ length: 5 }, (_, i) => ({
  value: `option-${i}`,
  label: `Option ${i}`,
}));

describe('Select competitive', () => {
  benchCompare('mount (closed)', {
    'raw': () => wrapRaw(
      <select defaultValue="option-0">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>,
    ),
    '@omniviewdev/base-ui': () => wrapOv(
      <OvSelect.Root defaultValue="option-0">
        <OvSelect.Trigger>
          <OvSelect.Value placeholder="Choose..." />
        </OvSelect.Trigger>
        <OvSelect.Portal>
          <OvSelect.Positioner>
            <OvSelect.Popup>
              <OvSelect.List>
                {options.map((o) => (
                  <OvSelect.Item key={o.value} value={o.value}>
                    <OvSelect.ItemText>{o.label}</OvSelect.ItemText>
                  </OvSelect.Item>
                ))}
              </OvSelect.List>
            </OvSelect.Popup>
          </OvSelect.Positioner>
        </OvSelect.Portal>
      </OvSelect.Root>,
    ),
    '@mui/material': () => wrapMui(
      <MuiSelect defaultValue="option-0" size="small">
        {options.map((o) => (
          <MuiMenuItem key={o.value} value={o.value}>{o.label}</MuiMenuItem>
        ))}
      </MuiSelect>,
    ),
  });
});
