import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { TextField } from '@omniview/base-ui';

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
});
