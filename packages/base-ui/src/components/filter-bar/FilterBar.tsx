import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import { Chip } from '../chip';
import { IconButton } from '../icon-button';
import { LuPlus, LuX } from 'react-icons/lu';
import styles from './FilterBar.module.css';

// ---------------------------------------------------------------------------
// Context — propagates size to all sub-components
// ---------------------------------------------------------------------------

const FilterBarContext = createContext<{ size: ComponentSize }>({ size: 'md' });

function useFilterBar() {
  return useContext(FilterBarContext);
}

// ---------------------------------------------------------------------------
// FilterBar (root)
// ---------------------------------------------------------------------------

export interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  size?: ComponentSize;
}

const FilterBarRoot = forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  { className, size = 'md', children, ...props },
  ref,
) {
  const contextValue = useMemo(() => ({ size }), [size]);
  return (
    <FilterBarContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-size={size}
        {...props}
      >
        {children}
      </div>
    </FilterBarContext.Provider>
  );
});

FilterBarRoot.displayName = 'FilterBar';

// ---------------------------------------------------------------------------
// FilterBar.Chip
// ---------------------------------------------------------------------------

export interface FilterBarChipProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  onRemove?: () => void;
  children: ReactNode;
}

const FilterBarChip = forwardRef<HTMLElement, FilterBarChipProps>(
  function FilterBarChip({ onRemove, children, ...props }, ref) {
    const { size } = useFilterBar();

    const handleRemoveClick = onRemove
      ? (e: MouseEvent) => {
          e.stopPropagation();
          onRemove();
        }
      : undefined;

    return (
      <Chip
        ref={ref}
        variant="outline"
        size={size}
        endDecorator={
          onRemove ? (
            <IconButton
              variant="ghost"
              size={size}
              dense
              aria-label="Remove filter"
              onClick={handleRemoveClick}
            >
              <LuX />
            </IconButton>
          ) : undefined
        }
        {...props}
      >
        {children}
      </Chip>
    );
  },
);

FilterBarChip.displayName = 'FilterBar.Chip';

// ---------------------------------------------------------------------------
// FilterBar.Add
// ---------------------------------------------------------------------------

export interface FilterBarAddProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  onClick?: () => void;
  children?: ReactNode;
}

const FilterBarAdd = forwardRef<HTMLButtonElement, FilterBarAddProps>(
  function FilterBarAdd({ children, ...props }, ref) {
    const { size } = useFilterBar();

    return (
      <IconButton
        ref={ref as never}
        variant="ghost"
        size={size}
        dense
        aria-label="Add filter"
        {...props}
      >
        {children ?? <LuPlus />}
      </IconButton>
    );
  },
);

FilterBarAdd.displayName = 'FilterBar.Add';

// ---------------------------------------------------------------------------
// FilterBar.Clear
// ---------------------------------------------------------------------------

export interface FilterBarClearProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  onClick: () => void;
  children?: ReactNode;
}

const FilterBarClear = forwardRef<HTMLButtonElement, FilterBarClearProps>(
  function FilterBarClear({ children, ...props }, ref) {
    const { size } = useFilterBar();

    return (
      <IconButton
        ref={ref as never}
        variant="ghost"
        size={size}
        dense
        aria-label={typeof children === 'string' ? children : 'Clear all'}
        {...props}
      >
        {children ?? <LuX />}
      </IconButton>
    );
  },
);

FilterBarClear.displayName = 'FilterBar.Clear';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type FilterBarCompound = typeof FilterBarRoot & {
  Chip: typeof FilterBarChip;
  Add: typeof FilterBarAdd;
  Clear: typeof FilterBarClear;
};

export const FilterBar = Object.assign(FilterBarRoot, {
  Chip: FilterBarChip,
  Add: FilterBarAdd,
  Clear: FilterBarClear,
}) as FilterBarCompound;
