import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ToggleButtonGroup } from '@omniview/base-ui';

describe('ToggleButtonGroup', () => {
  benchRender(
    'mount with 3 items',
    () => (
      <ToggleButtonGroup defaultValue={['bold']}>
        <ToggleButtonGroup.Item value="bold">Bold</ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="italic">Italic</ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="underline">Underline</ToggleButtonGroup.Item>
      </ToggleButtonGroup>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'value change',
    {
      initialProps: { value: ['bold'] as string[] },
      updatedProps: { value: ['italic'] as string[] },
    },
    (props) => (
      <ToggleButtonGroup value={props.value}>
        <ToggleButtonGroup.Item value="bold">Bold</ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="italic">Italic</ToggleButtonGroup.Item>
        <ToggleButtonGroup.Item value="underline">Underline</ToggleButtonGroup.Item>
      </ToggleButtonGroup>
    ),
    TIER_2_OPTIONS,
  );
});
