import type { Meta, StoryObj } from '@storybook/react';
import { AIStepDivider } from './AIStepDivider';

const meta: Meta<typeof AIStepDivider> = {
  title: 'AI/Layout/AIStepDivider',
  component: AIStepDivider,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    step: 1,
    label: 'Step 1',
    variant: 'line',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'pill'] },
  },
};

export const LineVariant: Story = {
  args: {
    step: 2,
    variant: 'line',
  },
};

export const PillVariant: Story = {
  args: {
    step: 3,
    variant: 'pill',
  },
};

export const WithTimestamp: Story = {
  args: {
    step: 1,
    timestamp: new Date(2025, 0, 15, 14, 30),
    variant: 'line',
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Reasoning complete',
    variant: 'pill',
  },
};

export const PlainDivider: Story = {
  args: {},
};

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, color: 'var(--ov-color-fg-default)' }}>
        User: How do I scale my deployment?
      </p>
      <AIStepDivider step={1} variant="pill" timestamp={new Date(2025, 0, 15, 14, 30)} />
      <p style={{ margin: 0, color: 'var(--ov-color-fg-default)' }}>
        Assistant: Let me check your current deployment configuration...
      </p>
      <AIStepDivider step={2} variant="pill" timestamp={new Date(2025, 0, 15, 14, 31)} />
      <p style={{ margin: 0, color: 'var(--ov-color-fg-default)' }}>
        Assistant: I&apos;ve updated your replica count to 3.
      </p>
    </div>
  ),
};
