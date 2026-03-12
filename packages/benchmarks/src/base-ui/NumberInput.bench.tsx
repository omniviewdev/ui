import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { NumberInput } from '@omniview/base-ui';

describe('NumberInput', () => {
  benchRender('mount', () => (
    <NumberInput defaultValue={0}>
      <NumberInput.Label>Quantity</NumberInput.Label>
      <NumberInput.Group>
        <NumberInput.Decrement />
        <NumberInput.Input />
        <NumberInput.Increment />
      </NumberInput.Group>
    </NumberInput>
  ), TIER_2_OPTIONS);

  benchRerender(
    'disabled toggle',
    { initialProps: { disabled: false }, updatedProps: { disabled: true } },
    (props) => (
      <NumberInput defaultValue={0} {...props}>
        <NumberInput.Label>Quantity</NumberInput.Label>
        <NumberInput.Group>
          <NumberInput.Decrement />
          <NumberInput.Input />
          <NumberInput.Increment />
        </NumberInput.Group>
      </NumberInput>
    ),
    TIER_2_OPTIONS,
  );
});
