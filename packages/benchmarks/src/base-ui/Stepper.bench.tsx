import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Stepper } from '@omniviewdev/base-ui';

describe('Stepper', () => {
  benchRender(
    'mount with 3 steps',
    () => (
      <Stepper activeStep={0}>
        <Stepper.Step label="Step 1" description="First step" />
        <Stepper.Step label="Step 2" description="Second step" />
        <Stepper.Step label="Step 3" description="Third step" />
      </Stepper>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'active step change',
    {
      initialProps: { activeStep: 0 as number },
      updatedProps: { activeStep: 2 as number },
    },
    (props) => (
      <Stepper activeStep={props.activeStep}>
        <Stepper.Step label="Step 1" description="First step" />
        <Stepper.Step label="Step 2" description="Second step" />
        <Stepper.Step label="Step 3" description="Third step" />
      </Stepper>
    ),
    TIER_2_OPTIONS,
  );
});
