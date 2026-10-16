import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { LuSearch, LuX } from 'react-icons/lu';
import type { StyledComponentProps } from '../../system/types';
import { Input, type InputControlProps } from '../input';
import { IconButton } from '../icon-button';
import styles from './SearchInput.module.css';

export interface SearchInputProps
  extends
    Omit<
      InputControlProps,
      | 'startDecorator'
      | 'endDecorator'
      | 'onValueChange'
      | 'value'
      | 'defaultValue'
      | 'type'
      | 'className'
      | 'variant'
      | 'color'
      | 'size'
      | 'style'
    >,
    StyledComponentProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  clearable?: boolean;
  clearButtonLabel?: string;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  clearDecorator?: ReactNode;
  style?: CSSProperties;
  className?: string;
  controlClassName?: string;
  rootProps?: Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'color'>;
}

export const SearchInput = forwardRef<ElementRef<typeof Input.Control>, SearchInputProps>(
  function SearchInput(
    {
      value,
      defaultValue,
      onValueChange,
      onClear,
      clearable = true,
      clearButtonLabel = 'Clear search',
      startDecorator,
      endDecorator,
      clearDecorator,
      className,
      controlClassName,
      rootProps,
      disabled,
      variant,
      color,
      size,
      style,
      ...props
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const localRef = useRef<ElementRef<typeof Input.Control> | null>(null);
    const isControlled = value !== undefined;
    const resolvedValue = isControlled ? value : internalValue;

    const mergedStartDecorator = useMemo(() => {
      if (startDecorator !== undefined) {
        return startDecorator;
      }

      return <LuSearch aria-hidden className={styles.SearchIcon} />;
    }, [startDecorator]);

    const handleValueChange = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    };

    const handleClear = () => {
      handleValueChange('');
      onClear?.();

      if (localRef.current instanceof HTMLElement) {
        localRef.current.focus();
      }
    };

    const showClearButton = clearable && !disabled && resolvedValue.length > 0;

    return (
      <Input.Root
        className={className}
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        style={style}
        {...rootProps}
      >
        <Input.Control
          {...props}
          className={controlClassName}
          ref={(node) => {
            localRef.current = node;

            if (typeof ref === 'function') {
              ref(node);
              return;
            }

            if (ref) {
              ref.current = node;
            }
          }}
          type="text"
          disabled={disabled}
          value={resolvedValue}
          onValueChange={handleValueChange}
          startDecorator={mergedStartDecorator}
          endDecorator={
            <>
              {endDecorator}
              {showClearButton ? (
                <IconButton
                  className={styles.ClearButton}
                  variant="ghost"
                  color={color ?? 'neutral'}
                  size={size}
                  onClick={handleClear}
                  aria-label={clearButtonLabel}
                >
                  {clearDecorator ?? <LuX aria-hidden />}
                </IconButton>
              ) : null}
            </>
          }
        />
      </Input.Root>
    );
  },
);

SearchInput.displayName = 'SearchInput';
