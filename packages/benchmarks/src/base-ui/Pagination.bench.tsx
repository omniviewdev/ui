import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Pagination } from '@omniview/base-ui';

const noop = () => {};

describe('Pagination', () => {
  benchRender(
    'mount',
    () => <Pagination count={10} page={1} onChange={noop} />,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'page change',
    {
      initialProps: { page: 1 as number },
      updatedProps: { page: 5 as number },
    },
    (props) => <Pagination count={10} page={props.page} onChange={noop} />,
    TIER_2_OPTIONS,
  );
});
