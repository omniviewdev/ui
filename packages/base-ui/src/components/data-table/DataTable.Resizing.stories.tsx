import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { MetricCell } from '../../metrics/MetricCell';
import type { DataTableColumnDef as ColumnDef } from './types';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string;
  created: string;
}

const containerData: Container[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ctr-${String(i + 1).padStart(3, '0')}`,
  name: `my-app-${i + 1}`,
  image: ['nginx:1.25', 'node:20-alpine', 'postgres:16', 'redis:7', 'envoy:1.28'][i % 5]!,
  status: ['running', 'exited', 'running', 'running', 'paused'][i % 5]!,
  ports: ['80/tcp', '3000/tcp', '5432/tcp', '6379/tcp', '9901/tcp'][i % 5]!,
  created: `${i + 1}h ago`,
}));

const containerColumns: ColumnDef<Container, unknown>[] = [
  { accessorKey: 'id', header: 'Container ID', size: 120 },
  { accessorKey: 'name', header: 'Name', size: 140 },
  { accessorKey: 'image', header: 'Image', size: 180 },
  { accessorKey: 'status', header: 'Status', size: 100 },
  { accessorKey: 'ports', header: 'Ports', size: 100 },
  { accessorKey: 'created', header: 'Created', size: 100 },
];

const meta: Meta = {
  title: 'Components/DataTable/Resizing',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function ColumnResizingStory() {
  const table = useDataTable({
    data: containerData,
    columns: containerColumns,
    features: { columnResizing: true, sorting: true },
    getRowId: (row) => row.id,
  });

  return (
    <DataTable.Root
      table={table}
      features={{ columnResizing: true, sorting: true }}
      variant="soft"
      size="sm"
      hoverable
    >
      <DataTable.Container height={400}>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Container>
    </DataTable.Root>
  );
}

export const ColumnResizing: Story = {
  render: () => <ColumnResizingStory />,
};

const metricColumns: ColumnDef<Container, unknown>[] = [
  {
    id: 'cpu',
    header: 'CPU usage',
    size: 180,
    cell: () => (
      <MetricCell
        label="CPU usage"
        value={125}
        unit={{ kind: 'cpu', base: 'millicores' }}
        bound={{ kind: 'limit', value: 500 }}
      />
    ),
  },
  {
    id: 'memory',
    header: 'Memory usage',
    size: 220,
    cell: () => (
      <MetricCell
        label="Memory usage"
        value={128 * 1024 ** 2}
        unit={{ kind: 'bytes', display: 'binary' }}
        bound={{ kind: 'limit', value: 1024 ** 3 }}
      />
    ),
  },
];

function DynamicColumnsStory() {
  const [metrics, setMetrics] = useState(false);
  const [virtual, setVirtual] = useState(false);
  const table = useDataTable({
    data: containerData,
    columns: metrics
      ? [...containerColumns.slice(0, 2), ...metricColumns]
      : containerColumns.slice(0, 2),
    features: { columnResizing: true, columnVisibility: true },
    getRowId: (row) => row.id,
  });
  return (
    <div style={{ width: 520, maxWidth: '100%', display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button size="sm" onClick={() => setMetrics((value) => !value)}>
          Toggle metric columns
        </Button>
        <Button
          size="sm"
          disabled={!metrics}
          onClick={() => table.getColumn('cpu')?.toggleVisibility()}
        >
          Toggle CPU visibility
        </Button>
        <Button
          size="sm"
          disabled={!metrics}
          onClick={() => table.setColumnSizing({ memory: 300 })}
        >
          Resize memory to 300px
        </Button>
        <Button size="sm" onClick={() => setVirtual((value) => !value)}>
          Toggle virtual body
        </Button>
      </div>
      <DataTable.Root table={table} features={{ columnResizing: true }} size="sm">
        <DataTable.Container height={280} aria-label="Dynamic column sizing repro">
          <DataTable.Header />
          {virtual ? <DataTable.VirtualBody fixedRowHeight /> : <DataTable.Body />}
        </DataTable.Container>
      </DataTable.Root>
    </div>
  );
}

export const DynamicColumns: Story = {
  render: () => <DynamicColumnsStory />,
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-ov-table-container]')!;
    const frame = () => {
      const { promise, resolve } = Promise.withResolvers<void>();
      requestAnimationFrame(() => resolve());
      return promise;
    };
    const click = async (label: string) => {
      const button = Array.from(canvasElement.querySelectorAll('button')).find(
        (element) => element.textContent === label,
      );
      if (!button) throw new Error(`Missing control: ${label}`);
      button.click();
      await frame();
      await frame();
    };
    const check = (minimum: number) => {
      const table = viewport.querySelector('table')!;
      const width = table.getBoundingClientRect().width;
      const expected = Math.max(viewport.clientWidth, minimum);
      if (Math.abs(width - expected) > 1) {
        throw new Error(`Table width: expected ${expected}, received ${width}`);
      }
      const headers = Array.from(table.querySelectorAll('thead th'));
      const cells = Array.from(table.querySelectorAll('tbody tr:first-child td'));
      if (!cells.length || cells.length !== headers.length) {
        throw new Error('Header/body visible columns differ');
      }
      headers.forEach((header, index) => {
        const head = header.getBoundingClientRect();
        const cell = cells[index]!.getBoundingClientRect();
        if (Math.abs(head.width - cell.width) > 1 || Math.abs(head.left - cell.left) > 1) {
          throw new Error(`Header/body alignment differs at column ${index}`);
        }
      });
      table
        .querySelectorAll<HTMLElement>('[role="group"][aria-label$="usage"]')
        .forEach((metric) => {
          const cell = metric.closest('td')!;
          const style = getComputedStyle(cell);
          const available =
            cell.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          if (Math.abs(metric.getBoundingClientRect().width - available) > 1) {
            throw new Error('Responsive cell content does not fill the available column width');
          }
        });
      if (minimum > viewport.clientWidth && viewport.scrollWidth < minimum - 1) {
        throw new Error('Horizontal viewport does not expose the full table width');
      }
    };
    check(260);
    await click('Toggle metric columns');
    check(660);
    await click('Resize memory to 300px');
    check(740);
    await click('Toggle CPU visibility');
    check(560);
    await click('Toggle CPU visibility');
    await click('Toggle virtual body');
    for (let attempt = 0; attempt < 60 && !viewport.querySelector('tbody tr'); attempt += 1) {
      await frame();
    }
    check(740);
    viewport.scrollLeft = 200;
    await frame();
    check(740);
    await click('Toggle metric columns');
    check(260);
  },
  parameters: {
    docs: {
      description: {
        story:
          'A 520px viewport starts with 260px of declared columns. Adding metrics raises the minimum table width to 660px; resizing memory raises it to 740px. Hide CPU to remove 180px. Headers and ordinary/virtual rows share the same widths; excess width scrolls instead of squeezing cells. Drag header dividers to test continuous resizing.',
      },
    },
  },
};
