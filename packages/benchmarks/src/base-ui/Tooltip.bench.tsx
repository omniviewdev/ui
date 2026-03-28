import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Tooltip } from '@omniviewdev/base-ui';

describe('Tooltip', () => {
  benchRender(
    'mount',
    () => (
      <Tooltip>
        <Tooltip.Trigger>Hover me</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'open toggle',
    {
      initialProps: { open: false },
      updatedProps: { open: true },
    },
    (props) => (
      <Tooltip open={props.open}>
        <Tooltip.Trigger>Hover me</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
    ),
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 100', 100, (i) => (
    <Tooltip key={i}>
      <Tooltip.Trigger>Item {i}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>Tooltip {i}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip>
  ), TIER_2_OPTIONS);
});
