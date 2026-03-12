import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { Dialog } from '@omniview/base-ui';

const noop = () => {};

describe('Dialog', () => {
  benchRender(
    'mount (open)',
    () => (
      <Dialog open onClose={noop} size="md">
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Body>Body content</Dialog.Body>
        <Dialog.Footer>
          <button type="button">OK</button>
        </Dialog.Footer>
        <Dialog.Close />
      </Dialog>
    ),
    TIER_1_OPTIONS,
  );

  benchRerender(
    'open/close toggle',
    {
      initialProps: { open: true },
      updatedProps: { open: false },
    },
    (props) => (
      <Dialog open={props.open} onClose={noop} size="md">
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Body>Body content</Dialog.Body>
        <Dialog.Footer>
          <button type="button">OK</button>
        </Dialog.Footer>
      </Dialog>
    ),
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 50 dialogs',
    50,
    (i) => (
      <Dialog key={i} open onClose={noop} size="md">
        <Dialog.Title>Dialog {i}</Dialog.Title>
        <Dialog.Body>Content {i}</Dialog.Body>
      </Dialog>
    ),
    TIER_1_OPTIONS,
  );
});
