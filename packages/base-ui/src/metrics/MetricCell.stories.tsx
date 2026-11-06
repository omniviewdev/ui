import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../components/button';
import { MetricCell } from './MetricCell';
import type { MetricCellProps } from './types';
import { references } from './ComponentStoryFixtures';
import userEvent from '@testing-library/user-event';

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
  width = 360,
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
                references={references}
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
    references: [{ id: 'request', kind: 'line', label: 'Request', value: 200 }],
    thresholds: [{ value: 400, tone: 'warning', label: 'Warning' }],
  },
};

function ResponsiveCells() {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--ov-space-stack-md)' }}>
      <Button size="sm" onClick={() => setLoading((current) => !current)}>
        Toggle loading
      </Button>
      <p>
        Drag each lower-right corner. Numeric and unit slots stay aligned as units and states
        change.
      </p>
      {[80, 140, 240, 480].map((width) => (
        <div
          key={width}
          style={{
            width,
            maxWidth: '100%',
            minWidth: 40,
            resize: 'horizontal',
            overflow: 'auto',
            border: '1px solid var(--ov-color-border-default)',
            padding: 'var(--ov-space-stack-sm)',
            display: 'grid',
            gap: 'var(--ov-space-stack-sm)',
          }}
        >
          {[0, 1024, 537 * 1024 ** 2, 1024 ** 3, null].map((value, index) => (
            <MetricCell
              key={index}
              value={value}
              unit={{ kind: 'bytes', display: 'binary' }}
              loading={loading ? true : undefined}
              label={`Memory sample ${index + 1}`}
              bound={{ kind: 'capacity', value: 1024 ** 3 }}
              references={references}
            />
          ))}
          <MetricCell
            value={537 * 1024 ** 2}
            unit={{ kind: 'bytes', display: 'binary' }}
            label="Unknown bound"
          />
          <MetricCell loading label="Unit not discovered" />
          <MetricCell
            value={123456789012345}
            unit={{ kind: 'number' }}
            label="Wide number fallback"
          />
        </div>
      ))}
    </div>
  );
}

export const ResponsiveWidthsAndStates: Story = { render: () => <ResponsiveCells /> };
export const ReferenceEdgeCases: Story = {
  args: { value: 26, bound: { kind: 'limit', value: 24 }, references },
};
export const UnknownBoundReferences: Story = { args: { value: 26, bound: undefined, references } };

export const KeyboardAndPointerReferenceInspection: Story = {
  render: () => (
    <div style={{ width: 100, display: 'grid', gap: 'var(--ov-space-stack-md)' }}>
      <Button size="sm">Start inspection</Button>
      <MetricCell
        value={0}
        unit={{ kind: 'number' }}
        bound={{ kind: 'limit', value: 100 }}
        references={[
          {
            id: 'zero',
            kind: 'line',
            label: 'Zero target',
            value: 0,
            source: 'Current supplied configuration',
          },
          {
            id: 'outside',
            kind: 'line',
            label: 'Configured limit',
            value: 200,
            source: 'Current supplied configuration',
          },
        ]}
        label="Inspectable narrow cell"
      />
      <Button size="sm">End inspection</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    const user = userEvent.setup({ document });
    const frame = () => {
      const { promise, resolve } = Promise.withResolvers<void>();
      requestAnimationFrame(() => resolve());
      return promise;
    };
    const cell = canvasElement.querySelector<HTMLElement>(
      '[aria-label="Inspectable narrow cell"]',
    )!;
    const trigger = cell.querySelector<HTMLElement>('[tabindex="0"]')!;
    const height = cell.getBoundingClientRect().height;
    const inspect = async () => {
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');
        if (tooltip?.textContent?.includes('Current supplied configuration')) {
          if (
            !tooltip.textContent.includes('Zero target: 0') ||
            !tooltip.textContent.includes('outside displayed range')
          ) {
            throw new Error('Reference tooltip lost zero or off-scale configuration');
          }
          if (Math.abs(cell.getBoundingClientRect().height - height) > 1) {
            throw new Error('Cell inspection changed row height');
          }
          return;
        }
        await frame();
      }
      throw new Error('Reference tooltip did not open');
    };
    await user.click(canvasElement.querySelector('button')!);
    await user.tab();
    if (document.activeElement !== trigger)
      throw new Error('Keyboard skipped cell reference trigger');
    await inspect();
    await user.keyboard('{Escape}');
    await user.click(canvasElement.querySelectorAll('button')[1]!);
    for (let attempt = 0; attempt < 120 && document.querySelector('[role="tooltip"]'); attempt += 1)
      await frame();
    await user.hover(trigger);
    await inspect();
    await user.unhover(trigger);
  },
};

export const UpdatingValues: Story = {
  render: function UpdatingCells(args) {
    const [high, setHigh] = useState(false);
    return (
      <div style={{ width: 360, display: 'grid', gap: 'var(--ov-space-stack-md)' }}>
        <Button size="sm" onClick={() => setHigh((value) => !value)}>
          Update values
        </Button>
        <MetricCell {...args} value={high ? 420 : 80} label="Horizontal update" />
        <MetricCell
          {...args}
          value={high ? 420 : 80}
          orientation="vertical"
          label="Vertical update"
        />
      </div>
    );
  },
};
