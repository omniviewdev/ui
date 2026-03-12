import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ToastProvider } from '@omniview/base-ui';

describe('ToastProvider', () => {
  benchRender(
    'mount provider',
    () => (
      <ToastProvider position="bottom-right">
        <div>App content</div>
      </ToastProvider>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'position change',
    {
      initialProps: { position: 'bottom-right' as const },
      updatedProps: { position: 'top-left' as const },
    },
    (props) => (
      <ToastProvider position={props.position}>
        <div>App content</div>
      </ToastProvider>
    ),
    TIER_2_OPTIONS,
  );
});
