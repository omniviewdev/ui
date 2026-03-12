import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { Popover } from '@omniview/base-ui';

describe('Popover', () => {
  benchRender(
    'mount (open)',
    () => (
      <Popover defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Info</Popover.Title>
              <Popover.Description>Popover content here.</Popover.Description>
              <Popover.Close>Close</Popover.Close>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
    ),
    TIER_1_OPTIONS,
  );

  benchRerender(
    'open/close toggle',
    {
      initialProps: { open: true },
      updatedProps: { open: false },
    },
    (props) => (
      <Popover open={props.open}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Info</Popover.Title>
              <Popover.Description>Content</Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
    ),
    TIER_1_OPTIONS,
  );

});
