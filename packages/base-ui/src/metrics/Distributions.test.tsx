import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Histogram } from './Histogram';
import { Heatmap } from './Heatmap';
import { StateTimeline } from './StateTimeline';
import { population, timelineSegments, validBuckets } from './distributionGeometry';

const buckets = [
  { id: 'under', lower: null, upper: 0 },
  { id: 'body', lower: 0, upper: 10 },
  { id: 'over', lower: 10, upper: null },
] as const;
const unit = { kind: 'number' } as const;

describe('distribution boundaries', () => {
  it('accepts open tails and rejects overlapping, nonfinite or duplicate buckets', () => {
    expect(validBuckets(buckets)).toBe(true);
    expect(
      validBuckets([
        { id: 'a', lower: 0, upper: 10 },
        { id: 'b', lower: 5, upper: 20 },
      ]),
    ).toBe(false);
    expect(validBuckets([{ id: 'a', lower: 0, upper: Infinity }])).toBe(false);
    expect(
      validBuckets([
        { id: 'a', lower: 0, upper: 1 },
        { id: 'a', lower: 1, upper: 2 },
      ]),
    ).toBe(false);
    expect(
      validBuckets([
        { id: 'a', lower: 0, upper: 1 },
        { id: 'b', lower: 2, upper: 3 },
      ]),
    ).toBe(false);
    expect(validBuckets([{ id: 'all', lower: null, upper: null }])).toBe(false);
    expect(population(0)).toBe(0);
    expect(population(NaN)).toBeNull();
    expect(population(-1)).toBeNull();
    expect(population(undefined)).toBeNull();
  });
  it('shows actual open bounds and selects each bucket by keyboard', () => {
    const onBucketSelect = vi.fn();
    render(
      <Histogram
        buckets={buckets}
        values={[0, null, 4]}
        unit={unit}
        measure="count"
        label="Distribution"
        onBucketSelect={onBucketSelect}
      />,
    );
    const plot = screen.getByRole('img', { name: 'Distribution' });
    expect(screen.getByText(/underflow.*0 count/)).toBeTruthy();
    fireEvent.keyDown(plot, { key: 'ArrowRight' });
    expect(screen.getByText(/Unknown count/)).toBeTruthy();
    fireEvent.keyDown(plot, { key: 'End' });
    expect(screen.getByText(/overflow.*4 count/)).toBeTruthy();
    fireEvent.keyDown(plot, { key: 'Enter' });
    expect(onBucketSelect).toHaveBeenCalledWith('over');
  });
  it('rejects malformed histogram bounds without NaN geometry', () => {
    const { container } = render(
      <Histogram
        buckets={[{ id: 'bad', lower: NaN, upper: 4 }]}
        values={[3]}
        unit={unit}
        measure="density"
        label="Invalid"
      />,
    );
    expect(screen.getByText('No drawable buckets')).toBeTruthy();
    expect(container.innerHTML).not.toContain('NaN');
  });
});

