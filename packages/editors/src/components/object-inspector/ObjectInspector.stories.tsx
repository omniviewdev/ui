import type { Meta, StoryObj } from '@storybook/react';
import { ObjectInspector } from './ObjectInspector';

const sampleData = {
  apiVersion: 'v1',
  kind: 'Pod',
  metadata: {
    name: 'my-pod',
    namespace: 'default',
    labels: {
      app: 'web',
      version: 'v1.2.3',
    },
  },
  spec: {
    containers: [
      {
        name: 'web',
        image: 'nginx:latest',
        ports: [{ containerPort: 80 }],
        env: [
          { name: 'NODE_ENV', value: 'production' },
          { name: 'PORT', value: '8080' },
        ],
      },
    ],
    restartPolicy: 'Always',
  },
  status: {
    phase: 'Running',
    conditions: [
      { type: 'Ready', status: true },
      { type: 'PodScheduled', status: true },
    ],
    startTime: '2024-01-15T10:30:00Z',
  },
};

const meta: Meta<typeof ObjectInspector> = {
  title: 'Editors/ObjectInspector',
  component: ObjectInspector,
  tags: ['autodocs'],
  args: {
    data: sampleData,
    defaultExpanded: 2,
  },
  argTypes: {
    format: { control: 'radio', options: ['json', 'yaml'] },
    defaultExpanded: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    searchable: { control: 'boolean' },
    copyable: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, height: 500 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const FullyExpanded: Story = {
  args: {
    defaultExpanded: true,
  },
};

export const Collapsed: Story = {
  args: {
    defaultExpanded: 0,
  },
};

export const WithSearch: Story = {
  args: {
    searchable: true,
    defaultExpanded: true,
  },
};

export const WithCopy: Story = {
  args: {
    copyable: true,
  },
};

export const WithSearchAndCopy: Story = {
  args: {
    searchable: true,
    copyable: true,
    defaultExpanded: true,
  },
};

export const YamlFormat: Story = {
  args: {
    format: 'yaml',
    copyable: true,
  },
};

export const SimpleArray: Story = {
  args: {
    data: ['hello', 42, true, null, { nested: 'value' }],
    defaultExpanded: true,
  },
};
