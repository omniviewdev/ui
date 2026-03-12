import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { StatusBar } from '@omniview/base-ui';
import type { ReactNode } from 'react';

const contentA = (
  <StatusBar.Section>
    <StatusBar.Item>main</StatusBar.Item>
    <StatusBar.Separator />
    <StatusBar.Item>UTF-8</StatusBar.Item>
  </StatusBar.Section>
);

const contentB = (
  <StatusBar.Section>
    <StatusBar.Item>develop</StatusBar.Item>
    <StatusBar.Separator />
    <StatusBar.Item>UTF-16</StatusBar.Item>
  </StatusBar.Section>
);

describe('StatusBar', () => {
  benchRender(
    'mount',
    () => <StatusBar>{contentA}</StatusBar>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'content change',
    {
      initialProps: { children: contentA as ReactNode },
      updatedProps: { children: contentB as ReactNode },
    },
    (props) => <StatusBar {...props} />,
    TIER_2_OPTIONS,
  );
});
