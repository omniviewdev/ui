import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { ResizableSplitPane, type SplitDirection } from '@omniview/base-ui';

describe('ResizableSplitPane', () => {
  benchRender(
    'mount horizontal',
    () => (
      <ResizableSplitPane direction="horizontal" defaultSize={200}>
        {[<div key="a">Left</div>, <div key="b">Right</div>]}
      </ResizableSplitPane>
    ),
    TIER_1_OPTIONS,
  );

  benchRerender(
    'direction change (horizontal → vertical)',
    {
      initialProps: { direction: 'horizontal' as SplitDirection },
      updatedProps: { direction: 'vertical' as SplitDirection },
    },
    (props) => (
      <ResizableSplitPane direction={props.direction} defaultSize={200}>
        {[<div key="a">Pane 1</div>, <div key="b">Pane 2</div>]}
      </ResizableSplitPane>
    ),
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 30 split panes',
    30,
    (i) => (
      <ResizableSplitPane key={i} direction="horizontal" defaultSize={150}>
        {[<div key="a">Left {i}</div>, <div key="b">Right {i}</div>]}
      </ResizableSplitPane>
    ),
    TIER_1_OPTIONS,
  );
});
