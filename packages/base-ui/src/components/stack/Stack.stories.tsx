import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const DemoItem = ({ children }: { children: string }) => (
  <div
    style={{
      padding: '8px 16px',
      border: '1px solid var(--ov-color-border-muted)',
      borderRadius: 'var(--ov-radius-surface)',
      fontSize: 'var(--ov-font-size-caption)',
    }}
  >
    {children}
  </div>
);

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: {
    direction: 'column',
    spacing: 2,
  },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
    },
    spacing: { control: 'inline-radio', options: [0, 1, 2, 3, 4] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: { control: 'boolean' },
    divider: { control: 'boolean' },
    as: { control: 'select', options: ['div', 'section', 'nav', 'ul', 'ol'] },
  },
  render: (args) => (
    <Stack {...args}>
      <DemoItem>Item 1</DemoItem>
      <DemoItem>Item 2</DemoItem>
      <DemoItem>Item 3</DemoItem>
    </Stack>
  ),
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Directions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['row', 'column', 'row-reverse', 'column-reverse'] as const).map((dir) => (
        <div key={dir}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--ov-font-size-caption)',
              color: 'var(--ov-color-fg-muted)',
            }}
          >
            {dir}
          </p>
          <Stack direction={dir}>
            <DemoItem>A</DemoItem>
            <DemoItem>B</DemoItem>
            <DemoItem>C</DemoItem>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

export const SpacingScale: Story = {
  name: 'Spacing Scale',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {([0, 1, 2, 3, 4] as const).map((space) => (
        <div key={space}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--ov-font-size-caption)',
              color: 'var(--ov-color-fg-muted)',
            }}
          >
            spacing={space}
          </p>
          <Stack direction="row" spacing={space}>
            <DemoItem>A</DemoItem>
            <DemoItem>B</DemoItem>
            <DemoItem>C</DemoItem>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

export const WithDividers: Story = {
  name: 'With Dividers',
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 'var(--ov-font-size-caption)',
            color: 'var(--ov-color-fg-muted)',
          }}
        >
          Column + dividers
        </p>
        <Stack divider>
          <DemoItem>Item 1</DemoItem>
          <DemoItem>Item 2</DemoItem>
          <DemoItem>Item 3</DemoItem>
        </Stack>
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 'var(--ov-font-size-caption)',
            color: 'var(--ov-color-fg-muted)',
          }}
        >
          Row + dividers
        </p>
        <Stack direction="row" divider>
          <DemoItem>Item 1</DemoItem>
          <DemoItem>Item 2</DemoItem>
          <DemoItem>Item 3</DemoItem>
        </Stack>
      </div>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['start', 'center', 'end', 'stretch'] as const).map((alignment) => (
        <div key={alignment}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--ov-font-size-caption)',
              color: 'var(--ov-color-fg-muted)',
            }}
          >
            align={alignment}
          </p>
          <Stack
            direction="row"
            align={alignment}
            style={{ height: 80, border: '1px dashed var(--ov-color-border-muted)' }}
          >
            <DemoItem>Short</DemoItem>
            <DemoItem>Medium text</DemoItem>
            <DemoItem>A bit longer</DemoItem>
          </Stack>
        </div>
      ))}
    </div>
  ),
};
