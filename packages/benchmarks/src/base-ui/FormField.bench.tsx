import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { FormField } from '@omniview/base-ui';

describe('FormField', () => {
  benchRender('mount', () => (
    <FormField label="Username" htmlFor="username" description="Choose a unique username">
      <input id="username" type="text" />
    </FormField>
  ), TIER_2_OPTIONS);

  benchRerender(
    'error toggle',
    {
      initialProps: { error: undefined as string | undefined },
      updatedProps: { error: 'This field is required' },
    },
    (props) => (
      <FormField label="Username" htmlFor="username" {...props}>
        <input id="username" type="text" />
      </FormField>
    ),
    TIER_2_OPTIONS,
  );
});
