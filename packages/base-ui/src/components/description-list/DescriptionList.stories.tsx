import type { Meta, StoryObj } from '@storybook/react';
import type { DescriptionListProps } from './DescriptionList';
import { DescriptionList } from './DescriptionList';

const meta = {
  title: 'Data Display/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  args: {
    layout: 'horizontal',
    size: 'md',
    columns: 1,
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['horizontal', 'vertical', 'grid'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    columns: { control: 'inline-radio', options: [1, 2, 3] },
  },
} satisfies Meta<DescriptionListProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionList.Item label="Name">Alice Johnson</DescriptionList.Item>
      <DescriptionList.Item label="Email">alice@example.com</DescriptionList.Item>
      <DescriptionList.Item label="Role">Administrator</DescriptionList.Item>
      <DescriptionList.Item label="Status">Active</DescriptionList.Item>
    </DescriptionList>
  ),
};

export const Horizontal: Story = {
  args: {
    layout: 'horizontal',
  },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionList.Item label="Cluster">production-us-east-1</DescriptionList.Item>
      <DescriptionList.Item label="Namespace">default</DescriptionList.Item>
      <DescriptionList.Item label="Pod Count">42</DescriptionList.Item>
      <DescriptionList.Item label="Created">2025-01-15T09:30:00Z</DescriptionList.Item>
    </DescriptionList>
  ),
};

export const Vertical: Story = {
  args: {
    layout: 'vertical',
  },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionList.Item label="Cluster">production-us-east-1</DescriptionList.Item>
      <DescriptionList.Item label="Namespace">default</DescriptionList.Item>
      <DescriptionList.Item label="Pod Count">42</DescriptionList.Item>
      <DescriptionList.Item label="Created">2025-01-15T09:30:00Z</DescriptionList.Item>
    </DescriptionList>
  ),
};

export const GridTwoColumns: Story = {
  args: {
    layout: 'grid',
    columns: 2,
  },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionList.Item label="Name">my-deployment</DescriptionList.Item>
      <DescriptionList.Item label="Namespace">production</DescriptionList.Item>
      <DescriptionList.Item label="Replicas">3</DescriptionList.Item>
      <DescriptionList.Item label="Strategy">RollingUpdate</DescriptionList.Item>
      <DescriptionList.Item label="Image">nginx:1.25</DescriptionList.Item>
      <DescriptionList.Item label="Port">8080</DescriptionList.Item>
    </DescriptionList>
  ),
};

export const WithCopyableValues: Story = {
  args: {
    layout: 'horizontal',
  },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionList.Item label="Pod ID" copyable>
        pod-a1b2c3d4-e5f6-7890-abcd-ef1234567890
      </DescriptionList.Item>
      <DescriptionList.Item label="IP Address" copyable>
        10.244.0.15
      </DescriptionList.Item>
      <DescriptionList.Item label="Node">worker-node-03</DescriptionList.Item>
      <DescriptionList.Item label="Image Hash" copyable>
        sha256:abc123def456
      </DescriptionList.Item>
    </DescriptionList>
  ),
};

export const MixedContent: Story = {
  args: {
    layout: 'horizontal',
  },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionList.Item label="Name">my-service</DescriptionList.Item>
      <DescriptionList.Item label="Status">
        <span style={{ color: 'var(--ov-color-success, green)', fontWeight: 600 }}>Running</span>
      </DescriptionList.Item>
      <DescriptionList.Item label="Labels">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <code
            style={{
              fontSize: '0.8em',
              padding: '2px 6px',
              background: 'var(--ov-color-bg-surface-raised, #f0f0f0)',
              borderRadius: 4,
            }}
          >
            app=frontend
          </code>
          <code
            style={{
              fontSize: '0.8em',
              padding: '2px 6px',
              background: 'var(--ov-color-bg-surface-raised, #f0f0f0)',
              borderRadius: 4,
            }}
          >
            env=prod
          </code>
        </div>
      </DescriptionList.Item>
      <DescriptionList.Item label="Endpoints">
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>10.0.0.1:8080</li>
          <li>10.0.0.2:8080</li>
        </ul>
      </DescriptionList.Item>
    </DescriptionList>
  ),
};
