import type { Meta, StoryObj } from '@storybook/react';
import { Grid, type GridProps } from './Grid';

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  args: {
    columns: 12,
    spacing: 2,
  },
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 12 } },
    minChildWidth: { control: 'text' },
    spacing: { control: { type: 'number', min: 0, max: 4 } },
    rowSpacing: { control: { type: 'number', min: 0, max: 4 } },
    columnSpacing: { control: { type: 'number', min: 0, max: 4 } },
  },
} satisfies Meta<GridProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoCell = ({ label }: { label: string }) => (
  <div
    style={{
      padding: 12,
      background: 'var(--ov-color-bg-surface-raised, #e0e0e0)',
      borderRadius: 'var(--ov-radius-surface, 4px)',
      border: '1px solid var(--ov-color-border-default, #ccc)',
      textAlign: 'center',
      fontSize: 13,
    }}
  >
    {label}
  </div>
);

export const Playground: Story = {
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 12 }, (_, i) => (
        <Grid.Item key={i}>
          <DemoCell label={`${i + 1}`} />
        </Grid.Item>
      ))}
    </Grid>
  ),
};

export const AutoResponsive: Story = {
  render: () => (
    <Grid minChildWidth="200px" spacing={2}>
      {Array.from({ length: 8 }, (_, i) => (
        <Grid.Item key={i}>
          <DemoCell label={`Card ${i + 1}`} />
        </Grid.Item>
      ))}
    </Grid>
  ),
};

export const ResponsiveSpans: Story = {
  name: 'Responsive Spans',
  render: () => (
    <Grid columns={12} spacing={2}>
      <Grid.Item span={{ xs: 12, md: 6 }}>
        <DemoCell label="xs=12 md=6" />
      </Grid.Item>
      <Grid.Item span={{ xs: 12, md: 6 }}>
        <DemoCell label="xs=12 md=6" />
      </Grid.Item>
      <Grid.Item span={{ xs: 12 }}>
        <DemoCell label="xs=12 (full row)" />
      </Grid.Item>
      <Grid.Item span={{ xs: 12, sm: 6, lg: 3 }}>
        <DemoCell label="xs=12 sm=6 lg=3" />
      </Grid.Item>
      <Grid.Item span={{ xs: 12, sm: 6, lg: 3 }}>
        <DemoCell label="xs=12 sm=6 lg=3" />
      </Grid.Item>
      <Grid.Item span={{ xs: 12, sm: 6, lg: 3 }}>
        <DemoCell label="xs=12 sm=6 lg=3" />
      </Grid.Item>
      <Grid.Item span={{ xs: 12, sm: 6, lg: 3 }}>
        <DemoCell label="xs=12 sm=6 lg=3" />
      </Grid.Item>
    </Grid>
  ),
};

export const MixedSpans: Story = {
  render: () => (
    <Grid columns={6} spacing={2}>
      <Grid.Item span={4}>
        <DemoCell label="span 4" />
      </Grid.Item>
      <Grid.Item span={2}>
        <DemoCell label="span 2" />
      </Grid.Item>
      <Grid.Item span={3}>
        <DemoCell label="span 3" />
      </Grid.Item>
      <Grid.Item span={3}>
        <DemoCell label="span 3" />
      </Grid.Item>
      <Grid.Item span={6}>
        <DemoCell label="span 6 (full row)" />
      </Grid.Item>
    </Grid>
  ),
};

export const SpacingVariations: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {([0, 1, 2, 3, 4] as const).map((spacing) => (
        <div key={spacing}>
          <p style={{ marginBottom: 8, fontSize: 13 }}>spacing={spacing}</p>
          <Grid columns={4} spacing={spacing}>
            {Array.from({ length: 4 }, (_, i) => (
              <Grid.Item key={i}>
                <DemoCell label={`${i + 1}`} />
              </Grid.Item>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
};
