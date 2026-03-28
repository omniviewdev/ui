import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { DockLayout, type DockNode } from '@omniviewdev/base-ui';

function makeTwoPanel(): DockNode {
  return {
    type: 'split',
    direction: 'horizontal',
    children: [
      {
        type: 'leaf',
        id: 'left',
        tabs: [
          { id: 'tab-1', title: 'File A', content: <div>Content A</div> },
          { id: 'tab-2', title: 'File B', content: <div>Content B</div> },
        ],
        activeTab: 'tab-1',
      },
      {
        type: 'leaf',
        id: 'right',
        tabs: [
          { id: 'tab-3', title: 'File C', content: <div>Content C</div> },
        ],
        activeTab: 'tab-3',
      },
    ],
    sizes: [1, 1],
  };
}

function makeThreePanelVertical(): DockNode {
  return {
    type: 'split',
    direction: 'vertical',
    children: [
      {
        type: 'leaf',
        id: 'top',
        tabs: [{ id: 'tab-a', title: 'Top', content: <div>Top</div> }],
        activeTab: 'tab-a',
      },
      {
        type: 'leaf',
        id: 'middle',
        tabs: [{ id: 'tab-b', title: 'Middle', content: <div>Middle</div> }],
        activeTab: 'tab-b',
      },
      {
        type: 'leaf',
        id: 'bottom',
        tabs: [{ id: 'tab-c', title: 'Bottom', content: <div>Bottom</div> }],
        activeTab: 'tab-c',
      },
    ],
    sizes: [1, 1, 1],
  };
}

describe('DockLayout', () => {
  benchRender(
    'mount 2-panel layout',
    () => <DockLayout layout={makeTwoPanel()} />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'layout change (2-panel → 3-panel vertical)',
    {
      initialProps: { layout: makeTwoPanel() },
      updatedProps: { layout: makeThreePanelVertical() },
    },
    (props) => <DockLayout layout={props.layout} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 20 dock layouts',
    20,
    (i) => {
      const layout: DockNode = {
        type: 'split',
        direction: 'horizontal',
        children: [
          {
            type: 'leaf',
            id: `left-${i}`,
            tabs: [{ id: `t-${i}-a`, title: `Tab A ${i}`, content: <div>A{i}</div> }],
            activeTab: `t-${i}-a`,
          },
          {
            type: 'leaf',
            id: `right-${i}`,
            tabs: [{ id: `t-${i}-b`, title: `Tab B ${i}`, content: <div>B{i}</div> }],
            activeTab: `t-${i}-b`,
          },
        ],
        sizes: [1, 1],
      };
      return <DockLayout key={i} layout={layout} />;
    },
    TIER_1_OPTIONS,
  );
});
