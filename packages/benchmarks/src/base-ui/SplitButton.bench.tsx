import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { SplitButton } from '@omniviewdev/base-ui';

describe('SplitButton', () => {
  benchRender(
    'mount',
    () => (
      <SplitButton>
        <SplitButton.Action>Save</SplitButton.Action>
        <SplitButton.Menu>
          <div>Option 1</div>
        </SplitButton.Menu>
      </SplitButton>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'disabled toggle',
    {
      initialProps: { disabled: false },
      updatedProps: { disabled: true },
    },
    (props) => (
      <SplitButton {...props}>
        <SplitButton.Action>Save</SplitButton.Action>
        <SplitButton.Menu>
          <div>Option 1</div>
        </SplitButton.Menu>
      </SplitButton>
    ),
    TIER_2_OPTIONS,
  );
});
