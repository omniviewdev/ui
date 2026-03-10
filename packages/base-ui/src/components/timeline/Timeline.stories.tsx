import type { Meta, StoryObj } from '@storybook/react';
import { LuCircleCheck, LuCircleX, LuLoader, LuRocket, LuTriangleAlert, LuInfo } from 'react-icons/lu';
import { Timeline } from './Timeline';
import { Spinner } from '../spinner';

const meta = {
  title: 'Data Display/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  args: {
    size: 'md',
    children: null,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item timestamp="10:42 AM" color="success" icon={<LuCircleCheck />}>
        Pod deployed successfully
      </Timeline.Item>
      <Timeline.Item timestamp="10:40 AM" color="brand" icon={<LuRocket />}>
        Deployment started
      </Timeline.Item>
      <Timeline.Item timestamp="10:38 AM">
        Image pulled from registry
      </Timeline.Item>
    </Timeline>
  ),
};

export const PodLifecycle: Story = {
  name: 'Pod lifecycle events',
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item timestamp="10:45" color="success" icon={<LuCircleCheck />}>
        <strong>Running</strong>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.4 }}>All containers ready (3/3)</div>
      </Timeline.Item>
      <Timeline.Item timestamp="10:43" color="brand" icon={<LuLoader />}>
        <strong>ContainerCreating</strong>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.4 }}>Pulling image nginx:1.25</div>
      </Timeline.Item>
      <Timeline.Item timestamp="10:42">
        <strong>Scheduled</strong>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.4 }}>Assigned to node worker-03</div>
      </Timeline.Item>
      <Timeline.Item timestamp="10:42">
        <strong>Pending</strong>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.4 }}>Pod created by ReplicaSet nginx-abc123</div>
      </Timeline.Item>
    </Timeline>
  ),
};

export const Expandable: Story = {
  name: 'Expandable items',
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item
        timestamp="10:45"
        color="success"
        icon={<LuCircleCheck />}
        defaultExpanded
        details={
          <div style={{ fontSize: '0.8125rem', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div>Container: nginx (ready)</div>
            <div>Container: sidecar (ready)</div>
            <div>Image: nginx:1.25-alpine</div>
          </div>
        }
      >
        <strong>Running</strong> — All containers ready
      </Timeline.Item>
      <Timeline.Item
        timestamp="10:43"
        color="brand"
        icon={<LuRocket />}
        details={
          <Timeline size="sm">
            <Timeline.Item color="success" icon={<LuCircleCheck />}>
              Container started
            </Timeline.Item>
            <Timeline.Item color="success" icon={<LuCircleCheck />}>
              Container created
            </Timeline.Item>
            <Timeline.Item color="success" icon={<LuCircleCheck />}>
              Image pulled: nginx:1.25-alpine
            </Timeline.Item>
          </Timeline>
        }
      >
        <strong>Deployment started</strong> — 3 steps
      </Timeline.Item>
      <Timeline.Item timestamp="10:42">
        Scheduled to node worker-03
      </Timeline.Item>
    </Timeline>
  ),
};

export const WithGroups: Story = {
  name: 'With date groups',
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Group label="Today">
        <Timeline.Item timestamp="3:15 PM" color="danger" icon={<LuCircleX />}>
          OOMKilled — container exceeded memory limit
        </Timeline.Item>
        <Timeline.Item timestamp="2:00 PM" color="success" icon={<LuCircleCheck />}>
          Scaled up to 5 replicas
        </Timeline.Item>
      </Timeline.Group>
      <Timeline.Group label="Yesterday">
        <Timeline.Item timestamp="11:30 AM" color="success" icon={<LuCircleCheck />}>
          Initial deployment
        </Timeline.Item>
      </Timeline.Group>
    </Timeline>
  ),
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.5 }}>
            size=&quot;{size}&quot;
          </div>
          <Timeline size={size}>
            <Timeline.Item timestamp="10:42" color="success" icon={<LuCircleCheck />}>
              Pod deployed successfully
            </Timeline.Item>
            <Timeline.Item timestamp="10:40" color="brand" icon={<LuRocket />}>
              Deployment started
            </Timeline.Item>
            <Timeline.Item timestamp="10:38">
              Image pulled from registry
            </Timeline.Item>
          </Timeline>
        </div>
      ))}
    </div>
  ),
};

export const ColorVariants: Story = {
  name: 'All color variants',
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item color="neutral">Neutral — default dot</Timeline.Item>
      <Timeline.Item color="brand" icon={<LuRocket />}>Brand</Timeline.Item>
      <Timeline.Item color="success" icon={<LuCircleCheck />}>Success</Timeline.Item>
      <Timeline.Item color="warning" icon={<LuTriangleAlert />}>Warning</Timeline.Item>
      <Timeline.Item color="danger" icon={<LuCircleX />}>Danger</Timeline.Item>
      <Timeline.Item color="info" icon={<LuInfo />}>Info</Timeline.Item>
    </Timeline>
  ),
};

export const WithSpinner: Story = {
  name: 'With Spinner indicator',
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item timestamp="10:45" color="success" icon={<LuCircleCheck />}>
        <strong>Deployed</strong>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.4 }}>All replicas healthy</div>
      </Timeline.Item>
      <Timeline.Item timestamp="10:43" icon={<Spinner size="sm" color="brand" />}>
        <strong>Rolling update</strong>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.4 }}>3 of 5 pods updated</div>
      </Timeline.Item>
      <Timeline.Item timestamp="10:42" icon={<Spinner size="sm" color="neutral" />}>
        <strong>Pulling image</strong>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.4 }}>nginx:1.25-alpine</div>
      </Timeline.Item>
      <Timeline.Item timestamp="10:41">
        Scheduled on node worker-03
      </Timeline.Item>
    </Timeline>
  ),
};

export const NoTimestamps: Story = {
  name: 'Without timestamps',
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item color="success" icon={<LuCircleCheck />}>
        Build succeeded
      </Timeline.Item>
      <Timeline.Item color="brand" icon={<LuLoader />}>
        Running tests
      </Timeline.Item>
      <Timeline.Item>
        Queued
      </Timeline.Item>
    </Timeline>
  ),
};
