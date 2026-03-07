import { useCallback, useRef, useState } from 'react';

/**
 * Generic hook for controlled/uncontrolled state patterns.
 * If `controlledValue` is not undefined, the component is controlled.
 */
export function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Keep a ref so the setter callback identity is stable
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolve = (prev: T): T =>
        typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;

      if (isControlled) {
        // In controlled mode, just notify — parent owns the state
        const resolved = resolve(controlledValue);
        onChangeRef.current?.(resolved);
      } else {
        setInternalValue((prev) => {
          const resolved = resolve(prev);
          onChangeRef.current?.(resolved);
          return resolved;
        });
      }
    },
    [isControlled, controlledValue],
  );

  return [value, setValue];
}
