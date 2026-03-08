import { describe, expect, it } from 'vitest';
import { statusToColor } from './status';

describe('statusToColor', () => {
  it.each([
    ['success', 'success'],
    ['healthy', 'success'],
    ['running', 'success'],
    ['ready', 'success'],
    ['active', 'success'],
    ['complete', 'success'],
    ['connected', 'success'],
  ] as const)('maps "%s" to "success"', (input, expected) => {
    expect(statusToColor(input)).toBe(expected);
  });

  it.each([
    ['warning', 'warning'],
    ['degraded', 'warning'],
    ['slow', 'warning'],
  ] as const)('maps "%s" to "warning"', (input, expected) => {
    expect(statusToColor(input)).toBe(expected);
  });

  it.each([
    ['danger', 'danger'],
    ['error', 'danger'],
    ['failed', 'danger'],
    ['unhealthy', 'danger'],
    ['critical', 'danger'],
    ['disconnected', 'danger'],
  ] as const)('maps "%s" to "danger"', (input, expected) => {
    expect(statusToColor(input)).toBe(expected);
  });

  it.each([
    ['info', 'info'],
    ['pending', 'info'],
    ['waiting', 'info'],
    ['building', 'info'],
    ['syncing', 'info'],
  ] as const)('maps "%s" to "info"', (input, expected) => {
    expect(statusToColor(input)).toBe(expected);
  });

  it.each([
    ['neutral', 'neutral'],
    ['unknown', 'neutral'],
    ['idle', 'neutral'],
    ['stopped', 'neutral'],
  ] as const)('maps "%s" to "neutral"', (input, expected) => {
    expect(statusToColor(input)).toBe(expected);
  });

  it('is case insensitive', () => {
    expect(statusToColor('SUCCESS')).toBe('success');
    expect(statusToColor('Running')).toBe('success');
    expect(statusToColor('FAILED')).toBe('danger');
    expect(statusToColor('Pending')).toBe('info');
  });

  it('defaults unknown values to neutral', () => {
    expect(statusToColor('banana')).toBe('neutral');
    expect(statusToColor('')).toBe('neutral');
    expect(statusToColor('some-random-status')).toBe('neutral');
  });
});
