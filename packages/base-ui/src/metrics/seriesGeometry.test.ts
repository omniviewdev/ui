import { describe, expect, it } from 'vitest';
import { areaPath, linePath, samplePoints, stackFrame, valueDomain } from './seriesGeometry';

const domain = { startMs: 0, endMs: 100 };
describe('time series geometry', () => {
  it('keeps explicit nulls and elapsed gaps disconnected', () => {
    const points = [
      { timeMs: 0, value: 1 },
      { timeMs: 1, value: null },
      { timeMs: 2, value: 2 },
      { timeMs: 90, value: 3 },
    ];
    const sampled = samplePoints(points, domain, 100, 10);
    expect(linePath(sampled, domain, [0, 4], 100, 10).match(/M/g)).toHaveLength(3);
  });
  it('bounds dense data while retaining extrema and null breaks', () => {
    const points = Array.from({ length: 10001 }, (_, i) => ({
      timeMs: i / 100,
      value: i === 101 ? 900 : i === 102 ? -800 : i === 500 ? null : 1,
    }));
    const sampled = samplePoints(points, domain, 10);
    expect(sampled.length).toBeLessThan(120);
    expect(sampled.some((p) => p.value === 900)).toBe(true);
    expect(sampled.some((p) => p.value === -800)).toBe(true);
    expect(sampled.some((p) => p.value === null)).toBe(true);
  });
  it('rejects invalid and unsorted samples instead of emitting NaN paths', () => {
    expect(
      samplePoints(
        [
          { timeMs: 2, value: 1 },
          { timeMs: 1, value: 2 },
        ],
        domain,
      ),
    ).toEqual([]);
    expect(samplePoints([{ timeMs: 1, value: Infinity }], domain)).toEqual([]);
    expect(samplePoints([{ timeMs: 1, value: 1 }], { startMs: 0, endMs: 0 })).toEqual([]);
  });
  it('rejects mismatched frame columns and unordered timestamps', () => {
    expect(
      stackFrame({ timestamps: [0, 1], series: [{ id: 'a', label: 'A', values: [1] }] }).valid,
    ).toBe(false);
    expect(stackFrame({ timestamps: [1, 0], series: [] }).valid).toBe(false);
  });
  it('uses real stacked boundaries and leaves unknown totals unknown', () => {
    const frame = stackFrame({
      timestamps: [0, 1],
      series: [
        { id: 'a', label: 'A', values: [2, null] },
        { id: 'b', label: 'B', values: [3, 4] },
      ],
    });
    const upper = frame.series[1];
    const lower = frame.bases[1];
    if (!upper || !lower) throw new Error('Expected both stacked layers');
    expect(upper.points.map((p) => p.value)).toEqual([5, null]);
    expect(lower.points.map((p) => p.value)).toEqual([2, null]);
    expect(areaPath(upper.points, lower.points, domain, [0, 5], 100)).toContain('L0.00,60.00');
  });
  it('stacks negative values below zero without subtracting positive layers', () => {
    const frame = stackFrame({
      timestamps: [0],
      series: [
        { id: 'a', label: 'A', values: [2] },
        { id: 'b', label: 'B', values: [-3] },
        { id: 'c', label: 'C', values: [-4] },
      ],
    });
    expect(frame.series.map((s) => s.points[0]?.value)).toEqual([2, -3, -7]);
    expect(frame.bases.map((s) => s.points[0]?.value)).toEqual([0, 0, -3]);
    expect(valueDomain(frame.series, domain)).toEqual([-7, 2]);
  });
  it('does not join retained extrema across a gap inside one pixel', () => {
    const points = [
      { timeMs: 0, value: 1 },
      { timeMs: 40, value: 9 },
      { timeMs: 45, value: 2 },
    ];
    const path = linePath(samplePoints(points, domain, 1, 10), domain, [0, 10], 100, 10);
    expect(path).not.toContain('L');
  });
  it('excludes fractional timestamps after the domain end', () => {
    expect(samplePoints([{ timeMs: 100.5, value: 2 }], domain)).toEqual([]);
  });
  it('keeps overflowing stack totals unknown', () => {
    const frame = stackFrame({
      timestamps: [0],
      series: [
        { id: 'a', label: 'A', values: [Number.MAX_VALUE] },
        { id: 'b', label: 'B', values: [Number.MAX_VALUE] },
      ],
    });
    expect(frame.series.map((item) => item.points[0]?.value)).toEqual([null, null]);
  });
});
