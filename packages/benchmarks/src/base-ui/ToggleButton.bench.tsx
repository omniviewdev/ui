import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ToggleButton } from '@omniviewdev/base-ui';

describe('ToggleButton', () => {
  benchRender(
    'mount',
    () => <ToggleButton value="bold">Bold</ToggleButton>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'pressed toggle',
    {
      initialProps: { pressed: false },
      updatedProps: { pressed: true },
    },
    (props) => (
      <ToggleButton value="bold" pressed={props.pressed}>
        Bold
      </ToggleButton>
    ),
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 200', 200, (i) => <ToggleButton key={i} value={`opt-${i}`}>Option {i}</ToggleButton>, TIER_2_OPTIONS);
});
