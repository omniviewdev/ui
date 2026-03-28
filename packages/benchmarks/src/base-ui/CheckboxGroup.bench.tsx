import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { CheckboxGroup } from '@omniviewdev/base-ui';

describe('CheckboxGroup', () => {
  benchRender('mount with 3 items', () => (
    <CheckboxGroup value={['a']}>
      <CheckboxGroup.Item value="a">Option A</CheckboxGroup.Item>
      <CheckboxGroup.Item value="b">Option B</CheckboxGroup.Item>
      <CheckboxGroup.Item value="c">Option C</CheckboxGroup.Item>
    </CheckboxGroup>
  ), TIER_2_OPTIONS);

  benchRerender(
    'value change',
    { initialProps: { value: ['a'] as string[] }, updatedProps: { value: ['a', 'b'] as string[] } },
    (props) => (
      <CheckboxGroup {...props}>
        <CheckboxGroup.Item value="a">Option A</CheckboxGroup.Item>
        <CheckboxGroup.Item value="b">Option B</CheckboxGroup.Item>
        <CheckboxGroup.Item value="c">Option C</CheckboxGroup.Item>
      </CheckboxGroup>
    ),
    TIER_2_OPTIONS,
  );
});
