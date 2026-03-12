import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Input } from '@omniview/base-ui';

describe('Input', () => {
  benchRender('mount', () => (
    <Input>
      <Input.Label>Label</Input.Label>
      <Input.Control placeholder="Enter text" />
    </Input>
  ), TIER_2_OPTIONS);

  benchRerender(
    'disabled toggle',
    { initialProps: { disabled: false }, updatedProps: { disabled: true } },
    (props) => (
      <Input>
        <Input.Label>Label</Input.Label>
        <Input.Control placeholder="Enter text" {...props} />
      </Input>
    ),
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 100', 100, (i) => (
    <Input key={i}>
      <Input.Label>Field {i}</Input.Label>
      <Input.Control placeholder={`Enter value ${i}`} />
    </Input>
  ), TIER_2_OPTIONS);
});
