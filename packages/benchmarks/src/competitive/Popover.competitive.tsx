import { describe } from 'vitest';
import { Popover as OvPopover } from '@omniviewdev/base-ui';
import MuiPopover from '@mui/material/Popover';
import { benchCompare } from '../utils/bench-compare';
import { wrapOv, wrapMui, wrapRaw } from './implementations/wrappers';

describe('Popover competitive', () => {
  // Measures overhead of popover machinery when closed.
  // Raw baseline is just the trigger element.
  benchCompare('mount (closed)', {
    'raw': () => wrapRaw(<button type="button">Open</button>),
    '@omniviewdev/base-ui': () => wrapOv(
      <OvPopover.Root>
        <OvPopover.Trigger>Open</OvPopover.Trigger>
        <OvPopover.Portal>
          <OvPopover.Positioner>
            <OvPopover.Popup>Popover content</OvPopover.Popup>
          </OvPopover.Positioner>
        </OvPopover.Portal>
      </OvPopover.Root>,
    ),
    '@mui/material': () => wrapMui(
      <>
        <button type="button">Open</button>
        <MuiPopover open={false} anchorReference="none">
          <div>Popover content</div>
        </MuiPopover>
      </>,
    ),
  });
});
