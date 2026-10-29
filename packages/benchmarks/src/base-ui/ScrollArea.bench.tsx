import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ScrollArea } from '@omniviewdev/base-ui';
import type { ReactNode } from 'react';
import styles from './ScrollArea.module.css';

const contentA = <div>Scrollable content block A</div>;
const contentB = <div>Scrollable content block B with extra text</div>;

describe('ScrollArea', () => {
  benchRender(
    'mount',
    () => (
      <ScrollArea className={styles.Viewport}>
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
    (props) => <ScrollArea className={styles.Viewport} {...props} />,
    TIER_2_OPTIONS,
  );
});
