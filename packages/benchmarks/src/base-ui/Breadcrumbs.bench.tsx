import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Breadcrumbs } from '@omniview/base-ui';

const threeItems = (
  <>
    <Breadcrumbs.Item href="/home">Home</Breadcrumbs.Item>
    <Breadcrumbs.Item href="/docs">Docs</Breadcrumbs.Item>
    <Breadcrumbs.Item active>Current</Breadcrumbs.Item>
  </>
);

const fourItems = (
  <>
    <Breadcrumbs.Item href="/home">Home</Breadcrumbs.Item>
    <Breadcrumbs.Item href="/docs">Docs</Breadcrumbs.Item>
    <Breadcrumbs.Item href="/api">API</Breadcrumbs.Item>
    <Breadcrumbs.Item active>Current</Breadcrumbs.Item>
  </>
);

describe('Breadcrumbs', () => {
  benchRender(
    'mount with 3 items',
    () => <Breadcrumbs>{threeItems}</Breadcrumbs>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'items change',
    {
      initialProps: { children: threeItems },
      updatedProps: { children: fourItems },
    },
    (props) => <Breadcrumbs {...props} />,
    TIER_2_OPTIONS,
  );
});
