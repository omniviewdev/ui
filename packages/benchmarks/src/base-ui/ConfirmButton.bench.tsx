import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ConfirmButton } from '@omniview/base-ui';

const noop = () => {};

describe('ConfirmButton', () => {
  benchRender(
    'mount',
    () => <ConfirmButton onConfirm={noop}>Delete</ConfirmButton>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'disabled toggle',
    {
      initialProps: { disabled: false as boolean, onConfirm: noop, children: 'Delete' as const },
      updatedProps: { disabled: true as boolean, onConfirm: noop, children: 'Delete' as const },
    },
    (props) => <ConfirmButton {...props} />,
    TIER_2_OPTIONS,
  );
});
