import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Timeline } from '@omniview/base-ui';

function threeItems() {
  return (
    <>
      <Timeline.Item timestamp="10:00">Deployed v1.0</Timeline.Item>
      <Timeline.Item timestamp="10:15">Health check passed</Timeline.Item>
      <Timeline.Item timestamp="10:30">Rollout complete</Timeline.Item>
    </>
  );
}

function fourItems() {
  return (
    <>
      <Timeline.Item timestamp="10:00">Deployed v1.0</Timeline.Item>
      <Timeline.Item timestamp="10:15">Health check passed</Timeline.Item>
      <Timeline.Item timestamp="10:30">Rollout complete</Timeline.Item>
      <Timeline.Item timestamp="10:45">Metrics stabilized</Timeline.Item>
    </>
  );
}

describe('Timeline', () => {
  benchRender(
    'mount with 3 items',
    () => <Timeline>{threeItems()}</Timeline>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'items change',
    {
      initialProps: { children: threeItems() },
      updatedProps: { children: fourItems() },
    },
    (props) => <Timeline {...props} />,
    TIER_2_OPTIONS,
  );
});
