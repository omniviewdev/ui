import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import styles from './SegmentedControl.module.css';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SegmentedControlContextValue {
  value: string | undefined;
  onSelect: (value: string) => void;
  name: string;
  size: ComponentSize;
  disabled: boolean;
}

const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

function useSegmentedControl(): SegmentedControlContextValue {
  const ctx = useContext(SegmentedControlContext);
  if (!ctx) throw new Error('SegmentedControl.Item must be used within <SegmentedControl>');
  return ctx;
}

// ---------------------------------------------------------------------------
// SegmentedControl (root)
// ---------------------------------------------------------------------------

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ComponentSize;
  disabled?: boolean;
  children: ReactNode;
}

const SegmentedControlRoot = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      size = 'md',
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;
    const name = useId();

    const onSelect = useCallback(
      (next: string) => {
        if (disabled) return;
        if (!isControlled) setInternalValue(next);
        onValueChange?.(next);
      },
      [disabled, isControlled, onValueChange],
    );

    const contextValue = useMemo(
      () => ({ value, onSelect, name, size, disabled }),
      [value, onSelect, name, size, disabled],
    );

    return (
      <SegmentedControlContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn(styles.Root, className)}
          data-ov-size={size}
          data-ov-disabled={disabled ? 'true' : undefined}
          {...rest}
        >
          {children}
        </div>
      </SegmentedControlContext.Provider>
    );
  },
);

SegmentedControlRoot.displayName = 'SegmentedControl';

// ---------------------------------------------------------------------------
// SegmentedControl.Item
// ---------------------------------------------------------------------------

export interface SegmentedControlItemProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

const SegmentedControlItem = forwardRef<HTMLLabelElement, SegmentedControlItemProps>(
  function SegmentedControlItem({ value, disabled: itemDisabled, className, children, ...rest }, ref) {
    const ctx = useSegmentedControl();
    const inputRef = useRef<HTMLInputElement>(null);
    const isDisabled = ctx.disabled || itemDisabled;
    const isActive = ctx.value === value;

    return (
      <label
        ref={ref}
        className={cn(styles.Item, className)}
        data-ov-active={isActive ? 'true' : undefined}
        data-ov-disabled={isDisabled ? 'true' : undefined}
        {...rest}
      >
        <input
          ref={inputRef}
          type="radio"
          className={styles.Input}
          name={ctx.name}
          value={value}
          checked={isActive}
          disabled={isDisabled}
          onChange={() => ctx.onSelect(value)}
        />
        <span className={styles.Label}>{children}</span>
      </label>
    );
  },
);

SegmentedControlItem.displayName = 'SegmentedControl.Item';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type SegmentedControlCompound = typeof SegmentedControlRoot & {
  Item: typeof SegmentedControlItem;
};

export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
}) as SegmentedControlCompound;
