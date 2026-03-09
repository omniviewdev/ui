import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls the callback after the delay', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('hello');
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledWith('hello');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('only calls with the last args on rapid invocations', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('a');
      result.current('b');
      result.current('c');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('cancel() prevents the pending call', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('test');
    });

    act(() => {
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).not.toHaveBeenCalled();
  });

  it('flush() immediately invokes the pending call and returns the result', () => {
    const fn = vi.fn((x: string) => `result:${x}`);
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('flushed');
    });

    let returnValue: string | undefined;
    act(() => {
      returnValue = result.current.flush();
    });

    expect(fn).toHaveBeenCalledWith('flushed');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(returnValue).toBe('result:flushed');

    // Should not fire again after delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('flush() returns undefined when nothing is pending', () => {
    const fn = vi.fn(() => 'value');
    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    let returnValue: string | undefined;
    act(() => {
      returnValue = result.current.flush();
    });

    expect(returnValue).toBeUndefined();
    expect(fn).not.toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('unmount-test');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).not.toHaveBeenCalled();
  });

  it('cancels pending timer when delay changes', () => {
    const fn = vi.fn();
    const { result, rerender } = renderHook(({ delay }) => useDebouncedCallback(fn, delay), {
      initialProps: { delay: 300 },
    });

    act(() => {
      result.current('pending');
    });

    // Change delay while timer is pending
    rerender({ delay: 500 });

    // Old delay fires — callback should NOT be called
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(fn).not.toHaveBeenCalled();

    // New delay fires — still no call since the pending work was cancelled
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(fn).not.toHaveBeenCalled();
  });

  it('uses latest callback ref', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 300), {
      initialProps: { cb: fn1 },
    });

    act(() => {
      result.current('test');
    });

    rerender({ cb: fn2 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledWith('test');
  });
});
