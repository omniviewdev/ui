import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { SearchInput } from '@omniview/base-ui';

describe('SearchInput', () => {
  benchRender('mount', () => (
    <SearchInput placeholder="Search..." value="" onValueChange={() => {}} />
  ), TIER_2_OPTIONS);

  benchRerender(
    'value change',
    { initialProps: { value: '' }, updatedProps: { value: 'search query' } },
    (props) => (
      <SearchInput placeholder="Search..." onValueChange={() => {}} {...props} />
    ),
    TIER_2_OPTIONS,
  );
});
