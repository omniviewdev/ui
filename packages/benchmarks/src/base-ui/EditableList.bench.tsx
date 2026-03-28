import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { EditableList } from '@omniviewdev/base-ui';

const noop = () => {};

function threeItems() {
  return (
    <>
      <EditableList.Item itemKey="a">
        <EditableList.ItemView>Item A</EditableList.ItemView>
        <EditableList.ItemEditor>
          <EditableList.ItemField name="value" defaultValue="A" />
        </EditableList.ItemEditor>
      </EditableList.Item>
      <EditableList.Item itemKey="b">
        <EditableList.ItemView>Item B</EditableList.ItemView>
        <EditableList.ItemEditor>
          <EditableList.ItemField name="value" defaultValue="B" />
        </EditableList.ItemEditor>
      </EditableList.Item>
      <EditableList.Item itemKey="c">
        <EditableList.ItemView>Item C</EditableList.ItemView>
        <EditableList.ItemEditor>
          <EditableList.ItemField name="value" defaultValue="C" />
        </EditableList.ItemEditor>
      </EditableList.Item>
    </>
  );
}

describe('EditableList', () => {
  benchRender(
    'mount with items',
    () => (
      <EditableList onCommit={noop}>
        {threeItems()}
      </EditableList>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'editable toggle',
    {
      initialProps: { editable: true },
      updatedProps: { editable: false },
    },
    (props) => (
      <EditableList onCommit={noop} editable={props.editable}>
        {threeItems()}
      </EditableList>
    ),
    TIER_2_OPTIONS,
  );
});
