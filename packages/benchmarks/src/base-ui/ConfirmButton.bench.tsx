import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ConfirmButton } from '@omniviewdev/base-ui';

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
      initialProps: { disabled: false, onConfirm: noop, children: 'Delete' },
      updatedProps: { disabled: true, onConfirm: noop, children: 'Delete' },
    },
    (props) => <ConfirmButton {...props} />,
    TIER_2_OPTIONS,
  );
});
