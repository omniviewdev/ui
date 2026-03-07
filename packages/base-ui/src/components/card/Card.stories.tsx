import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    elevation: 0,
    surface: 'default',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    elevation: { control: 'inline-radio', options: [0, 1, 2, 3] },
    surface: { control: 'select', options: ['base', 'default', 'raised', 'overlay', 'inset', 'elevated'] },
  },
  parameters: {
    docs: {
      source: {
        code: `<Card variant="soft" color="neutral" size="md" style={{ width: 420 }}>
  <Card.Header>
    <Card.Title>Workspace Session</Card.Title>
    <Card.Description>Connected to cluster and ready for operations.</Card.Description>
  </Card.Header>
  <Card.Body>Last sync 7s ago. No blocking diagnostics. Build queue is currently idle.</Card.Body>
  <Card.Footer>
    <Button color="brand" variant="solid">Open</Button>
    <Button variant="ghost">Dismiss</Button>
  </Card.Footer>
</Card>`,
      },
    },
  },
  render: (args) => (
    <Card {...args} style={{ width: 420 }}>
      <Card.Header>
        <Card.Title>Workspace Session</Card.Title>
        <Card.Description>Connected to cluster and ready for operations.</Card.Description>
      </Card.Header>
      <Card.Body>
        Last sync 7s ago. No blocking diagnostics. Build queue is currently idle.
      </Card.Body>
      <Card.Footer>
        <Button color="brand" variant="solid">
          Open
        </Button>
        <Button variant="ghost">Dismiss</Button>
      </Card.Footer>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SurfaceAndElevation: Story = {
  name: 'Surface & Elevation',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {(['base', 'default', 'raised', 'overlay', 'inset', 'elevated'] as const).map((surface) => (
          <Card key={surface} {...args} surface={surface} style={{ width: 200 }}>
            <Card.Header>
              <Card.Eyebrow>{surface}</Card.Eyebrow>
              <Card.Title>Surface</Card.Title>
              <Card.Description>elevation {args.elevation ?? 0}</Card.Description>
            </Card.Header>
          </Card>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {([0, 1, 2, 3] as const).map((elevation) => (
          <Card key={elevation} {...args} elevation={elevation} style={{ width: 200 }}>
            <Card.Header>
              <Card.Eyebrow>Elevation {elevation}</Card.Eyebrow>
              <Card.Title>Shadow Depth</Card.Title>
              <Card.Description>{args.surface ?? 'default'} surface</Card.Description>
            </Card.Header>
          </Card>
        ))}
      </div>
    </div>
  ),
};

export const StatCard: Story = {
  name: 'Stat / Metric',
  render: (args) => (
    <Card {...args} style={{ width: 240 }}>
      <Card.Header>
        <Card.Eyebrow>P99 Latency</Card.Eyebrow>
        <Card.Stat mono>142ms</Card.Stat>
        <Card.Description>Down 12% from last week</Card.Description>
      </Card.Header>
    </Card>
  ),
};

export const StatusCard: Story = {
  name: 'Status / Resource',
  args: { variant: 'soft', color: 'success' },
  render: (args) => (
    <Card {...args} style={{ width: 340 }}>
      <Card.Header>
        <Card.Indicator status="success">Healthy</Card.Indicator>
        <Card.Title>nginx-deployment</Card.Title>
        <Card.Action>
          <Button variant="outline" size="sm">
            ···
          </Button>
        </Card.Action>
      </Card.Header>
      <Card.Body>
        <Card.KeyValue label="Replicas" mono>3/3</Card.KeyValue>
        <Card.KeyValue label="Namespace">production</Card.KeyValue>
        <Card.KeyValue label="Age">14d</Card.KeyValue>
        <Card.KeyValue label="CPU Usage" mono>42%</Card.KeyValue>
      </Card.Body>
    </Card>
  ),
};

export const InteractiveCard: Story = {
  name: 'Interactive / Clickable',
  args: { variant: 'outline' },
  render: (args) => (
    <Card {...args} style={{ width: 300 }}>
      <Card.ActionArea onClick={() => alert('Card clicked!')}>
        <Card.Header>
          <Card.Eyebrow mono>ARM64</Card.Eyebrow>
          <Card.Title>macOS Apple Silicon</Card.Title>
          <Card.Description>M1, M2, M3, M4 compatible</Card.Description>
        </Card.Header>
      </Card.ActionArea>
    </Card>
  ),
};

export const PropertyCard: Story = {
  name: 'Property / Key-Value',
  render: (args) => (
    <Card {...args} style={{ width: 380 }}>
      <Card.Header>
        <Card.Title>Pod Configuration</Card.Title>
        <Card.Description>kube-system / coredns-5d78c9869d-x4k2p</Card.Description>
      </Card.Header>
      <Card.Separator />
      <Card.Body>
        <Card.KeyValue label="Image" mono>coredns/coredns:1.11.1</Card.KeyValue>
        <Card.KeyValue label="Restart Policy">Always</Card.KeyValue>
        <Card.KeyValue label="Service Account" mono>coredns</Card.KeyValue>
        <Card.KeyValue label="Node">worker-01</Card.KeyValue>
        <Card.KeyValue label="QoS Class">Burstable</Card.KeyValue>
      </Card.Body>
      <Card.Footer>
        <Button variant="ghost">View YAML</Button>
        <Button variant="ghost">Logs</Button>
      </Card.Footer>
    </Card>
  ),
};

export const ProgressCard: Story = {
  name: 'Progress / Build Status',
  args: { variant: 'soft', color: 'brand' },
  render: (args) => (
    <Card {...args} style={{ width: 360 }}>
      <Card.Header>
        <Card.Indicator status="warning" pulse>
          Building
        </Card.Indicator>
        <Card.Title>frontend-app</Card.Title>
        <Card.Description>Commit a3f29b1 — feat: add dashboard view</Card.Description>
      </Card.Header>
      <Card.Body>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: 'var(--ov-color-bg-inset)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '67%',
              height: '100%',
              borderRadius: 2,
              background: 'var(--ov-color-brand-400)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <Card.KeyValue label="Step" mono>3 of 5</Card.KeyValue>
          <Card.KeyValue label="Duration" mono>2m 14s</Card.KeyValue>
          <Card.KeyValue label="Current">Running unit tests</Card.KeyValue>
        </div>
      </Card.Body>
    </Card>
  ),
};

export const MediaCard: Story = {
  name: 'Media / Preview',
  render: (args) => (
    <Card {...args} style={{ width: 340 }}>
      <Card.Media ratio={16 / 9}>
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, var(--ov-color-brand-400) 0%, var(--ov-color-info) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Preview
        </div>
      </Card.Media>
      <Card.Header>
        <Card.Eyebrow>Plugin</Card.Eyebrow>
        <Card.Title>Kubernetes Dashboard</Card.Title>
        <Card.Description>Real-time cluster monitoring and management</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button color="brand" variant="solid">
          Install
        </Button>
        <Button variant="ghost">Details</Button>
      </Card.Footer>
    </Card>
  ),
};

export const ToolbarCard: Story = {
  name: 'Toolbar / Actions',
  render: (args) => (
    <Card {...args} style={{ width: 380 }}>
      <Card.Header>
        <Card.Title>Log Output</Card.Title>
        <Card.Action>
          <Button variant="ghost" size="sm">
            Clear
          </Button>
        </Card.Action>
      </Card.Header>
      <Card.Body>
        <div
          style={{
            fontFamily: 'var(--ov-font-mono)',
            fontSize: 'var(--ov-primitive-font-size-12)',
            lineHeight: 1.6,
            color: 'var(--ov-color-fg-muted)',
          }}
        >
          <div>[INFO] Server started on :8080</div>
          <div>[INFO] Connected to database</div>
          <div style={{ color: 'var(--ov-color-warning)' }}>[WARN] Cache miss rate high</div>
          <div>[INFO] Health check passed</div>
        </div>
      </Card.Body>
      <Card.Toolbar>
        <Button variant="ghost" size="sm">
          Copy
        </Button>
        <Button variant="ghost" size="sm">
          Download
        </Button>
        <Button variant="ghost" size="sm">
          Wrap
        </Button>
      </Card.Toolbar>
    </Card>
  ),
};

export const HorizontalCard: Story = {
  name: 'Horizontal / Row Layout',
  render: (args) => (
    <Card {...args} style={{ width: 380 }}>
      <Card.Row align="center" gap="md">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--ov-radius-control)',
            background: 'var(--ov-color-brand-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          JP
        </div>
        <div>
          <Card.Title>Joshua Pare</Card.Title>
          <Card.Description>Platform Engineer · Online</Card.Description>
        </div>
      </Card.Row>
      <Card.Separator />
      <Card.Body>
        <Card.KeyValue label="Team">Infrastructure</Card.KeyValue>
        <Card.KeyValue label="Clusters" mono>12</Card.KeyValue>
        <Card.KeyValue label="Last Active">2 min ago</Card.KeyValue>
      </Card.Body>
    </Card>
  ),
};

export const CardGrid: Story = {
  name: 'Card Grid',
  render: () => (
    <Card.Group columns={3} gap="md">
      {(['API Gateway', 'Auth Service', 'Worker Pool', 'Cache Layer', 'Message Queue', 'Scheduler'] as const).map(
        (name, i) => {
          const statuses = ['success', 'success', 'warning', 'success', 'danger', 'success'] as const;
          const values = ['23ms', '45ms', '210ms', '8ms', '—', '67ms'];
          return (
            <Card key={name} variant="soft" size="sm">
              <Card.Header>
                <Card.Indicator status={statuses[i]}>
                  {statuses[i] === 'success' ? 'Healthy' : statuses[i] === 'warning' ? 'Degraded' : 'Down'}
                </Card.Indicator>
                <Card.Title>{name}</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.KeyValue label="Latency" mono>{values[i]}</Card.KeyValue>
                <Card.KeyValue label="Uptime" mono>{statuses[i] === 'danger' ? '94.2%' : '99.9%'}</Card.KeyValue>
              </Card.Body>
            </Card>
          );
        },
      )}
    </Card.Group>
  ),
};

export const NotificationCard: Story = {
  name: 'Notification / Alert',
  args: { variant: 'solid', color: 'warning' },
  render: (args) => (
    <Card {...args} style={{ width: 400 }}>
      <Card.Header>
        <Card.Indicator status="warning">Warning</Card.Indicator>
        <Card.Title>High Memory Usage Detected</Card.Title>
        <Card.Description>
          Node worker-03 is using 92% of available memory. Consider scaling or investigating the workload.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button color="warning" variant="solid">
          Investigate
        </Button>
        <Button variant="ghost">Dismiss</Button>
      </Card.Footer>
    </Card>
  ),
};

export const CoverCard: Story = {
  name: 'Cover / Background',
  args: { variant: 'ghost' },
  render: (args) => (
    <Card {...args} style={{ width: 360 }}>
      <Card.Cover>
        <div
          style={{
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(135deg, rgba(90,127,226,0.15) 0%, rgba(87,196,138,0.1) 100%)',
          }}
        />
      </Card.Cover>
      <Card.Header>
        <Card.Eyebrow>Featured</Card.Eyebrow>
        <Card.Title>Getting Started with Omniview</Card.Title>
        <Card.Description>
          Connect your first cluster and start exploring your infrastructure.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button color="brand" variant="solid">
          Start Tutorial
        </Button>
      </Card.Footer>
    </Card>
  ),
};
