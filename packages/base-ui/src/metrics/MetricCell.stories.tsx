import type { Meta, StoryObj } from '@storybook/react';
import { MetricCell } from './MetricCell';
import type { MetricCellProps } from './types';

const meta = {
  title: 'Metrics/Components/MetricCell',
  component: MetricCell,
  args: {
    value: 216,
    unit: { kind: 'cpu', base: 'millicores' },
    bound: { kind: 'limit', value: 500 },
    label: 'CPU usage',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MetricCell>;
export default meta;
type Story = StoryObj<typeof meta>;

function NarrowTable({
  orientation = 'horizontal',
  width = 260,
}: Pick<MetricCellProps, 'orientation'> & { width?: number }) {
  return (
    <table style={{ width, tableLayout: 'fixed', borderSpacing: 'var(--ov-space-stack-sm)' }}>
      <thead>
        <tr>
          <th scope="col">Sample</th>
          <th scope="col">CPU</th>
        </tr>
      </thead>
      <tbody>
        {[
          { label: 'Bounded', value: 216, bound: { kind: 'limit' as const, value: 500 } },
          { label: 'Unknown bound', value: 216 },
          { label: 'Zero', value: 0, bound: { kind: 'limit' as const, value: 500 } },
          { label: 'Missing', value: null, bound: { kind: 'limit' as const, value: 500 } },
          { label: 'Over limit', value: 720, bound: { kind: 'limit' as const, value: 500 } },
        ].map(({ label, value, bound }) => (
          <tr key={label}>
            <th scope="row" style={{ textAlign: 'left', fontWeight: 400 }}>
              {label}
            </th>
            <td>
              <MetricCell
                label={label}
                value={value}
                unit={{ kind: 'cpu', base: 'millicores' }}
                bound={bound}
                orientation={orientation}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export const Horizontal: Story = { render: () => <NarrowTable /> };
export const Vertical: Story = { render: () => <NarrowTable orientation="vertical" /> };
export const WideColumn: Story = { render: () => <NarrowTable width={640} /> };
export const Bytes: Story = {
  args: {
    value: 134217728,
    unit: { kind: 'bytes', display: 'binary' },
    bound: { kind: 'capacity', value: 1073741824 },
  },
};
export const ThresholdAndRequest: Story = {
  args: {
    value: 450,
    request: 200,
    thresholds: [{ value: 400, tone: 'warning', label: 'Warning' }],
  },
};
