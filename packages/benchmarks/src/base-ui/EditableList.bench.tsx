import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { EditableList } from '@omniview/base-ui';

const noop = () => {};

describe('EditableList', () => {
  benchRender(
    'mount with items',
    () => (
      <EditableList onCommit={noop}>
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
      </EditableList>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'editable toggle',
    {
      initialProps: { editable: true as boolean },
      updatedProps: { editable: false as boolean },
    },
    (props) => (
      <EditableList onCommit={noop} editable={props.editable}>
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
      </EditableList>
    ),
    TIER_2_OPTIONS,
  );
});
