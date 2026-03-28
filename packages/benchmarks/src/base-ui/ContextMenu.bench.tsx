import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { ContextMenu } from '@omniviewdev/base-ui';

describe('ContextMenu', () => {
  benchRender(
    'mount with items',
    () => (
      <ContextMenu>
        <ContextMenu.Trigger>
          <div>Right-click me</div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup>
              <ContextMenu.Item>Cut</ContextMenu.Item>
              <ContextMenu.Item>Copy</ContextMenu.Item>
              <ContextMenu.Item>Paste</ContextMenu.Item>
              <ContextMenu.Separator />
              <ContextMenu.Item disabled>Delete</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu>
    ),
    TIER_1_OPTIONS,
  );

  benchRerender(
    'disabled toggle on item',
    {
      initialProps: { itemDisabled: false },
      updatedProps: { itemDisabled: true },
    },
    (props) => (
      <ContextMenu>
        <ContextMenu.Trigger>
          <div>Right-click me</div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup>
              <ContextMenu.Item>Cut</ContextMenu.Item>
              <ContextMenu.Item>Copy</ContextMenu.Item>
              <ContextMenu.Item disabled={props.itemDisabled}>Paste</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu>
    ),
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 50 context menus',
    50,
    (i) => (
      <ContextMenu key={i}>
        <ContextMenu.Trigger>
          <div>Trigger {i}</div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup>
              <ContextMenu.Item>Action A</ContextMenu.Item>
              <ContextMenu.Item>Action B</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu>
    ),
    TIER_1_OPTIONS,
  );
});
