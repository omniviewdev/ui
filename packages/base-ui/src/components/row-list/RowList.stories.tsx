import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuCircleAlert, LuTriangleAlert, LuInfo, LuCircleCheck } from 'react-icons/lu';
import { RowList } from './RowList';
import type { ColumnDef, SortState } from './types';

const meta: Meta = {
  title: 'Lists/RowList',
  tags: ['autodocs'],
  args: {
    size: 'md',
    density: 'default',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Controls the overall size of list items.',
      table: { defaultValue: { summary: 'md' } },
    },
    density: {
      control: 'inline-radio',
      options: ['compact', 'default', 'comfortable'],
      description: 'Controls vertical density.',
      table: { defaultValue: { summary: 'default' } },
    },
  },
  parameters: {
    controls: {
      include: ['size', 'density'],
    },
  },
};

export default meta;

type Story = StoryObj;

// ---------------------------------------------------------------------------
// BasicColumns
// ---------------------------------------------------------------------------

const basicColumns: ColumnDef[] = [
  { id: 'name', header: 'Name', width: '1fr' },
  { id: 'type', header: 'Type', width: '100px' },
  { id: 'status', header: 'Status', width: '100px', align: 'end' },
];

export const BasicColumns: Story = {
  render: (args) => (
    <RowList columns={basicColumns} {...args} style={{ width: 480 }}>
      <RowList.Header />
      <RowList.Viewport>
        <RowList.Item itemKey="1" textValue="api-server">
          <RowList.Cell column="name">api-server</RowList.Cell>
          <RowList.Cell column="type">Deployment</RowList.Cell>
          <RowList.Cell column="status">Running</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="2" textValue="redis-cache">
          <RowList.Cell column="name">redis-cache</RowList.Cell>
          <RowList.Cell column="type">StatefulSet</RowList.Cell>
          <RowList.Cell column="status">Running</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="3" textValue="batch-worker">
          <RowList.Cell column="name">batch-worker</RowList.Cell>
          <RowList.Cell column="type">CronJob</RowList.Cell>
          <RowList.Cell column="status">Idle</RowList.Cell>
        </RowList.Item>
      </RowList.Viewport>
    </RowList>
  ),
};

// ---------------------------------------------------------------------------
// WithSorting
// ---------------------------------------------------------------------------

const sortableColumns: ColumnDef[] = [
  { id: 'name', header: 'Name', width: '1fr', sortable: true },
  { id: 'size', header: 'Size', width: '80px', sortable: true, align: 'end' },
  { id: 'modified', header: 'Modified', width: '140px', sortable: true },
];

const sortableData = [
  { key: '1', name: 'README.md', size: '2.4 KB', modified: '2 hours ago' },
  { key: '2', name: 'package.json', size: '1.1 KB', modified: 'Yesterday' },
  { key: '3', name: 'tsconfig.json', size: '0.8 KB', modified: '3 days ago' },
  { key: '4', name: 'index.ts', size: '4.2 KB', modified: '1 hour ago' },
];

function WithSortingStory(args: Record<string, unknown>) {
  const [sortState, setSortState] = useState<SortState>({
    columnId: 'name',
    direction: 'ascending',
  });

  const sorted = [...sortableData].sort((a, b) => {
    const col = sortState.columnId as keyof typeof a;
    const cmp = (a[col] ?? '').localeCompare(b[col] ?? '');
    return sortState.direction === 'ascending' ? cmp : -cmp;
  });

  return (
    <RowList
      columns={sortableColumns}
      sortState={sortState}
      onSortChange={setSortState}
      {...args}
      style={{ width: 480 }}
    >
      <RowList.Header />
      <RowList.Viewport>
        {sorted.map((row) => (
          <RowList.Item key={row.key} itemKey={row.key} textValue={row.name}>
            <RowList.Cell column="name">{row.name}</RowList.Cell>
            <RowList.Cell column="size">{row.size}</RowList.Cell>
            <RowList.Cell column="modified">{row.modified}</RowList.Cell>
          </RowList.Item>
        ))}
      </RowList.Viewport>
    </RowList>
  );
}

