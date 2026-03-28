import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Radio } from '@omniviewdev/base-ui';

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

  benchMountMany('mount 200', 200, (i) => <Radio key={i} value={`opt-${i}`}>Option {i}</Radio>, TIER_2_OPTIONS);
});
