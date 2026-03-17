import type { Meta, StoryObj } from '@storybook/react';
import {
  LuGitBranch,
  LuCircleX,
  LuTriangleAlert,
  LuWifi,
  LuWifiOff,
  LuClock,
  LuCloud,
  LuCloudOff,
  LuRefreshCw,
  LuCheck,
  LuBell,
  LuSettings,
} from 'react-icons/lu';
import { StatusBar } from './StatusBar';

const meta = {
  title: 'StatusBar/StatusBar',
  component: StatusBar,
  tags: ['autodocs'],
  args: {
    size: 'sm',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  render: (args) => (
    <StatusBar {...args}>
      <StatusBar.Section align="start">
        <StatusBar.IconItem icon={<LuGitBranch />} onClick={() => {}}>
          main
        </StatusBar.IconItem>
        <StatusBar.Separator />
        <StatusBar.IconItem icon={<LuCircleX />}>0</StatusBar.IconItem>
        <StatusBar.IconItem icon={<LuTriangleAlert />}>2</StatusBar.IconItem>
        <StatusBar.Separator />
        <StatusBar.Indicator status="success" pulse label="Connected" />
      </StatusBar.Section>
      <StatusBar.Section align="end">
        <StatusBar.Progress value={72} label="Indexing" color="brand" />
        <StatusBar.Separator />
        <StatusBar.Item onClick={() => {}}>Ln 42, Col 18</StatusBar.Item>
        <StatusBar.Separator />
        <StatusBar.Item onClick={() => {}}>UTF-8</StatusBar.Item>
        <StatusBar.Separator />
        <StatusBar.Item onClick={() => {}}>TypeScript React</StatusBar.Item>
      </StatusBar.Section>
    </StatusBar>
  ),
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const IDEStatusBar: Story = {
  name: 'IDE Status Bar',
  render: () => (
    <StatusBar>
      <StatusBar.Section align="start">
        <StatusBar.IconItem icon={<LuGitBranch />} onClick={() => {}}>
          feat/ai-ui
        </StatusBar.IconItem>
        <StatusBar.Separator />
        <StatusBar.IconItem icon={<LuCircleX />} color="danger">0</StatusBar.IconItem>
        <StatusBar.IconItem icon={<LuTriangleAlert />} color="warning">3</StatusBar.IconItem>
        <StatusBar.Separator />
        <StatusBar.Indicator status="success" pulse label="Kubernetes Connected" />
      </StatusBar.Section>
      <StatusBar.Section align="center">
        <StatusBar.Progress value={45} label="Indexing files" color="brand" />
      </StatusBar.Section>
      <StatusBar.Section align="end">
        <StatusBar.IconItem icon={<LuBell />} onClick={() => {}}>3</StatusBar.IconItem>
        <StatusBar.Separator />
        <StatusBar.Item onClick={() => {}}>Ln 142, Col 37</StatusBar.Item>
        <StatusBar.Separator />
        <StatusBar.Item onClick={() => {}}>Spaces: 2</StatusBar.Item>
        <StatusBar.Separator />
        <StatusBar.Item onClick={() => {}}>YAML</StatusBar.Item>
        <StatusBar.Separator />
        <StatusBar.IconItem icon={<LuSettings />} onClick={() => {}}>
          Settings
        </StatusBar.IconItem>
      </StatusBar.Section>
    </StatusBar>
  ),
};

export const WithProgress: Story = {
  name: 'With Progress',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
          Determinate (45%)
        </div>
        <StatusBar>
          <StatusBar.Section align="start">
            <StatusBar.Progress value={45} label="Building" color="brand" />
          </StatusBar.Section>
          <StatusBar.Section align="end">
            <StatusBar.Item>45% complete</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      </div>
      <div>
        <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
          Indeterminate
        </div>
        <StatusBar>
          <StatusBar.Section align="start">
            <StatusBar.Progress label="Loading workspace" color="info" />
          </StatusBar.Section>
        </StatusBar>
      </div>
      <div>
        <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
          Complete (100%)
        </div>
        <StatusBar>
          <StatusBar.Section align="start">
            <StatusBar.Progress value={100} label="Build complete" color="success" />
            <StatusBar.Separator />
            <StatusBar.IconItem icon={<LuCheck />} color="success">Done</StatusBar.IconItem>
          </StatusBar.Section>
        </StatusBar>
      </div>
    </div>
  ),
};

export const ConnectionStates: Story = {
  name: 'Connection States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
          Connected (pulse)
        </div>
        <StatusBar>
          <StatusBar.Section align="start">
            <StatusBar.IconItem icon={<LuWifi />} color="success">Online</StatusBar.IconItem>
            <StatusBar.Separator />
            <StatusBar.Indicator status="success" pulse label="API Connected" />
            <StatusBar.Separator />
            <StatusBar.Indicator status="success" pulse label="Database" />
          </StatusBar.Section>
        </StatusBar>
      </div>
      <div>
        <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
          Degraded
        </div>
        <StatusBar>
          <StatusBar.Section align="start">
            <StatusBar.IconItem icon={<LuCloud />} color="warning">Degraded</StatusBar.IconItem>
            <StatusBar.Separator />
            <StatusBar.Indicator status="success" label="API" />
            <StatusBar.Separator />
            <StatusBar.Indicator status="warning" pulse label="Cache Slow" />
            <StatusBar.Separator />
            <StatusBar.Indicator status="danger" label="Queue Down" />
          </StatusBar.Section>
        </StatusBar>
      </div>
      <div>
        <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
          Disconnected
        </div>
        <StatusBar>
          <StatusBar.Section align="start">
            <StatusBar.IconItem icon={<LuWifiOff />} color="danger">Offline</StatusBar.IconItem>
            <StatusBar.Separator />
            <StatusBar.Indicator status="danger" label="Disconnected" />
          </StatusBar.Section>
          <StatusBar.Section align="end">
            <StatusBar.IconItem icon={<LuRefreshCw />} onClick={() => {}}>Retry</StatusBar.IconItem>
          </StatusBar.Section>
        </StatusBar>
      </div>
      <div>
        <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
          Reconnecting
        </div>
        <StatusBar>
          <StatusBar.Section align="start">
            <StatusBar.IconItem icon={<LuCloudOff />} color="warning">Reconnecting</StatusBar.IconItem>
            <StatusBar.Separator />
            <StatusBar.Indicator status="warning" pulse label="Attempting reconnect..." />
            <StatusBar.Separator />
            <StatusBar.Progress label="Retry in" color="warning" />
          </StatusBar.Section>
        </StatusBar>
      </div>
      <div>
        <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
          All colors
        </div>
        <StatusBar>
          <StatusBar.Section align="start">
            <StatusBar.Indicator status="neutral" label="Neutral" />
            <StatusBar.Separator />
            <StatusBar.Indicator status="pending" pulse label="Pending" />
            <StatusBar.Separator />
            <StatusBar.Indicator status="success" pulse label="Success" />
            <StatusBar.Separator />
            <StatusBar.Indicator status="warning" pulse label="Warning" />
            <StatusBar.Separator />
            <StatusBar.Indicator status="danger" pulse label="Danger" />
            <StatusBar.Separator />
            <StatusBar.Indicator status="info" pulse label="Info" />
          </StatusBar.Section>
        </StatusBar>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
            size=&quot;{size}&quot;
          </div>
          <StatusBar size={size}>
            <StatusBar.Section align="start">
              <StatusBar.IconItem icon={<LuGitBranch />} onClick={() => {}}>
                main
              </StatusBar.IconItem>
              <StatusBar.Separator />
              <StatusBar.Indicator status="success" pulse label="Connected" />
              <StatusBar.Separator />
              <StatusBar.Progress value={60} label="Syncing" color="brand" />
            </StatusBar.Section>
            <StatusBar.Section align="end">
              <StatusBar.IconItem icon={<LuClock />}>
                12:34 PM
              </StatusBar.IconItem>
              <StatusBar.Separator />
              <StatusBar.Item>Ready</StatusBar.Item>
            </StatusBar.Section>
          </StatusBar>
        </div>
      ))}
    </div>
  ),
};
