import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { TextArea } from '@omniview/base-ui';

describe('TextArea', () => {
  benchRender('mount', () => (
    <TextArea>
      <TextArea.Label>Label</TextArea.Label>
      <TextArea.Control placeholder="Enter text" rows={4} />
    </TextArea>
  ), TIER_2_OPTIONS);

  benchRerender(
    'disabled toggle',
    { initialProps: { disabled: false }, updatedProps: { disabled: true } },
    (props) => (
      <TextArea>
        <TextArea.Label>Label</TextArea.Label>
        <TextArea.Control placeholder="Enter text" rows={4} {...props} />
      </TextArea>
    ),
    TIER_2_OPTIONS,
  );
});
