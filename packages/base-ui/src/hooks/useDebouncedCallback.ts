import { useCallback, useEffect, useRef } from 'react';

type DebouncedFunction<T extends (...args: never[]) => unknown> = T & {
  cancel: () => void;
  flush: () => void;
};

/**
 * Returns a debounced version of the callback that only fires after `delay` ms
 * of no invocations. Includes `cancel()` and `flush()` methods.
 */
export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay = 300,
): DebouncedFunction<T> {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const pendingArgsRef = useRef<Parameters<T>>();

  // Keep callback ref fresh without re-creating the debounced function
  callbackRef.current = callback;

  const cancel = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    pendingArgsRef.current = undefined;
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current !== undefined && pendingArgsRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
      callbackRef.current(...pendingArgsRef.current);
      pendingArgsRef.current = undefined;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => cancel, [cancel]);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
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
  ) as DebouncedFunction<T>;

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
}
