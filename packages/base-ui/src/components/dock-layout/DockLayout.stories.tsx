import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DockLayout, type DockLayoutProps, type DockNode, type DockSplit } from './DockLayout';

const meta = {
  title: 'Layout/DockLayout',
  component: DockLayout,
  tags: ['autodocs'],
} satisfies Meta<DockLayoutProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const PanelContent = ({ label }: { label: string }) => (
  <div
    style={{
      padding: 16,
      fontSize: 13,
      color: 'var(--ov-color-fg-default)',
      height: '100%',
    }}
  >
    {label}
  </div>
);

const simpleLayout: DockNode = {
  type: 'leaf',
  id: 'main',
  tabs: [
    { id: 'file1', title: 'index.tsx', content: <PanelContent label="Content of index.tsx" /> },
    { id: 'file2', title: 'styles.css', content: <PanelContent label="Content of styles.css" /> },
    { id: 'file3', title: 'README.md', content: <PanelContent label="Content of README.md" /> },
  ],
  activeTab: 'file1',
};

const splitLayout: DockSplit = {
  type: 'split',
  direction: 'horizontal',
  children: [
    {
      type: 'leaf',
      id: 'editor',
      tabs: [
        { id: 'code', title: 'App.tsx', content: <PanelContent label="App.tsx source code" /> },
        { id: 'test', title: 'App.test.tsx', content: <PanelContent label="App.test.tsx tests" /> },
      ],
      activeTab: 'code',
    },
    {
      type: 'leaf',
      id: 'preview',
      tabs: [
        { id: 'preview', title: 'Preview', content: <PanelContent label="Live preview" /> },
      ],
    },
  ],
  sizes: [2, 1],
};

const ideLayout: DockSplit = {
  type: 'split',
  direction: 'horizontal',
  children: [
    {
      type: 'leaf',
      id: 'explorer',
      tabs: [
        { id: 'files', title: 'Explorer', closable: false, content: <PanelContent label="File tree" /> },
      ],
    },
    {
      type: 'split',
      direction: 'vertical',
      children: [
        {
          type: 'split',
          direction: 'horizontal',
          children: [
            {
              type: 'leaf',
              id: 'editor-1',
              tabs: [
                { id: 'main-ts', title: 'main.ts', content: <PanelContent label="main.ts" /> },
                { id: 'utils', title: 'utils.ts', content: <PanelContent label="utils.ts" /> },
              ],
              activeTab: 'main-ts',
            },
            {
              type: 'leaf',
              id: 'editor-2',
              tabs: [
                { id: 'config', title: 'config.json', content: <PanelContent label="config.json" /> },
              ],
            },
          ],
          sizes: [2, 1],
        },
        {
          type: 'leaf',
          id: 'terminal',
          tabs: [
            { id: 'term', title: 'Terminal', closable: false, content: <PanelContent label="$ _" /> },
            { id: 'output', title: 'Output', content: <PanelContent label="Build output" /> },
            { id: 'problems', title: 'Problems', content: <PanelContent label="0 errors, 0 warnings" /> },
          ],
          activeTab: 'term',
        },
      ],
      sizes: [3, 1],
    },
  ],
  sizes: [1, 4],
};

export const Playground: Story = {
  args: {
    layout: simpleLayout,
  },
  render: (args) => (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <DockLayout {...args} />
    </div>
  ),
};

function SplitViewDemo() {
  const [layout, setLayout] = useState<DockNode>(splitLayout);
  return (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <DockLayout layout={layout} onLayoutChange={setLayout} />
    </div>
  );
}

export const SplitView: Story = {
  render: () => <SplitViewDemo />,
};

function IDELayoutDemo() {
  const [layout, setLayout] = useState<DockNode>(ideLayout);
  return (
    <div style={{ height: 500, border: '1px solid var(--ov-color-border-default)' }}>
      <DockLayout layout={layout} onLayoutChange={setLayout} />
    </div>
  );
}

export const IDELayout: Story = {
  name: 'IDE-Style Layout',
  render: () => <IDELayoutDemo />,
};

export const SinglePanel: Story = {
  render: () => {
    const layout: DockNode = {
      type: 'leaf',
      id: 'single',
      tabs: [
        { id: 'welcome', title: 'Welcome', closable: false, content: <PanelContent label="Welcome to the IDE" /> },
      ],
    };
    return (
      <div style={{ height: 300, border: '1px solid var(--ov-color-border-default)' }}>
        <DockLayout layout={layout} />
      </div>
    );
  },
};
