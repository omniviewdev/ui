import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test/render';
import { CapacityBar } from './CapacityBar';
import { MetricCell } from './MetricCell';
import { Gauge } from './Gauge';
import { RankedBars } from './RankedBars';
import { TimeSeriesChart } from './TimeSeriesChart';
import { StackedTimeSeriesChart } from './StackedTimeSeriesChart';
import { groupReferences, normalizeReferences, referenceDomain } from './references';
import type { MetricReference } from './types';

const unit = { kind: 'number' } as const;
const domain = { startMs: 0, endMs: 1000 };
const series = [
  {
    id: 'usage',
    label: 'Usage',
    points: [
      { timeMs: 0, value: 2 },
      { timeMs: 1000, value: 4 },
    ],
  },
];
const references: readonly MetricReference[] = [
  { id: 'request', kind: 'line', label: 'Request', value: 20, source: 'Current object' },
  { id: 'limit', kind: 'line', label: 'Limit', value: 20, lineStyle: 'dotted' },
  { id: 'range', kind: 'band', label: 'Range', from: -10, to: 30 },
  { id: 'zero', kind: 'line', label: 'Zero', value: 0 },
];

describe('metric reference normalization', () => {
  it('keeps zero and zero-width bands, omitting absent, partial, reversed, and nonfinite values', () => {
    const result = normalizeReferences([
      { id: 'zero', kind: 'line', label: 'Zero', value: 0 },
      { id: 'point', kind: 'band', label: 'Point', from: 0, to: 0 },
      { id: 'missing', kind: 'line', label: 'Missing' },
      { id: 'null', kind: 'line', label: 'Null', value: null },
      { id: 'nan', kind: 'line', label: 'NaN', value: NaN },
      { id: 'infinite', kind: 'line', label: 'Infinite', value: Infinity },
      { id: 'partial', kind: 'band', label: 'Partial', from: 0 },
      { id: 'reversed', kind: 'band', label: 'Reversed', from: 10, to: 0 },
      { id: 'invalid', kind: 'band', label: 'Invalid', from: 0, to: Infinity },
    ]);
    expect(result.map((reference) => reference.id)).toEqual(['zero', 'point']);
    expect(referenceDomain([1, 2], result)).toEqual([0, 2]);
    expect(groupReferences(result)).toHaveLength(1);
    expect(groupReferences(result)[0]?.map((reference) => reference.label)).toEqual([
      'Zero',
      'Point',
    ]);
  });

  it('groups coincident geometry without losing source, names, or values', () => {
    const normalized = normalizeReferences(references);
    const coincident = groupReferences(normalized).find((group) => group.length === 2)!;
    expect(coincident.map((reference) => reference.label)).toEqual(['Request', 'Limit']);
    expect(referenceDomain([0, 4], normalized)).toEqual([-10, 30]);
  });

  it('includes extreme finite reference values without overflowing domain computation', () => {
    const normalized = normalizeReferences([
      {
        id: 'extreme',
        kind: 'band',
        label: 'Extreme range',
        from: -Number.MAX_VALUE,
        to: Number.MAX_VALUE,
      },
    ]);
    expect(referenceDomain([0, 1], normalized)).toEqual([-Number.MAX_VALUE, Number.MAX_VALUE]);
  });
});

