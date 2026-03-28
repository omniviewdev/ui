import { describe } from 'vitest';
import { benchRender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Box } from '@omniviewdev/base-ui';

describe('Box', () => {
  benchRender('mount div', () => <Box>Content</Box>, TIER_2_OPTIONS);
  benchRender('mount section', () => <Box as="section">Content</Box>, TIER_2_OPTIONS);
  benchMountMany('mount 1000', 1000, (i) => <Box key={i}>Item {i}</Box>, TIER_2_OPTIONS);
});
