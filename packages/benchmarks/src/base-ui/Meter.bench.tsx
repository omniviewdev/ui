import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Meter } from '@omniview/base-ui';

describe('Meter', () => {
  benchRender(
    'mount',
    () => <Meter value={60} label="CPU Usage" />,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'value change',
    {
      initialProps: { value: 60, label: 'CPU Usage' as const },
      updatedProps: { value: 85, label: 'CPU Usage' as const },
    },
    (props) => <Meter {...props} />,
    TIER_2_OPTIONS,
  );
});
