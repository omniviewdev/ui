import type { Meta, StoryObj } from '@storybook/react';
import { LuCheck, LuX } from 'react-icons/lu';
import { Chip } from '../chip';
import { Code, Link } from '../typography';
import { Table, type TableProps } from './Table';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface EndpointRow {
  endpoint: string;
  method: HttpMethod;
  docs: string;
}

const endpointRows: EndpointRow[] = [
  { endpoint: '/api/v1/chat', method: 'POST', docs: 'Chat' },
  { endpoint: '/api/v1/models', method: 'GET', docs: 'List Models' },
  { endpoint: '/api/v1/models/load', method: 'POST', docs: 'Load' },
  { endpoint: '/api/v1/models/unload', method: 'POST', docs: 'Unload' },
  { endpoint: '/api/v1/models/download', method: 'POST', docs: 'Download' },
  { endpoint: '/api/v1/models/download/status', method: 'GET', docs: 'Download Status' },
];

const comparisonRows = [
  {
    feature: 'Streaming',
    nativeChat: true,
    responses: true,
    chatCompletions: true,
    messages: true,
  },
  {
    feature: 'Stateful chat',
    nativeChat: true,
    responses: true,
    chatCompletions: false,
    messages: false,
  },
  {
    feature: 'Remote MCPs',
    nativeChat: true,
    responses: true,
    chatCompletions: false,
    messages: false,
  },
  {
    feature: 'Custom tools',
    nativeChat: false,
    responses: true,
    chatCompletions: true,
    messages: true,
  },
];

const runtimeRows = Array.from({ length: 24 }, (_, index) => ({
  worker: `worker-${String(index + 1).padStart(2, '0')}`,
  status: index % 4 === 0 ? 'warming' : index % 5 === 0 ? 'degraded' : 'healthy',
  queueDepth: Math.max(0, 32 - index),
}));