export const WithSorting: Story = {
  render: (args) => <WithSortingStory {...args} />,
};

// ---------------------------------------------------------------------------
// SingleSelect
// ---------------------------------------------------------------------------

export const SingleSelect: Story = {
  render: (args) => (
    <RowList columns={basicColumns} selectionMode="single" {...args} style={{ width: 480 }}>
      <RowList.Header />
      <RowList.Viewport>
        <RowList.Item itemKey="1" textValue="api-server">
          <RowList.Cell column="name">api-server</RowList.Cell>
          <RowList.Cell column="type">Deployment</RowList.Cell>
          <RowList.Cell column="status">Running</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="2" textValue="redis-cache">
          <RowList.Cell column="name">redis-cache</RowList.Cell>
          <RowList.Cell column="type">StatefulSet</RowList.Cell>
          <RowList.Cell column="status">Running</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="3" textValue="batch-worker">
          <RowList.Cell column="name">batch-worker</RowList.Cell>
          <RowList.Cell column="type">CronJob</RowList.Cell>
          <RowList.Cell column="status">Idle</RowList.Cell>
        </RowList.Item>
      </RowList.Viewport>
    </RowList>
  ),
};

// ---------------------------------------------------------------------------
// MultiSelect
// ---------------------------------------------------------------------------

export const MultiSelect: Story = {
  render: (args) => (
    <RowList columns={basicColumns} selectionMode="multiple" {...args} style={{ width: 480 }}>
      <RowList.Header />
      <RowList.Viewport>
        <RowList.Item itemKey="1" textValue="api-server">
          <RowList.Cell column="name">api-server</RowList.Cell>
          <RowList.Cell column="type">Deployment</RowList.Cell>
          <RowList.Cell column="status">Running</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="2" textValue="redis-cache">
          <RowList.Cell column="name">redis-cache</RowList.Cell>
          <RowList.Cell column="type">StatefulSet</RowList.Cell>
          <RowList.Cell column="status">Running</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="3" textValue="batch-worker">
          <RowList.Cell column="name">batch-worker</RowList.Cell>
          <RowList.Cell column="type">CronJob</RowList.Cell>
          <RowList.Cell column="status">Idle</RowList.Cell>
        </RowList.Item>
      </RowList.Viewport>
    </RowList>
  ),
};

// ---------------------------------------------------------------------------
// DensityVariants
// ---------------------------------------------------------------------------

