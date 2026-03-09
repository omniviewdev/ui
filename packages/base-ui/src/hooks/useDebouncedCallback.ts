import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

interface DebouncedFunction<TArgs extends unknown[], TReturn> {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => TReturn | undefined;
}

/**
 * Returns a debounced version of the callback that only fires after `delay` ms
 * of no invocations. Includes `cancel()` and `flush()` methods.
 */
export function useDebouncedCallback<TArgs extends unknown[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  delay = 300,
): DebouncedFunction<TArgs, TReturn> {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingArgsRef = useRef<TArgs | undefined>(undefined);

  // Keep callback ref fresh without re-creating the debounced function
  callbackRef.current = callback;

  const cancel = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    pendingArgsRef.current = undefined;
  }, []);

  const flush = useCallback((): TReturn | undefined => {
    if (timerRef.current !== undefined && pendingArgsRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
      const args = pendingArgsRef.current;
      pendingArgsRef.current = undefined;
      return callbackRef.current(...args);
    }
    return undefined;
  }, []);

  // Clean up on unmount
  useEffect(() => cancel, [cancel]);

  // Cancel pending timers synchronously when delay changes
  useLayoutEffect(() => cancel, [delay, cancel]);

  const debounced = useCallback(
    (...args: TArgs) => {
      pendingArgsRef.current = args;
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = undefined;
        pendingArgsRef.current = undefined;
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  ) as DebouncedFunction<TArgs, TReturn>;

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
}
