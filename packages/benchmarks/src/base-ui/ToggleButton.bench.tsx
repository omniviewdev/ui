import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ToggleButton } from '@omniview/base-ui';

describe('ToggleButton', () => {
  benchRender(
    'mount',
    () => <ToggleButton value="bold">Bold</ToggleButton>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'pressed toggle',
    {
      initialProps: { pressed: false as boolean },
      updatedProps: { pressed: true as boolean },
    },
    (props) => (
      <ToggleButton value="bold" pressed={props.pressed}>
        Bold
      </ToggleButton>
    ),
    TIER_2_OPTIONS,
  );
});
