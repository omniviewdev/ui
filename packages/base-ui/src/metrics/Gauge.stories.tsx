import type { Meta, StoryObj } from '@storybook/react';
import { Gauge } from './Gauge';
import styles from './ComponentStories.module.css';
import { references } from './ComponentStoryFixtures';
import { useState } from 'react';
import { Button } from '../components/button';

const meta = {
  title: 'Metrics/Components/Gauge',
  component: Gauge,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className={styles.Small}>
        <Story />
      </div>
    ),
  ] as import('@storybook/react').Decorator[],
} satisfies Meta<typeof Gauge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    value: 216,
    max: 500,
    unit: { kind: 'cpu', base: 'millicores' },
    label: 'CPU saturation',
    color: 'series-1',
    references,
    thresholds: [
      { value: 400, tone: 'warning' },
      { value: 475, tone: 'danger' },
    ],
  },
};
export const OverRange: Story = { args: { ...Default.args, value: 624 } };
export const Missing: Story = { args: { ...Default.args, value: null } };
export const Zero: Story = { args: { ...Default.args, value: 0 } };
export const SignedRange: Story = { args: { ...Default.args, min: -100, value: -35 } };
export const PinnedOffScaleReferences: Story = {
  args: { ...Default.args, min: 19, max: 24, value: 22 },
};
export const ReferenceRange: Story = {
  args: { ...Default.args, max: 30, value: 26, thresholds: [] },
};

function WrappedGaugeReferences() {
  const [narrow, setNarrow] = useState(false);
  return (
    <div style={{ width: narrow ? 160 : 256 }}>
      <Button size="sm" onClick={() => setNarrow((current) => !current)}>
        Resize gauge references
      </Button>
      <Gauge
        unit={{ kind: 'cpu', base: 'millicores' }}
        label="CPU saturation"
        max={30}
        value={22}
        thresholds={[]}
        references={references.map((reference) => ({
          ...reference,
          label: `${reference.label} for the current workload allocation configuration`,
        }))}
      />
    </div>
  );
}
export const WrappedLegendGeometry: Story = {
  ...Default,
  render: () => <WrappedGaugeReferences />,
  play: async ({ canvasElement }) => {
    const frame = () => {
      const { promise, resolve } = Promise.withResolvers<void>();
      requestAnimationFrame(() => resolve());
      return promise;
    };
    const check = () => {
      const arc = canvasElement.querySelector('svg')!;
      const value = canvasElement.querySelector<HTMLElement>('[data-size]')!;
      const bounds = arc.getBoundingClientRect();
      const valueBounds = value.getBoundingClientRect();
      if (valueBounds.top < bounds.top || valueBounds.bottom > bounds.bottom) {
        throw new Error('Gauge value escaped its arc after reference legend wrapping');
      }
      if (arc.parentElement!.querySelector('[aria-label="Current configuration references"]')) {
        throw new Error('Gauge reference legend participates in arc positioning');
      }
    };
    await frame();
    check();
    canvasElement.querySelector('button')!.click();
    await frame();
    await frame();
    check();
  },
};
