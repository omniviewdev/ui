import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { List } from '@omniviewdev/base-ui';
import type { ReactNode } from 'react';

const threeItems = (
  <>
    <List.Item itemKey="a">Alpha</List.Item>
    <List.Item itemKey="b">Beta</List.Item>
    <List.Item itemKey="c">Gamma</List.Item>
  </>
);

const fourItems = (
  <>
    <List.Item itemKey="a">Alpha</List.Item>
    <List.Item itemKey="b">Beta</List.Item>
    <List.Item itemKey="c">Gamma</List.Item>
    <List.Item itemKey="d">Delta</List.Item>
  </>
);

describe('List', () => {
  benchRender(
    'mount with 3 items',
    () => <List>{threeItems}</List>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'items change',
    {
      initialProps: { children: threeItems as ReactNode },
      updatedProps: { children: fourItems as ReactNode },
    },
    (props) => <List {...props} />,
    TIER_2_OPTIONS,
  );
});
