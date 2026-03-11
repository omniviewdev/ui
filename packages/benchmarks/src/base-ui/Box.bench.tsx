import { describe } from 'vitest';
import { benchRender, benchMountMany } from '../utils/bench-render';
import { Box } from '@omniview/base-ui';

describe('Box', () => {
  benchRender('mount div', () => <Box>Content</Box>);

  benchRender('mount section', () => <Box as="section">Content</Box>);

  benchMountMany('mount 1000', 1000, (i) => <Box key={i}>Item {i}</Box>);
});
