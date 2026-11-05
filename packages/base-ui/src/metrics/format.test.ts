import { describe, expect, it } from 'vitest';
import { formatMetric, formatMetricText } from './format';

describe('metric formatting semantics', () => {
  it('normalizes CPU base units without a thousand-fold display difference', () => {
    expect(formatMetric(0.12, { kind: 'cpu', base: 'cores' })).toEqual(
      formatMetric(120, { kind: 'cpu', base: 'millicores' }),
    );
    expect(formatMetric(1500, { kind: 'cpu', base: 'millicores' })).toEqual({
      value: '1.5',
      unit: 'cores',
    });
  });
  it('keeps ratio and percentage scale conventions explicit', () => {
    expect(formatMetricText(0.75, { kind: 'ratio' })).toBe('75 %');
    expect(formatMetricText(0.75, { kind: 'percent' })).toBe('0.75 %');
  });
  it('distinguishes binary and decimal byte units', () => {
    expect(formatMetric(1024, { kind: 'bytes', display: 'binary' })).toEqual({
      value: '1',
      unit: 'KiB',
    });
    expect(formatMetric(1024, { kind: 'bytes', display: 'decimal' })).toEqual({
      value: '1.02',
      unit: 'kB',
    });
  });
  it('normalizes duration units and retains negative measurements', () => {
    expect(formatMetric(0.24, { kind: 'duration', base: 'seconds' })).toEqual(
      formatMetric(240, { kind: 'duration', base: 'milliseconds' }),
    );
    expect(formatMetric(-250, { kind: 'duration', base: 'milliseconds' })).toEqual({
      value: '-250',
      unit: 'ms',
    });
  });
  it('never renders missing or nonfinite data as an observed zero', () => {
    for (const value of [null, NaN, Infinity, -Infinity])
      expect(formatMetric(value, { kind: 'number' })).toEqual({ value: '—', unit: '' });
    expect(formatMetric(0, { kind: 'number' })).toEqual({ value: '0', unit: '' });
  });
  it('bounds precision safely and supports locale formatting', () => {
    expect(formatMetric(1.234, { kind: 'number' }, { maximumFractionDigits: NaN }).value).toBe(
      '1.23',
    );
    expect(formatMetric(1.234, { kind: 'number' }, { maximumFractionDigits: -1 }).value).toBe('1');
    expect(
      formatMetric(1.234, { kind: 'number' }, { maximumFractionDigits: 2, locale: 'de-DE' }).value,
    ).toBe('1,23');
  });
});
