import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Breadcrumbs } from '@omniview/base-ui';

function threeItems() {
  return (
    <>
      <Breadcrumbs.Item href="/home">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/docs">Docs</Breadcrumbs.Item>
      <Breadcrumbs.Item active>Current</Breadcrumbs.Item>
    </>
  );
}

function fourItems() {
  return (
    <>
      <Breadcrumbs.Item href="/home">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/docs">Docs</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/api">API</Breadcrumbs.Item>
      <Breadcrumbs.Item active>Current</Breadcrumbs.Item>
    </>
  );
}

describe('Breadcrumbs', () => {
  benchRender(
    'mount with 3 items',
    () => <Breadcrumbs>{threeItems()}</Breadcrumbs>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'items change',
    {
      initialProps: { children: threeItems() },
      updatedProps: { children: fourItems() },
    },
    (props) => <Breadcrumbs {...props} />,
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 50', 50, (i) => (
    <Breadcrumbs key={i}>
      <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/section">Section</Breadcrumbs.Item>
      <Breadcrumbs.Item active>Page {i}</Breadcrumbs.Item>
    </Breadcrumbs>
  ), TIER_2_OPTIONS);
});
