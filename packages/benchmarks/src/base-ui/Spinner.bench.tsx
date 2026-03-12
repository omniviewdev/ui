import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Spinner } from '@omniview/base-ui';

describe('Spinner', () => {
  benchRender(
    'mount',
    () => <Spinner />,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'size change',
    {
      initialProps: { size: 'md' as const },
      updatedProps: { size: 'lg' as const },
    },
    (props) => <Spinner {...props} />,
    TIER_2_OPTIONS,
  );
});
