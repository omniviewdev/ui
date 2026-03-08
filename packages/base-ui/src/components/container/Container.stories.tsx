import type { Meta, StoryObj } from '@storybook/react';
import { Container, type ContainerProps } from './Container';

const meta = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  args: {
    maxWidth: 'lg',
    disableGutters: false,
    fixed: false,
  },
  argTypes: {
    maxWidth: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    disableGutters: { control: 'boolean' },
    fixed: { control: 'boolean' },
  },
} satisfies Meta<ContainerProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoBox = ({ label }: { label?: string }) => (
  <div
    style={{
      padding: 16,
      background: 'var(--ov-color-bg-surface-raised, #e0e0e0)',
      borderRadius: 'var(--ov-radius-surface, 4px)',
      border: '1px solid var(--ov-color-border-default, #ccc)',
      textAlign: 'center',
    }}
  >
    {label ?? 'Container content'}
  </div>
);

export const Playground: Story = {
  render: (args) => (
    <div style={{ background: 'var(--ov-color-bg-muted, #f5f5f5)', padding: 16 }}>
      <Container {...args}>
        <DemoBox />
      </Container>
    </div>
  ),
};

export const MaxWidths: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        background: 'var(--ov-color-bg-muted, #f5f5f5)',
        padding: 16,
      }}
    >
      {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
        <Container key={size} maxWidth={size}>
          <DemoBox label={`maxWidth="${size}"`} />
        </Container>
      ))}
    </div>
  ),
};

export const FixedVsFluid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        background: 'var(--ov-color-bg-muted, #f5f5f5)',
        padding: 16,
      }}
    >
      <Container maxWidth="md">
        <DemoBox label="Fluid (default)" />
      </Container>
      <Container maxWidth="md" fixed>
        <DemoBox label="Fixed" />
      </Container>
    </div>
  ),
};

export const NoGutters: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        background: 'var(--ov-color-bg-muted, #f5f5f5)',
        padding: 16,
      }}
    >
      <Container maxWidth="md">
        <DemoBox label="With gutters (default)" />
      </Container>
      <Container maxWidth="md" disableGutters>
        <DemoBox label="No gutters" />
      </Container>
    </div>
  ),
};
