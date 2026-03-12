import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Radio } from '@omniview/base-ui';

describe('Radio', () => {
  benchRender('mount', () => (
    <Radio value="option-1">Option 1</Radio>
  ), TIER_2_OPTIONS);

  benchRerender(
    'disabled toggle',
    { initialProps: { disabled: false }, updatedProps: { disabled: true } },
    (props) => (
      <Radio value="option-1" {...props}>Option 1</Radio>
    ),
    TIER_2_OPTIONS,
  );
});
