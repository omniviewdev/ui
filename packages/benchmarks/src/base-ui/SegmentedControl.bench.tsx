import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { SegmentedControl } from '@omniviewdev/base-ui';

describe('SegmentedControl', () => {
  benchRender(
    'mount with 3 items',
    () => (
      <SegmentedControl defaultValue="a">
        <SegmentedControl.Item value="a">Option A</SegmentedControl.Item>
        <SegmentedControl.Item value="b">Option B</SegmentedControl.Item>
        <SegmentedControl.Item value="c">Option C</SegmentedControl.Item>
      </SegmentedControl>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'value change',
    {
      initialProps: { value: 'a' as string },
      updatedProps: { value: 'c' as string },
    },
    (props) => (
      <SegmentedControl value={props.value}>
        <SegmentedControl.Item value="a">Option A</SegmentedControl.Item>
        <SegmentedControl.Item value="b">Option B</SegmentedControl.Item>
        <SegmentedControl.Item value="c">Option C</SegmentedControl.Item>
      </SegmentedControl>
    ),
    TIER_2_OPTIONS,
  );
});
