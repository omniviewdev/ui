import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Chip } from '@omniviewdev/base-ui';

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

  benchMountMany('mount 200', 200, (i) => <Chip key={i}>Tag {i}</Chip>, TIER_2_OPTIONS);
});
