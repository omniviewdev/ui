import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { Drawer } from '@omniview/base-ui';

const noop = () => {};

describe('Drawer', () => {
  benchRender(
    'mount (open)',
    () => (
      <Drawer open onOpenChange={noop} anchor="bottom" defaultSize={320}>
        <Drawer.Content>Drawer content</Drawer.Content>
      </Drawer>
    ),
    TIER_1_OPTIONS,
  );

  benchRerender(
    'open/close toggle',
    {
      initialProps: { open: true },
      updatedProps: { open: false },
    },
    (props) => (
      <Drawer open={props.open} onOpenChange={noop} anchor="bottom" defaultSize={320} animate={false}>
        <Drawer.Content>Drawer content</Drawer.Content>
      </Drawer>
    ),
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 50 drawers',
    50,
    (i) => (
      <Drawer key={i} open onOpenChange={noop} anchor="bottom" defaultSize={320} animate={false}>
        <Drawer.Content>Content {i}</Drawer.Content>
      </Drawer>
    ),
    TIER_1_OPTIONS,
  );
});