describe('heatmap inspection', () => {
  const windows = [
    { id: 'first', startMs: 0, endMs: 1000 },
    { id: 'second', startMs: 1000, endMs: 2000 },
  ] as const;
  it('distinguishes zero and missing and emits raw selected window', () => {
    const onWindowSelect = vi.fn();
    render(
      <Heatmap
        buckets={buckets}
        windows={windows}
        values={[
          [0, null, 3],
          [4, 5, 6],
        ]}
        unit={unit}
        measure="count"
        label="Heat"
        onWindowSelect={onWindowSelect}
      />,
    );
    const plot = screen.getByRole('img', { name: 'Heat' });
    expect(screen.getByText(/underflow.*0 count/)).toBeTruthy();
    fireEvent.keyDown(plot, { key: 'ArrowUp' });
    expect(screen.getByText(/Unknown count/)).toBeTruthy();
    fireEvent.keyDown(plot, { key: 'ArrowRight' });
    fireEvent.keyDown(plot, { key: 'Enter' });
    expect(onWindowSelect).toHaveBeenCalledWith(windows[1]);
    expect(screen.getByText(/5 count/)).toBeTruthy();
  });
  it('keeps ramp fixed when populations refresh', () => {
    const { rerender } = render(
      <Heatmap
        buckets={buckets}
        windows={windows}
        values={[[0, 1, 10]]}
        unit={unit}
        measure="count"
        label="Heat"
      />,
    );
    expect(screen.getByText('0–10')).toBeTruthy();
    rerender(
      <Heatmap
        buckets={buckets}
        windows={windows}
        values={[[0, 1, 100]]}
        unit={unit}
        measure="count"
        label="Heat"
      />,
    );
    expect(screen.getByText('0–10')).toBeTruthy();
  });
  it('bounds DOM for dense inputs and retains one focus target', () => {
    const denseWindows = Array.from({ length: 3000 }, (_, index) => ({
      id: `${index}`,
      startMs: index * 10,
      endMs: index * 10 + 10,
    }));
    const { container } = render(
      <Heatmap
        buckets={buckets}
        windows={denseWindows}
        values={denseWindows.map(() => [0, 1, null])}
        unit={unit}
        measure="rate"
        label="Dense"
      />,
    );
    expect(container.querySelectorAll('svg path').length).toBeLessThan(15);
    expect(container.querySelectorAll('[tabindex="0"]').length).toBe(1);
  });
  it('rejects unordered windows and invalid color domains', () => {
    render(
      <Heatmap
        buckets={buckets}
        windows={[windows[1], windows[0]]}
        values={[[1]]}
        unit={unit}
        measure="count"
        colorDomain={[2, 2]}
        label="Bad"
      />,
    );
    expect(screen.getByText('No drawable samples')).toBeTruthy();
  });
  it('keeps empty and invalid ranges noninteractive', () => {
    const onWindowSelect = vi.fn();
    const { rerender, container } = render(
      <Heatmap
        buckets={buckets}
        windows={[]}
        values={[]}
        unit={unit}
        measure="count"
        label="Empty"
        onWindowSelect={onWindowSelect}
      />,
    );
    fireEvent.keyDown(screen.getByRole('img', { name: 'Empty' }), { key: 'Enter' });
    expect(onWindowSelect).not.toHaveBeenCalled();
    rerender(
      <Heatmap
        buckets={buckets}
        windows={windows}
        values={[[1]]}
        unit={unit}
        measure="count"
        colorDomain={[NaN, Infinity]}
        label="Empty"
        onWindowSelect={onWindowSelect}
      />,
    );
    fireEvent.keyDown(screen.getByRole('img', { name: 'Empty' }), { key: 'Enter' });
    expect(onWindowSelect).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid color domain')).toBeTruthy();
    expect(container.innerHTML).not.toContain('NaN');
  });
  it('freezes first populated extent after an empty render', () => {
    const { rerender } = render(
      <Heatmap
        buckets={buckets}
        windows={windows}
        values={[]}
        unit={unit}
        measure="count"
        label="Late"
      />,
    );
    rerender(
      <Heatmap
        buckets={buckets}
        windows={windows}
        values={[[0, 1, 8]]}
        unit={unit}
        measure="count"
        label="Late"
      />,
    );
    expect(screen.getByText('0–8')).toBeTruthy();
    rerender(
      <Heatmap
        buckets={buckets}
        windows={windows}
        values={[[0, 1, 80]]}
        unit={unit}
        measure="count"
        label="Late"
      />,
    );
    expect(screen.getByText('0–8')).toBeTruthy();
  });
});

describe('state interval geometry', () => {
  const domain = { startMs: 0, endMs: 100 };
  it('keeps duplicate overlapping references unknown', () => {
    const interval = { id: 'same', stateId: 'ok', startMs: 0, endMs: 100 };
    expect(timelineSegments([interval, interval], domain)).toEqual([
      { startMs: 0, endMs: 100, interval: null },
    ]);
  });
  it('clips boundaries, preserves gaps and marks overlaps unknown', () => {
    const a = { id: 'a', stateId: 'ok', startMs: -10, endMs: 40 };
    const b = { id: 'b', stateId: 'bad', startMs: 30, endMs: 60 };
    expect(
      timelineSegments([a, b, { id: 'bad', stateId: 'ok', startMs: NaN, endMs: 70 }], domain),
    ).toEqual([
      { startMs: 0, endMs: 30, interval: a },
      { startMs: 30, endMs: 40, interval: null },
      { startMs: 40, endMs: 60, interval: b },
      { startMs: 60, endMs: 100, interval: null },
    ]);
  });
  it('inspects gaps and selects original intervals through keyboard', () => {
    const interval = { id: 'run', stateId: 'running', startMs: 20, endMs: 80 };
    const onIntervalSelect = vi.fn();
    render(
      <StateTimeline
        lanes={[{ id: 'lane', label: 'Worker', intervals: [interval] }]}
        states={[{ id: 'running', label: 'Running', tone: 'success' }]}
        domain={domain}
        label="States"
        onIntervalSelect={onIntervalSelect}
      />,
    );
    const plot = screen.getByRole('img', { name: 'States' });
    expect(screen.getByText(/Worker · Unknown/)).toBeTruthy();
    fireEvent.keyDown(plot, { key: 'Enter' });
    expect(onIntervalSelect).not.toHaveBeenCalled();
    fireEvent.keyDown(plot, { key: 'ArrowRight' });
    expect(screen.getByText(/Worker · Running/)).toBeTruthy();
    fireEvent.keyDown(plot, { key: 'Enter' });
    expect(onIntervalSelect).toHaveBeenCalledWith('lane', interval);
  });
});
