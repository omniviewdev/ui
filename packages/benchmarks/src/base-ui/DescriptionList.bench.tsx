import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { DescriptionList } from '@omniview/base-ui';

function threeItems() {
  return (
    <>
      <DescriptionList.Item label="Name">Widget</DescriptionList.Item>
      <DescriptionList.Item label="Status">Active</DescriptionList.Item>
      <DescriptionList.Item label="Version">1.0.0</DescriptionList.Item>
    </>
  );
}

function fourItems() {
  return (
    <>
      <DescriptionList.Item label="Name">Widget</DescriptionList.Item>
      <DescriptionList.Item label="Status">Active</DescriptionList.Item>
      <DescriptionList.Item label="Version">1.0.0</DescriptionList.Item>
      <DescriptionList.Item label="Region">US-East</DescriptionList.Item>
    </>
  );
}

describe('DescriptionList', () => {
  benchRender(
    'mount with 3 items',
    () => <DescriptionList>{threeItems()}</DescriptionList>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'items change',
    {
      initialProps: { children: threeItems() },
      updatedProps: { children: fourItems() },
    },
    (props) => <DescriptionList {...props} />,
    TIER_2_OPTIONS,
  );
});
