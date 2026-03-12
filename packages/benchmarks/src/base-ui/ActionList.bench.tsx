import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ActionList } from '@omniview/base-ui';

describe('ActionList', () => {
  benchRender(
    'mount with items',
    () => (
      <ActionList>
        <ActionList.Item label="Cut" />
        <ActionList.Item label="Copy" />
        <ActionList.Item label="Paste" />
        <ActionList.Separator />
        <ActionList.Item label="Delete" />
      </ActionList>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'disabled toggle',
    {
      initialProps: { disabled: false  },
      updatedProps: { disabled: true  },
    },
    (props) => (
      <ActionList>
        <ActionList.Item label="Cut" disabled={props.disabled} />
        <ActionList.Item label="Copy" disabled={props.disabled} />
        <ActionList.Item label="Paste" />
        <ActionList.Separator />
        <ActionList.Item label="Delete" />
      </ActionList>
    ),
    TIER_2_OPTIONS,
  );
});