export const DensityVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 32 }}>
      {(['compact', 'default', 'comfortable'] as const).map((density) => (
        <div key={density}>
          <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13 }}>{density}</div>
          <RowList columns={basicColumns} {...args} density={density} style={{ width: 360 }}>
            <RowList.Header />
            <RowList.Viewport>
              <RowList.Item itemKey="1" textValue="api-server">
                <RowList.Cell column="name">api-server</RowList.Cell>
                <RowList.Cell column="type">Deploy</RowList.Cell>
                <RowList.Cell column="status">Running</RowList.Cell>
              </RowList.Item>
              <RowList.Item itemKey="2" textValue="redis-cache">
                <RowList.Cell column="name">redis-cache</RowList.Cell>
                <RowList.Cell column="type">STS</RowList.Cell>
                <RowList.Cell column="status">Running</RowList.Cell>
              </RowList.Item>
            </RowList.Viewport>
          </RowList>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// ProblemsPanel
// ---------------------------------------------------------------------------

const problemsColumns: ColumnDef[] = [
  { id: 'severity', header: '', width: '32px' },
  { id: 'message', header: 'Message', width: '1fr', sortable: true },
  { id: 'file', header: 'File', width: '120px', sortable: true },
  { id: 'line', header: 'Ln', width: '48px', align: 'end' },
];

const problems = [
  {
    key: '1',
    icon: <LuCircleAlert style={{ color: 'var(--ov-color-danger)' }} />,
    msg: "Cannot find name 'foo'",
    file: 'parser.ts',
    line: 42,
  },
  {
    key: '2',
    icon: <LuTriangleAlert style={{ color: 'var(--ov-color-warning)' }} />,
    msg: 'Unused variable x',
    file: 'index.ts',
    line: 15,
  },
  {
    key: '3',
    icon: <LuInfo style={{ color: 'var(--ov-color-info)' }} />,
    msg: 'Consider using const',
    file: 'utils.ts',
    line: 88,
  },
  {
    key: '4',
    icon: <LuCircleAlert style={{ color: 'var(--ov-color-danger)' }} />,
    msg: "Property 'bar' does not exist",
    file: 'api.ts',
    line: 7,
  },
  {
    key: '5',
    icon: <LuCircleCheck style={{ color: 'var(--ov-color-success)' }} />,
    msg: 'Build succeeded',
    file: 'build.ts',
    line: 1,
  },
];

export const ProblemsPanel: Story = {
  render: (args) => (
    <RowList
      columns={problemsColumns}
      selectionMode="single"
      {...args}
      density="compact"
      style={{ width: 520 }}
    >
      <RowList.Header />
      <RowList.Viewport>
        {problems.map((p) => (
          <RowList.Item key={p.key} itemKey={p.key} textValue={p.msg}>
            <RowList.Cell column="severity">{p.icon}</RowList.Cell>
            <RowList.Cell column="message">{p.msg}</RowList.Cell>
            <RowList.Cell column="file">{p.file}</RowList.Cell>
            <RowList.Cell column="line">{p.line}</RowList.Cell>
          </RowList.Item>
        ))}
      </RowList.Viewport>
    </RowList>
  ),
};

// ---------------------------------------------------------------------------
// DisabledRows
// ---------------------------------------------------------------------------

export const DisabledRows: Story = {
  render: (args) => (
    <RowList
      columns={basicColumns}
      selectionMode="single"
      disabledKeys={['2']}
      {...args}
      style={{ width: 480 }}
    >
      <RowList.Header />
      <RowList.Viewport>
        <RowList.Item itemKey="1" textValue="api-server">
          <RowList.Cell column="name">api-server</RowList.Cell>
          <RowList.Cell column="type">Deployment</RowList.Cell>
          <RowList.Cell column="status">Running</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="2" textValue="redis-cache (disabled)">
          <RowList.Cell column="name">redis-cache</RowList.Cell>
          <RowList.Cell column="type">StatefulSet</RowList.Cell>
          <RowList.Cell column="status">Disabled</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="3" textValue="batch-worker">
          <RowList.Cell column="name">batch-worker</RowList.Cell>
          <RowList.Cell column="type">CronJob</RowList.Cell>
          <RowList.Cell column="status">Idle</RowList.Cell>
        </RowList.Item>
      </RowList.Viewport>
    </RowList>
  ),
};

// ---------------------------------------------------------------------------
// LargeList
// ---------------------------------------------------------------------------

const largeColumns: ColumnDef[] = [
  { id: 'id', header: '#', width: '60px', align: 'end', sortable: true },
  { id: 'task', header: 'Task', width: '1fr' },
  { id: 'status', header: 'Status', width: '100px' },
  { id: 'duration', header: 'Duration', width: '80px', align: 'end' },
];

const largeData = Array.from({ length: 200 }, (_, i) => ({
  key: String(i + 1),
  id: i + 1,
  task: `Task ${i + 1}: ${['Build', 'Test', 'Lint', 'Deploy', 'Package'][i % 5]} step`,
  status: ['Passed', 'Failed', 'Running', 'Skipped'][i % 4],
  duration: `${(i * 7) % 120}s`,
}));

export const LargeList: Story = {
  render: (args) => (
    <RowList columns={largeColumns} {...args} style={{ width: 520 }}>
      <RowList.Header />
      <RowList.Viewport style={{ maxHeight: 400 }}>
        {largeData.map((row) => (
          <RowList.Item key={row.key} itemKey={row.key} textValue={row.task}>
            <RowList.Cell column="id">{row.id}</RowList.Cell>
            <RowList.Cell column="task">{row.task}</RowList.Cell>
            <RowList.Cell column="status">{row.status}</RowList.Cell>
            <RowList.Cell column="duration">{row.duration}</RowList.Cell>
          </RowList.Item>
        ))}
      </RowList.Viewport>
    </RowList>
  ),
};