describe('reference plot behavior', () => {
  it('shows current configuration before samples exist and keeps the SVG mounted through refresh', () => {
    const props = { unit, domain, label: 'Loading history', references };
    const { container, rerender } = renderWithTheme(
      <TimeSeriesChart {...props} series={[]} loading />,
    );
    const plot = container.querySelector('svg');
    expect(screen.getByText('Request: 20')).toBeVisible();
    expect(container.querySelectorAll('[data-series-id]')).toHaveLength(0);
    rerender(<TimeSeriesChart {...props} series={series} />);
    expect(container.querySelector('svg')).toBe(plot);
    const path = container.querySelector('[data-metric-path="usage"]');
    rerender(<TimeSeriesChart {...props} series={series} loading />);
    expect(container.querySelector('svg')).toBe(plot);
    expect(container.querySelector('[data-metric-path="usage"]')).toBe(path);
    expect(screen.getByText('Request: 20')).toBeVisible();
  });
  it.each(['line', 'area', 'sample-bars'] as const)(
    'includes references in automatic %s domains and retains all coincident names',
    (mode) => {
      const { container } = renderWithTheme(
        <TimeSeriesChart
          series={series}
          unit={unit}
          domain={domain}
          mode={mode}
          references={references}
          label="Usage history"
        />,
      );
      const legend = container.querySelector('[aria-label="Current configuration references"]')!;
      expect(legend).toHaveTextContent('Request: 20');
      expect(legend).toHaveTextContent('Limit: 20');
      expect(legend).toHaveTextContent('Range: -10 – 30');
      expect(legend).not.toHaveTextContent('outside displayed range');
      expect(container.querySelectorAll('svg g title')).toHaveLength(3);
      const coincidentTitle = [...container.querySelectorAll('svg g title')].find((title) =>
        title.textContent?.includes('Request'),
      )!;
      expect(coincidentTitle).toHaveTextContent('Limit: 20');
      expect(coincidentTitle.parentElement?.querySelectorAll('path')).toHaveLength(1);
    },
  );

  it('keeps explicit domains authoritative and off-scale references discoverable', () => {
    const { container } = renderWithTheme(
      <TimeSeriesChart
        series={series}
        unit={unit}
        domain={domain}
        yDomain={[0, 10]}
        references={references}
        label="Pinned history"
      />,
    );
    expect(screen.getByText('Request: 20 · outside displayed range')).toBeVisible();
    expect(container.querySelectorAll('svg g title')).toHaveLength(2);
    const plot = screen.getByRole('application');
    fireEvent.keyDown(plot, { key: 'ArrowRight' });
    expect(
      screen.getByText('Request: 20 (Current object) · outside displayed range'),
    ).toBeVisible();
  });

  it('updates configuration without replacing the plot or its series identity', () => {
    const props = { series, unit, domain, label: 'Stable plot' };
    const { rerender, container } = renderWithTheme(
      <TimeSeriesChart {...props} references={references} />,
    );
    const plot = screen.getByRole('application');
    const seriesPath = container.querySelector('[data-metric-path="usage"]');
    rerender(
      <TimeSeriesChart
        {...props}
        references={[{ id: 'request', kind: 'line', label: 'Request', value: 40 }]}
      />,
    );
    expect(screen.getByRole('application')).toBe(plot);
    const legend = screen.getByRole('group', { name: 'Current configuration references' });
    expect(legend.textContent).toMatch(/Request.*40/);
    expect(legend.textContent).not.toMatch(/Request.*20/);
    expect(container.querySelector('[data-metric-path="usage"]')).toBe(seriesPath);
  });

  it('includes references in stacked automatic domains', () => {
    renderWithTheme(
      <StackedTimeSeriesChart
        frame={{
          timestamps: [0, 1000],
          series: [
            { id: 'a', label: 'A', values: [1, 2] },
            { id: 'b', label: 'B', values: [2, 3] },
          ],
        }}
        unit={unit}
        domain={domain}
        references={references}
        label="Stacked usage"
      />,
    );
    expect(
      screen.getByRole('group', { name: 'Current configuration references' }).textContent,
    ).toMatch(/Range.*-10.*30/);
    expect(screen.queryByText(/outside displayed range/)).not.toBeInTheDocument();
  });
});

describe('scalar reference behavior', () => {
  it('never infers utilization bounds from references', () => {
    const { rerender } = renderWithTheme(
      <CapacityBar value={4} unit={unit} references={references} />,
    );
    expect(screen.getByText(/No bound supplied.*Absolute usage/)).toBeVisible();
    expect(screen.getByText('Request: 20')).toBeVisible();
    expect(screen.queryByText(/% of/)).not.toBeInTheDocument();
    rerender(
      <CapacityBar
        value={4}
        unit={unit}
        bound={{ kind: 'limit', value: 10 }}
        references={references}
      />,
    );
    expect(screen.getByText('Request: 20 · outside displayed range')).toBeVisible();
  });

  it.each(['horizontal', 'vertical'] as const)(
    'retains cell reference inspection with %s markers and unknown bounds',
    (orientation) => {
      const { rerender } = renderWithTheme(
        <MetricCell
          value={0}
          unit={unit}
          bound={{ kind: 'limit', value: 10 }}
          references={references}
          orientation={orientation}
        />,
      );
      const track = screen.getByRole('img');
      expect(track).toHaveAccessibleName(/Request: 20.*outside displayed range/);
      expect(track).toHaveAccessibleName(/Limit: 20/);
      expect(track).toHaveAccessibleName(/Range: -10 – 30/);
      expect(screen.getByText('0')).toBeVisible();
      rerender(
        <MetricCell value={0} unit={unit} references={references} orientation={orientation} />,
      );
      expect(screen.getByRole('img')).toHaveAccessibleName(
        /bound unknown; absolute usage; Request: 20/,
      );
      expect(screen.getByRole('img').children).toHaveLength(0);
      expect(screen.getByText('0').parentElement).toHaveAccessibleName(/Request: 20/);
    },
  );

  it('keeps a configured gauge range and exposes off-scale references', () => {
    renderWithTheme(
      <Gauge value={4} unit={unit} min={0} max={10} references={references} label="Gauge" />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/range 0 to 10/);
    expect(screen.getByText('Request: 20 · outside displayed range')).toBeVisible();
    expect(
      screen.getByRole('group', { name: 'Current configuration references' }).textContent,
    ).toMatch(/Range.*-10.*30.*outside displayed range/);
  });

  it('expands ranked axes without changing item order, selection, or series color', () => {
    const items = [
      { id: 'a', label: 'A', value: 4 },
      { id: 'b', label: 'B', value: 2 },
    ];
    const { rerender } = renderWithTheme(
      <RankedBars
        items={items}
        unit={unit}
        label="Ranked"
        references={references}
        selectedId="a"
        onSelect={() => {}}
      />,
    );
    const ranking = screen.getByRole('group', { name: 'Ranked' });
    const first = within(ranking).getAllByRole('button')[0]!;
    expect(first).toHaveAccessibleName('A 4');
    expect(first).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Range: -10 – 30')).toBeVisible();
    rerender(
      <RankedBars
        items={items}
        unit={unit}
        label="Ranked"
        references={[]}
        selectedId="a"
        onSelect={() => {}}
      />,
    );
    expect(within(ranking).getAllByRole('button')[0]).toBe(first);
    expect(screen.queryByText('Range: -10 – 30')).not.toBeInTheDocument();
  });
});

