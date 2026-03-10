import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { IconButton } from '@omniview/base-ui';
import { LuChevronLeft, LuChevronRight } from '../../system/icons';
import { cn } from '../../system/classnames';
import styles from './AIBranch.module.css';

// ── Context ──────────────────────────────────────────────────────────

interface BranchContextValue {
  count: number;
  active: number;
  onChange?: (index: number) => void;
}

const BranchContext = createContext<BranchContextValue | null>(null);

function useBranch(): BranchContextValue {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error('AIBranch.* components must be used within <AIBranch>');
  }
  return ctx;
}

// ── AIBranch (Root) ──────────────────────────────────────────────────

export interface AIBranchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Total number of branches */
  count: number;
  /** Currently active branch index (0-based) */
  active: number;
  /** Called when the user navigates to a different branch */
  onChange?: (index: number) => void;
  children: ReactNode;
}

export const AIBranch = forwardRef<HTMLDivElement, AIBranchProps>(
  function AIBranch({ count, active, onChange, className, children, ...rest }, ref) {
    return (
      <BranchContext.Provider value={{ count, active, onChange }}>
        <div ref={ref} className={cn(styles.Root, className)} {...rest}>
          {children}
        </div>
      </BranchContext.Provider>
    );
  },
);

// ── AIBranchContent ──────────────────────────────────────────────────

export interface AIBranchContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Branch index this content belongs to */
  index: number;
  children: ReactNode;
}

export const AIBranchContent = forwardRef<HTMLDivElement, AIBranchContentProps>(
  function AIBranchContent({ index, children, ...rest }, ref) {
    const { active } = useBranch();
    if (index !== active) return null;
    return (
      <div ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);

// ── AIBranchSelector ─────────────────────────────────────────────────

export interface AIBranchSelectorProps extends HTMLAttributes<HTMLDivElement> {
  /** Alignment hint for positioning */
  align?: 'start' | 'end';
}

export const AIBranchSelector = forwardRef<HTMLDivElement, AIBranchSelectorProps>(
  function AIBranchSelector({ align, className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.Selector, className)}
        data-align={align}
        {...rest}
      >
        {children ?? (
          <>
            <AIBranchPrevious />
            <AIBranchIndicator />
            <AIBranchNext />
          </>
        )}
      </div>
    );
  },
);

// ── AIBranchPrevious ─────────────────────────────────────────────────

export interface AIBranchPreviousProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {}

export const AIBranchPrevious = forwardRef<HTMLElement, AIBranchPreviousProps>(
  function AIBranchPrevious(props, ref) {
    const { active, onChange } = useBranch();
    const disabled = active === 0;
    return (
      <IconButton
        ref={ref}
        size="sm"
        variant="ghost"
        color="neutral"
        aria-label="Previous branch"
        disabled={disabled}
        onClick={() => onChange?.(active - 1)}
        {...props}
      >
        <LuChevronLeft size={14} />
      </IconButton>
    );
  },
);

// ── AIBranchNext ─────────────────────────────────────────────────────

export interface AIBranchNextProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {}

export const AIBranchNext = forwardRef<HTMLElement, AIBranchNextProps>(
  function AIBranchNext(props, ref) {
    const { count, active, onChange } = useBranch();
    const disabled = active === count - 1;
    return (
      <IconButton
        ref={ref}
        size="sm"
        variant="ghost"
        color="neutral"
        aria-label="Next branch"
        disabled={disabled}
        onClick={() => onChange?.(active + 1)}
        {...props}
      >
        <LuChevronRight size={14} />
      </IconButton>
    );
  },
);

// ── AIBranchIndicator ────────────────────────────────────────────────

export interface AIBranchIndicatorProps extends HTMLAttributes<HTMLSpanElement> {}

export const AIBranchIndicator = forwardRef<HTMLSpanElement, AIBranchIndicatorProps>(
  function AIBranchIndicator({ className, ...rest }, ref) {
    const { count, active } = useBranch();
    return (
      <span ref={ref} className={cn(styles.Indicator, className)} {...rest}>
        {active + 1} of {count}
      </span>
    );
  },
);
