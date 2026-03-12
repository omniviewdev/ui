import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { StatRow } from '@omniview/base-ui';
import type { ReactNode } from 'react';

const itemsA = (
  <>
    <StatRow.Item>CPU: 45%</StatRow.Item>
    <StatRow.Item>Mem: 2.1 GB</StatRow.Item>
    <StatRow.Item>Pods: 12</StatRow.Item>
  </>
);

const itemsB = (
  <>
    <StatRow.Item>CPU: 72%</StatRow.Item>
    <StatRow.Item>Mem: 3.4 GB</StatRow.Item>
    <StatRow.Item>Pods: 18</StatRow.Item>
  </>
);

describe('StatRow', () => {
  benchRender(
    'mount',
    () => <StatRow>{itemsA}</StatRow>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'value change',
    {
      initialProps: { children: itemsA as ReactNode },
      updatedProps: { children: itemsB as ReactNode },
    },
    (props) => <StatRow {...props} />,
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 100', 100, (i) => (
    <StatRow key={i}>
      <StatRow.Item>CPU: {i}%</StatRow.Item>
      <StatRow.Item>Mem: {i} GB</StatRow.Item>
    </StatRow>
  ), TIER_2_OPTIONS);
});
