import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Chip } from '@omniview/base-ui';

describe('Chip', () => {
  benchRender(
    'mount',
    () => <Chip>Label</Chip>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'variant change',
    {
      initialProps: { variant: 'soft' as const },
      updatedProps: { variant: 'outline' as const },
    },
    (props) => <Chip {...props}>Label</Chip>,
    TIER_2_OPTIONS,
  );
});
