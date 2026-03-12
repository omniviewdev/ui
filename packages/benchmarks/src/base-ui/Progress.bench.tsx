import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Progress } from '@omniview/base-ui';

describe('Progress', () => {
  benchRender(
    'mount',
    () => <Progress value={50} />,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'value change',
    {
      initialProps: { value: 50 },
      updatedProps: { value: 80 },
    },
    (props) => <Progress {...props} />,
    TIER_2_OPTIONS,
  );
});
