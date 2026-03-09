import type { Meta, StoryObj } from '@storybook/react';
import { LuChevronRight, LuMinus, LuSlash, LuHouse, LuFolder, LuSettings, LuFile } from 'react-icons/lu';
import { Breadcrumbs } from './Breadcrumbs';

const meta = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  args: {
    separator: undefined,
    maxItems: 4,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 2,
    size: 'md',
  },
  argTypes: {
    separator: { control: false },
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
      <Breadcrumbs.Item href="/cloud">Cloud</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud/projects">Projects</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud/projects/alpha">Alpha</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud/projects/alpha/clusters">Clusters</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/cloud/projects/alpha/clusters/prod">Production</Breadcrumbs.Item>
      <Breadcrumbs.Item active>Deployments</Breadcrumbs.Item>
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

export const WithIcons: Story = {
  name: 'With icons',
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Item href="/">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <LuHouse size={14} /> Home
        </span>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item href="/projects">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <LuFolder size={14} /> Projects
        </span>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item href="/projects/settings">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <LuSettings size={14} /> Settings
        </span>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item active>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <LuFile size={14} /> config.yaml
        </span>
      </Breadcrumbs.Item>
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
      <Breadcrumbs separator={<LuChevronRight aria-hidden />}>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/settings">Settings</Breadcrumbs.Item>
        <Breadcrumbs.Item active>Profile</Breadcrumbs.Item>
      </Breadcrumbs>

      <Breadcrumbs separator={<LuSlash aria-hidden />}>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/settings">Settings</Breadcrumbs.Item>
        <Breadcrumbs.Item active>Profile</Breadcrumbs.Item>
      </Breadcrumbs>

      <Breadcrumbs separator={<LuMinus aria-hidden />}>
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
