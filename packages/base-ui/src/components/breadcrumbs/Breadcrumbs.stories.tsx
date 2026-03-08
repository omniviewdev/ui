import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';

const meta = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  args: {
    separator: '/',
    maxItems: 8,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 1,
    size: 'md',
  },
  argTypes: {
    separator: { control: 'text' },
    maxItems: { control: 'number' },
    itemsBeforeCollapse: { control: 'number' },
    itemsAfterCollapse: { control: 'number' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/products">Products</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/products/widgets">Widgets</Breadcrumbs.Item>
      <Breadcrumbs.Item active>Turbo Widget 3000</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const Basic: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/docs">Documentation</Breadcrumbs.Item>
      <Breadcrumbs.Item active>Getting Started</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const WithCollapse: Story = {
  render: () => (
    <Breadcrumbs maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2}>
      <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud">Cloud</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud/projects">Projects</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud/projects/alpha">Alpha</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud/projects/alpha/clusters">Clusters</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud/projects/alpha/clusters/prod">Production</Breadcrumbs.Item>
      <Breadcrumbs.Item active>Deployments</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Breadcrumbs separator=">">
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/settings">Settings</Breadcrumbs.Item>
        <Breadcrumbs.Item active>Profile</Breadcrumbs.Item>
      </Breadcrumbs>

      <Breadcrumbs separator="|">
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/settings">Settings</Breadcrumbs.Item>
        <Breadcrumbs.Item active>Profile</Breadcrumbs.Item>
      </Breadcrumbs>

      <Breadcrumbs
        separator={
          <span aria-hidden="true" style={{ fontSize: '0.75em' }}>
            {'\u276F'}
          </span>
        }
      >
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/settings">Settings</Breadcrumbs.Item>
        <Breadcrumbs.Item active>Profile</Breadcrumbs.Item>
      </Breadcrumbs>
    </div>
  ),
};

export const ActiveLastItem: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cluster">Cluster</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cluster/namespaces">Namespaces</Breadcrumbs.Item>
      <Breadcrumbs.Item active>default</Breadcrumbs.Item>
    </Breadcrumbs>
  ),
};
