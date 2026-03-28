import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { AlertDialog } from '@omniviewdev/base-ui';

describe('AlertDialog', () => {
  benchRender(
    'mount (open)',
    () => (
      <AlertDialog open>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Popup>
            <AlertDialog.Title>Confirm</AlertDialog.Title>
            <AlertDialog.Description>Are you sure?</AlertDialog.Description>
            <AlertDialog.Close>Cancel</AlertDialog.Close>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'open toggle',
    {
      initialProps: { open: true  },
      updatedProps: { open: false  },
    },
    (props) => (
      <AlertDialog {...props}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Popup>
            <AlertDialog.Title>Confirm</AlertDialog.Title>
            <AlertDialog.Description>Are you sure?</AlertDialog.Description>
            <AlertDialog.Close>Cancel</AlertDialog.Close>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog>
    ),
    TIER_2_OPTIONS,
  );
});
