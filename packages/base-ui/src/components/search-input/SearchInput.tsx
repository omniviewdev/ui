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
import type {
  ComponentColor,
  ComponentSize,
  ComponentVariant,
  StyledComponentProps,
} from '../../system/types';
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

const ALLOWED_VARIANTS: ComponentVariant[] = ['solid', 'soft', 'outline', 'ghost'];
const ALLOWED_COLORS: ComponentColor[] = ['neutral', 'brand', 'success', 'warning', 'danger'];
const ALLOWED_SIZES: ComponentSize[] = ['sm', 'md', 'lg'];

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
    const resolvedVariant = ALLOWED_VARIANTS.includes(variant as ComponentVariant)
      ? (variant as ComponentVariant)
      : undefined;
    const resolvedColor = ALLOWED_COLORS.includes(color as ComponentColor)
      ? (color as ComponentColor)
      : undefined;
    const resolvedSize = ALLOWED_SIZES.includes(size as ComponentSize)
      ? (size as ComponentSize)
      : undefined;

    return (
      <Input.Root
        className={className}
        variant={resolvedVariant}
        color={resolvedColor}
        size={resolvedSize}
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
                  dense
                  variant="ghost"
                  color={resolvedColor ?? 'neutral'}
                  size={resolvedSize}
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
