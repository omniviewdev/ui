import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Meter } from '@omniviewdev/base-ui';

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

  benchMountMany('mount 100', 100, (i) => <Meter key={i} value={i % 100} label={`Metric ${i}`} />, TIER_2_OPTIONS);
});
