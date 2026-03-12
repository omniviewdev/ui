import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ClipboardText } from '@omniview/base-ui';

describe('ClipboardText', () => {
  benchRender(
    'mount',
    () => <ClipboardText value="kubectl get pods" />,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'value change',
    {
      initialProps: { value: 'kubectl get pods' },
      updatedProps: { value: 'kubectl get nodes' },
    },
    (props) => <ClipboardText {...props} />,
    TIER_2_OPTIONS,
  );
});
