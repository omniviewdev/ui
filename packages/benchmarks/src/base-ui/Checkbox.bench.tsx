import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Checkbox } from '@omniview/base-ui';

describe('Checkbox', () => {
  benchRender('mount', () => <Checkbox />, TIER_2_OPTIONS);
  benchRerender(
    'checked toggle',
    { initialProps: { checked: false }, updatedProps: { checked: true } },
    (props) => <Checkbox {...props} />,
    TIER_2_OPTIONS,
  );
  benchMountMany('mount 200', 200, (i) => <Checkbox key={i} />, TIER_2_OPTIONS);
});
