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

  // Keep refs so the setter callback identity is stable
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Always reflects the latest value for resolving functional updates
  const currentValueRef = useRef(value);
  currentValueRef.current = value;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolve = (prev: T): T =>
        typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;

      const nextValue = resolve(currentValueRef.current);

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      currentValueRef.current = nextValue;
      onChangeRef.current?.(nextValue);
    },
    [isControlled],
  );

  return [value, setValue];
}
