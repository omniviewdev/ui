import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { FindBar } from '@omniview/base-ui';

describe('FindBar', () => {
  benchRender(
    'mount',
    () => <FindBar open query="" />,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'value change',
    {
      initialProps: { open: true as const, query: '' },
      updatedProps: { open: true as const, query: 'search term' },
    },
    (props) => <FindBar {...props} />,
    TIER_2_OPTIONS,
  );
});
