import { useState } from 'react';
import { test } from 'vitest';
import { measureRenders } from 'reassure';
import { fireEvent, screen } from '@testing-library/react';
import { Dialog, Button } from '@omniview/base-ui';
import { ThemeWrapper } from '../utils/theme-wrapper';

function DialogWithTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} size="md">
        <Dialog.Title>Confirm Action</Dialog.Title>
        <Dialog.Body>Are you sure you want to proceed?</Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </Dialog.Footer>
        <Dialog.Close />
      </Dialog>
    </>
  );
}

/**
 * Mount cost includes the trigger but NOT the dialog body (open=false).
 * Render count should be minimal — just the trigger + null dialog.
 */
test('Dialog: mount (closed)', async () => {
  await measureRenders(<DialogWithTrigger />, { wrapper: ThemeWrapper });
});

/**
 * Opening the dialog triggers portal mount, backdrop, and content render.
 * High render counts here signal excessive setState chains in useEffect.
 */
test('Dialog: open', async () => {
  await measureRenders(<DialogWithTrigger />, {
    wrapper: ThemeWrapper,
    scenario: async () => {
      fireEvent.click(screen.getByText('Open Dialog'));
    },
  });
});

/**
 * Full open/close cycle. Render count should be ~2x the open-only count.
 * Significantly more signals cleanup-related re-renders.
 */
test('Dialog: open then close', async () => {
  await measureRenders(<DialogWithTrigger />, {
    wrapper: ThemeWrapper,
    scenario: async () => {
      fireEvent.click(screen.getByText('Open Dialog'));
      fireEvent.click(screen.getByText('Cancel'));
    },
  });
});
