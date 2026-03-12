import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Tabs } from '@omniview/base-ui';

describe('Tabs', () => {
  benchRender(
    'mount with 3 tabs',
    () => (
      <Tabs defaultValue={0}>
        <Tabs.List>
          <Tabs.Tab value={0}>Tab 1</Tabs.Tab>
          <Tabs.Tab value={1}>Tab 2</Tabs.Tab>
          <Tabs.Tab value={2}>Tab 3</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={0}>Panel 1</Tabs.Panel>
        <Tabs.Panel value={1}>Panel 2</Tabs.Panel>
        <Tabs.Panel value={2}>Panel 3</Tabs.Panel>
      </Tabs>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'active tab change',
    {
      initialProps: { value: 0 as number },
      updatedProps: { value: 2 as number },
    },
    (props) => (
      <Tabs value={props.value}>
        <Tabs.List>
          <Tabs.Tab value={0}>Tab 1</Tabs.Tab>
          <Tabs.Tab value={1}>Tab 2</Tabs.Tab>
          <Tabs.Tab value={2}>Tab 3</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={0}>Panel 1</Tabs.Panel>
        <Tabs.Panel value={1}>Panel 2</Tabs.Panel>
        <Tabs.Panel value={2}>Panel 3</Tabs.Panel>
      </Tabs>
    ),
    TIER_2_OPTIONS,
  );
});
