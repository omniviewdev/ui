import type { Meta, StoryObj } from '@storybook/react';
import { AIInlineCitation } from './AIInlineCitation';

const meta = {
  title: 'AI/Content/AIInlineCitation',
  component: AIInlineCitation,
  tags: ['autodocs'],
  args: {
    index: 1,
  },
  argTypes: {
    index: { control: 'number' },
  },
} satisfies Meta<typeof AIInlineCitation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    onNavigate: () => alert('Navigate to source 1'),
  },
};

export const InContext: Story = {
  render: () => (
    <p style={{ color: 'var(--ov-color-fg-default)', fontSize: 14, lineHeight: 1.6 }}>
      The Kubernetes scheduler assigns pods to nodes based on resource availability
      <AIInlineCitation index={1} onNavigate={() => {}} /> and affinity rules
      <AIInlineCitation index={2} onNavigate={() => {}} />. When a node runs out of resources,
      the eviction manager will start removing lower-priority pods
      <AIInlineCitation index={3} onNavigate={() => {}} />.
    </p>
  ),
};

export const MultipleCitations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <AIInlineCitation index={1} onNavigate={() => {}} />
      <AIInlineCitation index={2} onNavigate={() => {}} />
      <AIInlineCitation index={3} onNavigate={() => {}} />
      <AIInlineCitation index={10} onNavigate={() => {}} />
      <AIInlineCitation index={42} onNavigate={() => {}} />
    </div>
  ),
};
