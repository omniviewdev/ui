import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Toolbar, Button } from '@omniview/base-ui';

describe('Toolbar', () => {
  benchRender(
    'mount with buttons',
    () => (
      <Toolbar>
        <Toolbar.Group>
          <Button size="sm">Cut</Button>
          <Button size="sm">Copy</Button>
          <Button size="sm">Paste</Button>
        </Toolbar.Group>
      </Toolbar>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'disabled toggle',
    {
      initialProps: { 'aria-disabled': undefined as undefined },
      updatedProps: { 'aria-disabled': 'true' as const },
    },
    (props) => (
      <Toolbar {...props}>
        <Toolbar.Group>
          <Button size="sm">Cut</Button>
          <Button size="sm">Copy</Button>
          <Button size="sm">Paste</Button>
        </Toolbar.Group>
      </Toolbar>
    ),
    TIER_2_OPTIONS,
  );
});
