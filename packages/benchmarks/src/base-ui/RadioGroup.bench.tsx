import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { RadioGroup } from '@omniviewdev/base-ui';

describe('RadioGroup', () => {
  benchRender('mount with 3 items', () => (
    <RadioGroup defaultValue="a">
      <RadioGroup.Item value="a">Option A</RadioGroup.Item>
      <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      <RadioGroup.Item value="c">Option C</RadioGroup.Item>
    </RadioGroup>
  ), TIER_2_OPTIONS);

  benchRerender(
    'value change',
    { initialProps: { value: 'a' }, updatedProps: { value: 'b' } },
    (props) => (
      <RadioGroup {...props}>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
        <RadioGroup.Item value="c">Option C</RadioGroup.Item>
      </RadioGroup>
    ),
    TIER_2_OPTIONS,
  );
});
