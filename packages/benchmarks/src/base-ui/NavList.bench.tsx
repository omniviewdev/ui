import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { NavList } from '@omniview/base-ui';

describe('NavList', () => {
  benchRender(
    'mount with items',
    () => (
      <NavList>
        <NavList.Item itemKey="home">
          <NavList.ItemLabel>Home</NavList.ItemLabel>
        </NavList.Item>
        <NavList.Item itemKey="settings">
          <NavList.ItemLabel>Settings</NavList.ItemLabel>
        </NavList.Item>
        <NavList.Item itemKey="profile">
          <NavList.ItemLabel>Profile</NavList.ItemLabel>
        </NavList.Item>
      </NavList>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'active item change',
    {
      initialProps: { activeKey: 'home' as string },
      updatedProps: { activeKey: 'settings' as string },
    },
    (props) => (
      <NavList activeKey={props.activeKey}>
        <NavList.Item itemKey="home">
          <NavList.ItemLabel>Home</NavList.ItemLabel>
        </NavList.Item>
        <NavList.Item itemKey="settings">
          <NavList.ItemLabel>Settings</NavList.ItemLabel>
        </NavList.Item>
        <NavList.Item itemKey="profile">
          <NavList.ItemLabel>Profile</NavList.ItemLabel>
        </NavList.Item>
      </NavList>
    ),
    TIER_2_OPTIONS,
  );
});
