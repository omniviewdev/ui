import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { TextField } from '@omniviewdev/base-ui';

describe('TextField', () => {
  benchRender('mount', () => (
    <TextField>
      <TextField.Label>Label</TextField.Label>
      <TextField.Control placeholder="Enter text" />
    </TextField>
  ), TIER_2_OPTIONS);

  benchRerender(
    'disabled toggle',
    { initialProps: { disabled: false }, updatedProps: { disabled: true } },
    (props) => (
      <TextField {...props}>
        <TextField.Label>Label</TextField.Label>
        <TextField.Control placeholder="Enter text" />
      </TextField>
    ),
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 100', 100, (i) => (
    <TextField key={i}>
      <TextField.Label>Field {i}</TextField.Label>
      <TextField.Control placeholder={`Enter value ${i}`} />
    </TextField>
  ), TIER_2_OPTIONS);
});
