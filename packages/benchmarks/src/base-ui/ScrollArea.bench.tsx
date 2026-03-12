import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ScrollArea } from '@omniview/base-ui';
import type { ReactNode } from 'react';

const contentA = <div>Scrollable content block A</div>;
const contentB = <div>Scrollable content block B with extra text</div>;

describe('ScrollArea', () => {
  benchRender(
    'mount',
    () => (
      <ScrollArea style={{ height: 200 }}>
        {contentA}
      </ScrollArea>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'content change',
    {
      initialProps: { children: contentA as ReactNode },
      updatedProps: { children: contentB as ReactNode },
    },
    (props) => <ScrollArea style={{ height: 200 }} {...props} />,
    TIER_2_OPTIONS,
  );
});
