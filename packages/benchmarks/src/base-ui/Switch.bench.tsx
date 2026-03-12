import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Switch } from '@omniview/base-ui';

describe('Switch', () => {
  benchRender('mount', () => (
    <Switch aria-label="Toggle feature">Enable notifications</Switch>
  ), TIER_2_OPTIONS);

  benchRerender(
    'checked toggle',
    { initialProps: { checked: false }, updatedProps: { checked: true } },
    (props) => (
      <Switch aria-label="Toggle feature" {...props}>Enable notifications</Switch>
    ),
    TIER_2_OPTIONS,
  );
});
