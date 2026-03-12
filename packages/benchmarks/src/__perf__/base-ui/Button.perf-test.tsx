import { test } from 'vitest';
import { measureRenders } from 'reassure';
import { Button } from '@omniview/base-ui';
import { ThemeWrapper } from '../utils/theme-wrapper';

/**
 * Button is the simplest interactive component — its render count
 * serves as the baseline for all other components.
 * Expected: 1 render on mount, 0 issues.
 */
test('Button: mount', async () => {
  await measureRenders(<Button>Click me</Button>, { wrapper: ThemeWrapper });
});

test('Button: mount with decorators', async () => {
  await measureRenders(
    <Button startDecorator={<span>+</span>} endDecorator={<span>→</span>}>
      Action
    </Button>,
    { wrapper: ThemeWrapper },
  );
});