describe('reference geometry regressions', () => {
  it.each(['line', 'area', 'sample-bars'] as const)(
    'keeps actual %s sample and grid geometry finite across extreme reference bounds',
    (mode) => {
      const extreme = Number.MAX_VALUE;
      const { container } = renderWithTheme(
        <TimeSeriesChart
          series={[
            {
              id: 'extreme',
              label: 'Signed usage',
              points: [
                { timeMs: 0, value: -extreme / 2 },
                { timeMs: 1000, value: extreme / 2 },
              ],
            },
          ]}
          unit={unit}
          domain={domain}
          mode={mode}
          references={[
            { id: 'range', kind: 'band', label: 'Extreme range', from: -extreme, to: extreme },
          ]}
          label="Extreme history"
        />,
      );
      const plot = container.querySelector('svg')!;
      const height = Number(plot.getAttribute('height'));
      const path = container.querySelector('[data-metric-path="extreme"]')!;
      expect(path.getAttribute('d')).toBeTruthy();
      expect(plot.innerHTML).not.toMatch(/NaN|Infinity/);
      const coordinates = path
        .getAttribute('d')!
        .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)!
        .map(Number);
      expect(coordinates.every(Number.isFinite)).toBe(true);
      if (mode === 'line') {
        expect(coordinates[1]).toBeCloseTo(height * 0.75);
        expect(coordinates[3]).toBeCloseTo(height * 0.25);
      }
      const grid = [...plot.querySelectorAll('line[y1][y2]')];
      expect(grid.length).toBeGreaterThanOrEqual(3);
      expect(grid.map((line) => Number(line.getAttribute('y1')))).toEqual(
        expect.arrayContaining([0, height / 2, height]),
      );
    },
  );

  it('keeps the gauge value inside the arc frame and outside its wrapping reference legend', () => {
    renderWithTheme(
      <Gauge value={4} unit={unit} max={10} references={references} label="Framed gauge" />,
    );
    const arc = screen.getByRole('img');
    const frame = arc.parentElement!;
    expect(frame.querySelector('[data-size]')).toHaveTextContent('4');
    expect(frame.querySelector('[aria-label="Current configuration references"]')).toBeNull();
    expect(frame.parentElement).toContainElement(
      screen.getByRole('group', { name: 'Current configuration references' }),
    );
  });

  it('renders coincident zero references on the same nondegenerate domain as zero ranked bars', () => {
    renderWithTheme(
      <RankedBars
        items={[{ id: 'idle', label: 'Idle', value: 0 }]}
        unit={unit}
        label="Zero ranking"
        references={[
          { id: 'zero', kind: 'line', label: 'Zero target', value: 0 },
          { id: 'band', kind: 'band', label: 'Zero band', from: 0, to: 0 },
        ]}
      />,
    );
    const marker = screen.getByTitle((_, element) => {
      const title = element?.getAttribute('title') ?? '';
      return title.includes('Zero target') && title.includes('Zero band');
    });
    expect(marker).toHaveStyle('--reference-start: 0%');
    expect(screen.getByText('Zero target: 0')).toBeVisible();
    expect(screen.getByText('Zero band: 0 – 0')).toBeVisible();
    expect(screen.getByRole('group', { name: 'Zero ranking' })).toHaveTextContent('Idle');
  });
  it('paints reference bands beneath series so their tint cannot alter series stroke colors', () => {
    const { container } = renderWithTheme(
      <TimeSeriesChart
        series={series}
        unit={unit}
        domain={domain}
        references={references}
        label="Layered history"
      />,
    );
    const band = container.querySelector('svg rect[opacity="0.1"]')!;
    const data = container.querySelector('[data-metric-path="usage"]')!;
    expect(band).not.toBeNull();
    expect(band.compareDocumentPosition(data) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
