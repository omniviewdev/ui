import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimeSeriesChart } from './TimeSeriesChart';
import { StackedTimeSeriesChart } from './StackedTimeSeriesChart';
import { SmallMultiples } from './SmallMultiples';
import { MetricLegend } from './MetricLegend';
import type { NumericSeries } from './types';
import { MetricPanel } from './MetricPanel';

const domain = { startMs: 0, endMs: 100 };
const series: readonly [NumericSeries] = [
  {
    id: 'a',
    label: 'Alpha',
    points: [
      { timeMs: 0, value: 1 },
      { timeMs: 50, value: -2 },
      { timeMs: 100, value: 3 },
    ],
  },
];
const unit = { kind: 'number' } as const;
describe('time plots', () => {
  it('shows an initial Skeleton without replacing the SVG when samples arrive', () => {
    const { container, rerender } = render(
      <TimeSeriesChart label="Load" series={[]} unit={unit} domain={domain} loading />,
    );
    const svg = container.querySelector('svg');
    expect(container.querySelector('[data-ov-component="skeleton"]')).toBeTruthy();
    expect(screen.queryByText('No drawable samples')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Loading samples…');
    rerender(<TimeSeriesChart label="Load" series={series} unit={unit} domain={domain} />);
    expect(container.querySelector('svg')).toBe(svg);
    expect(container.querySelector('[data-ov-component="skeleton"]')).toBeNull();
  });
  it('keeps supplied samples mounted during refresh and announces only at panel level', () => {
    const { container, rerender } = render(
      <MetricPanel title="Load" state={{ kind: 'data' }} value="3">
        <TimeSeriesChart label="Load history" series={series} unit={unit} domain={domain} />
      </MetricPanel>,
    );
    const svg = container.querySelector('svg');
    const path = container.querySelector('[data-metric-path="a"]');
    rerender(
      <MetricPanel title="Load" state={{ kind: 'data', updating: true }} value="3">
        <TimeSeriesChart label="Load history" series={series} unit={unit} domain={domain} />
      </MetricPanel>,
    );
    expect(container.querySelector('svg')).toBe(svg);
    expect(container.querySelector('[data-metric-path="a"]')).toBe(path);
    expect(container.querySelector('[data-ov-component="skeleton"]')).toBeNull();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toBe('Updating…');
  });
  it('reserves initial chart geometry only when requested and keeps errors distinct', () => {
    const { container, rerender } = render(
      <MetricPanel title="Load" state={{ kind: 'initial' }} value="—" loadingChart />,
    );
    expect(container.querySelectorAll('[data-ov-component="skeleton"]')).toHaveLength(2);
    expect(screen.getByRole('status').textContent).toBe('Loading samples…');
    rerender(<MetricPanel title="Load" state={{ kind: 'initial' }} value="—" />);
    expect(container.querySelectorAll('[data-ov-component="skeleton"]')).toHaveLength(1);
    rerender(<MetricPanel title="Load" state={{ kind: 'error', message: 'Source unavailable' }} />);
    expect(screen.getByRole('alert').textContent).toBe('Source unavailable');
    expect(container.querySelector('[data-ov-component="skeleton"]')).toBeNull();
  });
  it('keeps SVG and keyed path identity through refresh and range changes', () => {
    const { container, rerender } = render(
      <TimeSeriesChart label="Load" series={series} unit={unit} domain={domain} />,
    );
    const svg = container.querySelector('svg');
    const path = container.querySelector('[data-metric-path="a"]');
    rerender(
      <TimeSeriesChart
        label="Load"
        series={[
          {
            ...series[0],
            points: [
              { timeMs: 50, value: 4 },
              { timeMs: 100, value: 8 },
            ],
          },
        ]}
        unit={unit}
        domain={{ startMs: 20, endMs: 120 }}
      />,
    );
    expect(container.querySelector('svg')).toBe(svg);
    expect(container.querySelector('[data-metric-path="a"]')).toBe(path);
  });
  it('inspects actual timestamps and emits controlled keyboard ranges', () => {
    const onCursorTimeChange = vi.fn();
    const onSelectedRangeChange = vi.fn();
    const { rerender } = render(
      <TimeSeriesChart
        label="Load"
        series={series}
        unit={unit}
        domain={domain}
        cursorTimeMs={0}
        onCursorTimeChange={onCursorTimeChange}
        onSelectedRangeChange={onSelectedRangeChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole('application'), { key: 'ArrowRight', shiftKey: true });
    expect(onCursorTimeChange).toHaveBeenLastCalledWith(50);
    expect(onSelectedRangeChange).toHaveBeenLastCalledWith({ startMs: 0, endMs: 50 });
    // Controlled cursor remains at zero until consumer supplies the change.
    expect(screen.getByText(/Alpha: 1/)).toBeTruthy();
    rerender(
      <TimeSeriesChart
        label="Load"
        series={series}
        unit={unit}
        domain={domain}
        cursorTimeMs={50}
        selectedRange={{ startMs: 0, endMs: 50 }}
        onSelectedRangeChange={onSelectedRangeChange}
      />,
    );
    expect(screen.getByText(/Alpha: -2/)).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('application'), { key: 'Escape' });
    expect(onSelectedRangeChange).toHaveBeenLastCalledWith(null);
  });
  it('shows honest empty state for malformed aligned frames', () => {
    render(
      <StackedTimeSeriesChart
        label="Stack"
        frame={{ timestamps: [0, 1], series: [{ id: 'a', label: 'Alpha', values: [1] }] }}
        unit={unit}
        domain={domain}
      />,
    );
    expect(screen.getByText('No drawable samples')).toBeTruthy();
  });
  it('keeps hidden series toggles controlled', () => {
    const change = vi.fn();
    render(<MetricLegend items={series} hiddenIds={['a']} onHiddenIdsChange={change} />);
    const button = screen.getByRole('button', { name: 'Alpha' });
    fireEvent.click(button);
    expect(change).toHaveBeenCalledWith([]);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });
  it('bounds legend DOM and reaches final items with keyboard scrolling', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), label: `Item ${i}` }));
    render(<MetricLegend items={items} onHiddenIdsChange={vi.fn()} />);
    expect(screen.getAllByRole('button').length).toBeLessThan(20);
    fireEvent.keyDown(screen.getByRole('group'), { key: 'End' });
    expect(screen.getByRole('button', { name: 'Item 999' })).toBeTruthy();
  });
  it('renders only controlled page and uses common y-domain across pages', () => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      label: `Series ${i}`,
      series: {
        ...series[0],
        id: String(i),
        points: [
          { timeMs: 0, value: i + 1 },
          { timeMs: 100, value: i + 1 },
        ],
      },
      value: i + 1,
    }));
    const change = vi.fn();
    const { container } = render(
      <SmallMultiples
        label="Fleet"
        items={items}
        unit={unit}
        domain={domain}
        pageSize={2}
        page={0}
        onPageChange={change}
      />,
    );
    expect(container.querySelectorAll('svg')).toHaveLength(2);
    expect(container.querySelector('path')?.getAttribute('d')).toContain('35.00');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(change).toHaveBeenCalledWith(1);
    expect(screen.queryByText('Series 2')).toBeNull();
  });
  it('does not resample unchanged inputs during controlled cursor and brush updates', () => {
    const readPoints = vi.fn(() => series[0].points);
    const item: NumericSeries = {
      id: 'cached',
      label: 'Cached',
      get points() {
        return readPoints();
      },
    };
    const inputs = [item];
    const { rerender } = render(
      <TimeSeriesChart
        label="Cached"
        series={inputs}
        unit={unit}
        domain={domain}
        cursorTimeMs={null}
      />,
    );
    readPoints.mockClear();
    rerender(
      <TimeSeriesChart
        label="Cached"
        series={inputs}
        unit={unit}
        domain={domain}
        cursorTimeMs={null}
        selectedRange={{ startMs: 10, endMs: 30 }}
      />,
    );
    expect(readPoints).not.toHaveBeenCalled();
  });
});
