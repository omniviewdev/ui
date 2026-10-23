import { describe, expect, it, vi } from 'vitest';
import { latestRequestGate, sourcePosition, sourceOffset, completionMatches, automaticCompletion } from './presentation';

describe('CEL source presentation', () => {
  it('maps exact Unicode and CRLF source positions without splitting code points', () => {
    const text = 'a\r\n😀café.na';
    expect(sourcePosition(text, 13)).toEqual({ lineNumber: 2, column: 8 });
    expect(sourceOffset(text, { lineNumber: 2, column: 8 })).toBe(13);
    expect(() => sourcePosition(text, 5)).toThrow(RangeError);
    expect(() => sourceOffset(text, { lineNumber: 2, column: 2 })).toThrow(RangeError);
  });

  it('matches only bounded host candidates while preserving semantic ordering', () => {
    expect(completionMatches('cp', 'cpu')).toBe(true);
    expect(completionMatches('cp', 'minimumCpu')).toBe(true);
    expect(completionMatches('cccc', 'cpu')).toBe(false);
    expect(completionMatches('image', 'image')).toBe(true);
    expect(completionMatches('CP', 'cpu')).toBe(true);
  });
});

describe('CEL request ownership', () => {
  it('rejects obsolete versions and cancels a preceding request', () => {
    const gate = latestRequestGate();
    const first = gate.begin();
    const second = gate.begin();
    expect(first.signal.aborted).toBe(true);
    expect(gate.current(first)).toBe(false);
    expect(gate.current(second)).toBe(true);
    gate.cancel();
    expect(second.signal.aborted).toBe(true);
    expect(gate.current(second)).toBe(false);
  });

  it('isolates two simultaneous editors and channels', () => {
    const first = latestRequestGate();
    const other = latestRequestGate();
    const firstRequest = first.begin();
    const otherRequest = other.begin();
    first.cancel();
    expect(first.current(firstRequest)).toBe(false);
    expect(other.current(otherRequest)).toBe(true);
    expect(otherRequest.signal.aborted).toBe(false);
  });

  it('debounces automatic work once at 250ms and allows immediate explicit work', () => {
    vi.useFakeTimers();
    const calls: number[] = [];
    const scheduler = automaticCompletion(() => calls.push(Date.now()), 250);
    const start = Date.now();
    scheduler.schedule();
    vi.advanceTimersByTime(200);
    scheduler.schedule();
    vi.advanceTimersByTime(249);
    expect(calls).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(calls).toEqual([start + 450]);
    scheduler.schedule();
    scheduler.immediate();
    expect(calls).toEqual([start + 450, start + 450]);
    vi.advanceTimersByTime(1000);
    expect(calls).toHaveLength(2);
    scheduler.schedule();
    scheduler.cancel();
    vi.advanceTimersByTime(1000);
    expect(calls).toHaveLength(2);
    vi.useRealTimers();
  });
});
