import type { Meta, StoryObj } from '@storybook/react';
import { ResizableSplitPane, type ResizableSplitPaneProps } from './ResizableSplitPane';

const PaneContent = ({ label, color }: { label: string; color: string }) => (
  <div
    style={{
      padding: 16,
      height: '100%',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      color: 'var(--ov-color-fg-default)',
    }}
  >
    {label}
  </div>
);

const meta = {
  title: 'Layout/ResizableSplitPane',
  component: ResizableSplitPane,
  tags: ['autodocs'],
  args: {
    direction: 'horizontal',
    defaultSize: 300,
    minSize: 100,
    children: [<PaneContent key="left" label="First Pane" color="var(--ov-color-bg-surface)" />, <PaneContent key="right" label="Second Pane" color="var(--ov-color-bg-base)" />],
  },
  argTypes: {
    direction: { control: 'radio', options: ['horizontal', 'vertical'] },
    defaultSize: { control: { type: 'number', min: 50, max: 800 } },
    minSize: { control: { type: 'number', min: 0, max: 400 } },
    maxSize: { control: { type: 'number', min: 100, max: 1000 } },
  },
} satisfies Meta<ResizableSplitPaneProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <ResizableSplitPane {...args}>
        {[
          <PaneContent key="left" label="First Pane" color="var(--ov-color-bg-surface)" />,
          <PaneContent key="right" label="Second Pane" color="var(--ov-color-bg-base)" />,
        ]}
      </ResizableSplitPane>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ height: 300, border: '1px solid var(--ov-color-border-default)' }}>
      <ResizableSplitPane direction="horizontal" defaultSize={250}>
        {[
          <PaneContent key="left" label="Sidebar" color="var(--ov-color-bg-surface)" />,
          <PaneContent key="right" label="Main Content" color="var(--ov-color-bg-base)" />,
        ]}
      </ResizableSplitPane>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <ResizableSplitPane direction="vertical" defaultSize={200}>
        {[
          <PaneContent key="top" label="Editor" color="var(--ov-color-bg-surface)" />,
          <PaneContent key="bottom" label="Terminal" color="var(--ov-color-bg-base)" />,
        ]}
      </ResizableSplitPane>
    </div>
  ),
};

export const WithConstraints: Story = {
  name: 'With Min/Max Constraints',
  render: () => (
    <div style={{ height: 300, border: '1px solid var(--ov-color-border-default)' }}>
      <ResizableSplitPane defaultSize={300} minSize={150} maxSize={500}>
        {[
          <PaneContent key="left" label="Min: 150px, Max: 500px" color="var(--ov-color-bg-surface)" />,
          <PaneContent key="right" label="Flexible" color="var(--ov-color-bg-base)" />,
        ]}
      </ResizableSplitPane>
    </div>
  ),
};

export const Nested: Story = {
  render: () => (
    <div style={{ height: 400, border: '1px solid var(--ov-color-border-default)' }}>
      <ResizableSplitPane direction="horizontal" defaultSize={300}>
        {[
          <PaneContent key="left" label="Navigation" color="var(--ov-color-bg-surface)" />,
          <ResizableSplitPane key="right" direction="vertical" defaultSize={250}>
            {[
              <PaneContent key="top" label="Editor" color="var(--ov-color-bg-base)" />,
              <PaneContent key="bottom" label="Terminal" color="var(--ov-color-bg-surface-raised)" />,
            ]}
          </ResizableSplitPane>,
        ]}
      </ResizableSplitPane>
    </div>
  ),
};
