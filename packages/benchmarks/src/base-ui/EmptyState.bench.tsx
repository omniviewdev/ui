import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { EmptyState } from '@omniview/base-ui';

describe('EmptyState', () => {
  benchRender(
    'mount',
    () => <EmptyState title="No results" description="Try a different query." />,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'title change',
    {
      initialProps: { title: 'No results' },
      updatedProps: { title: 'Nothing found' },
    },
    (props) => <EmptyState {...props} description="Try a different query." />,
    TIER_2_OPTIONS,
  );
});