function methodColor(method: HttpMethod): 'brand' | 'success' | 'warning' | 'danger' {
  switch (method) {
    case 'GET':
      return 'success';
    case 'PATCH':
      return 'warning';
    case 'DELETE':
      return 'danger';
    default:
      return 'brand';
  }
}

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    layout: 'auto',
    striped: false,
    hoverable: true,
    stickyHeader: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    layout: { control: 'inline-radio', options: ['auto', 'fixed'] },
    striped: { control: 'boolean' },
    hoverable: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
  },
  parameters: {
    docs: {
      source: {
        code: `<Table.Container>
  <Table.Root variant="soft" color="neutral" size="md" hoverable>
    <Table.Head>
      <Table.Row>
        <Table.HeaderCell>Endpoint</Table.HeaderCell>
        <Table.HeaderCell>Method</Table.HeaderCell>
        <Table.HeaderCell>Docs</Table.HeaderCell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      <Table.Row>
        <Table.Cell mono><Code>/api/v1/chat</Code></Table.Cell>
        <Table.Cell><Chip size="sm" variant="outline" color="brand" mono>POST</Chip></Table.Cell>
        <Table.Cell><Link href="#">Chat</Link></Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table.Root>
</Table.Container>`,
      },
    },
  },
  render: (args) => (
    <Table.Container>
      <Table.Root {...args}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell style={{ width: '58%' }}>Endpoint</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '18%' }}>Method</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '24%' }}>Docs</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {endpointRows.map((row) => (
            <Table.Row key={row.endpoint}>
              <Table.Cell mono>
                <Code>{row.endpoint}</Code>
              </Table.Cell>
              <Table.Cell>
                <Chip size="sm" variant="outline" color={methodColor(row.method)} mono>
                  {row.method}
                </Chip>
              </Table.Cell>
              <Table.Cell>
                <Link href="#">{row.docs}</Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.Container>
  ),
} satisfies Meta<TableProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const MarkdownRendererTable: Story = {
  render: () => (
    <Table.Container>
      <Table.Root variant="soft" color="neutral" size="md" striped hoverable>
        <Table.Caption side="top">Markdown table rendering baseline</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Column</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Default</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell mono>workspace_id</Table.Cell>
            <Table.Cell>string</Table.Cell>
            <Table.Cell mono>required</Table.Cell>
            <Table.Cell truncate>
              Stable workspace identifier used by routing and persisted views.
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell mono>dense_mode</Table.Cell>
            <Table.Cell>boolean</Table.Cell>
            <Table.Cell mono>false</Table.Cell>
            <Table.Cell>Compacts tree rows and action list spacing.</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell mono>auto_save</Table.Cell>
            <Table.Cell>boolean</Table.Cell>
            <Table.Cell mono>true</Table.Cell>
            <Table.Cell>Persists edits in the background while typing.</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Table.Container>
  ),
};

export const InferenceComparison: Story = {
  render: () => (
    <Table.Container>
      <Table.Root variant="soft" color="brand" size="md" hoverable>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell style={{ width: '34%' }}>Feature</Table.HeaderCell>
            <Table.HeaderCell align="center" style={{ width: '16%' }}>
              /api/v1/chat
            </Table.HeaderCell>
            <Table.HeaderCell align="center" style={{ width: '16%' }}>
              /v1/responses
            </Table.HeaderCell>
            <Table.HeaderCell align="center" style={{ width: '17%' }}>
              /v1/chat/completions
            </Table.HeaderCell>
            <Table.HeaderCell align="center" style={{ width: '17%' }}>
              /v1/messages
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {comparisonRows.map((row) => (
            <Table.Row key={row.feature}>
              <Table.Cell>{row.feature}</Table.Cell>
              <Table.Cell align="center" tone={row.nativeChat ? 'success' : 'danger'}>
                {row.nativeChat ? (
                  <LuCheck aria-label="supported" />
                ) : (
                  <LuX aria-label="unsupported" />
                )}
              </Table.Cell>
              <Table.Cell align="center" tone={row.responses ? 'success' : 'danger'}>
                {row.responses ? (
                  <LuCheck aria-label="supported" />
                ) : (
                  <LuX aria-label="unsupported" />
                )}
              </Table.Cell>
              <Table.Cell align="center" tone={row.chatCompletions ? 'success' : 'danger'}>
                {row.chatCompletions ? (
                  <LuCheck aria-label="supported" />
                ) : (
                  <LuX aria-label="unsupported" />
                )}
              </Table.Cell>
              <Table.Cell align="center" tone={row.messages ? 'success' : 'danger'}>
                {row.messages ? (
                  <LuCheck aria-label="supported" />
                ) : (
                  <LuX aria-label="unsupported" />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.Container>
  ),
};

export const StickyHeader: Story = {
  render: () => (
    <Table.Container maxHeight={280}>
      <Table.Root variant="soft" color="neutral" stickyHeader hoverable striped>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Worker</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell numeric>Queue Depth</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {runtimeRows.map((row) => (
            <Table.Row key={row.worker} interactive>
              <Table.Cell mono>{row.worker}</Table.Cell>
              <Table.Cell
                tone={
                  row.status === 'healthy'
                    ? 'success'
                    : row.status === 'degraded'
                      ? 'warning'
                      : 'subtle'
                }
              >
                {row.status}
              </Table.Cell>
              <Table.Cell numeric mono>
                {row.queueDepth}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.Container>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 18 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Table.Container key={size}>
          <Table.Root size={size} variant="soft" color="neutral">
            <Table.Caption side="top">{size.toUpperCase()} density</Table.Caption>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Field</Table.HeaderCell>
                <Table.HeaderCell>Value</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell mono>theme</Table.Cell>
                <Table.Cell>dark</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell mono>runtime</Table.Cell>
                <Table.Cell>docker</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Table.Container>
      ))}
    </div>
  ),
};
