import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { Sheet } from '@omniview/base-ui';
import type { SurfaceElevation } from '@omniview/base-ui';

describe('Sheet', () => {
  benchRender(
    'mount',
    () => (
      <Sheet elevation={1} surface="default">
        <p>Sheet content</p>
      </Sheet>
    ),
    TIER_1_OPTIONS,
  );

  benchRerender(
    'elevation change',
    {
      initialProps: { elevation: 0 as SurfaceElevation },
      updatedProps: { elevation: 3 as SurfaceElevation },
    },
    (props) => (
      <Sheet elevation={props.elevation} surface="default">
        <p>Sheet content</p>
      </Sheet>
    ),
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 50 sheets',
    50,
    (i) => (
      <Sheet key={i} elevation={(i % 5) as SurfaceElevation} surface="default">
        <p>Content {i}</p>
      </Sheet>
    ),
    TIER_1_OPTIONS,
  );
});
