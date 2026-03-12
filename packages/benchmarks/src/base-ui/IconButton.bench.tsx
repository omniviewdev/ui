import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { IconButton } from '@omniview/base-ui';

describe('IconButton', () => {
  benchRender(
    'mount',
    () => <IconButton aria-label="Edit"><span>E</span></IconButton>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'variant change',
    {
      initialProps: { variant: 'soft' as const, 'aria-label': 'Edit' },
      updatedProps: { variant: 'outline' as const, 'aria-label': 'Edit' },
    },
    (props) => <IconButton {...props}><span>E</span></IconButton>,
    TIER_2_OPTIONS,
  );
});
