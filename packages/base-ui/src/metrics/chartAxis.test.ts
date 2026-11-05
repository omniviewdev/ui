import { describe, expect, it } from 'vitest';
import { metricAxisScale } from './chartAxis';

describe('metric axis scale', () => {
  it('keeps CPU measurements inside readable automatic bounds', () => {
    expect(metricAxisScale([0, 24.1])).toEqual({ domain: [0, 30], ticks: [30, 20, 10, 0] });
  });
  it('preserves caller-specified capacity domains exactly', () => {
    expect(metricAxisScale([0, 512], true)).toEqual({ domain: [0, 512], ticks: [512, 256, 0] });
  });
  it('retains a signed zero baseline and a bounded tick count', () => {
    const scale = metricAxisScale([-3, 8]);
    expect(scale.domain[0]).toBeLessThanOrEqual(-3);
    expect(scale.domain[1]).toBeGreaterThanOrEqual(8);
    expect(scale.ticks).toContain(0);
    expect(scale.ticks.length).toBeLessThanOrEqual(9);
  });
  it('does not overflow finite extreme or subnormal measurements', () => {
    for (const bounds of [
      [-Number.MAX_VALUE, Number.MAX_VALUE],
      [0, Number.MIN_VALUE],
    ] as const) {
      const scale = metricAxisScale(bounds);
      expect(scale.ticks.every(Number.isFinite)).toBe(true);
      expect(scale.domain.every(Number.isFinite)).toBe(true);
    }
  });
});
