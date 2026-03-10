import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import styles from './Collapsible.module.css';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  disabled: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export function useCollapsible(): CollapsibleContextValue {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error('Collapsible sub-components must be used within <Collapsible>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Collapsible (root)
// ---------------------------------------------------------------------------

export type CollapsibleAnimation = 'default' | 'fast' | 'none';

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled default open state (default: false) */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Animation speed (default: 'default') */
  animation?: CollapsibleAnimation;
  /** Disable interaction */
  disabled?: boolean;
  children: ReactNode;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      animation = 'default',
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : internalOpen;

    useEffect(() => {
      if (isControlled) setInternalOpen(openProp);
    }, [isControlled, openProp]);

    const toggle = useCallback(() => {
      if (disabled) return;
      const next = !open;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    }, [disabled, open, isControlled, onOpenChange]);

    const ctx: CollapsibleContextValue = { open, toggle, disabled };

    return (
      <CollapsibleContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn(styles.Root, className)}
          data-ov-open={open ? 'true' : 'false'}
          data-ov-disabled={disabled ? 'true' : undefined}
          data-ov-animation={animation}
          {...rest}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// CollapsibleTrigger
// ---------------------------------------------------------------------------

export interface CollapsibleTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ className, children, onClick, ...rest }, ref) {
    const { open, toggle, disabled } = useCollapsible();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        toggle();
        onClick?.(e);
      },
      [toggle, onClick],
    );

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.Trigger, className)}
        onClick={handleClick}
        aria-expanded={open}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

// ---------------------------------------------------------------------------
// CollapsibleContent
// ---------------------------------------------------------------------------

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Force mount even when collapsed (for SEO or pre-measuring) */
  forceMount?: boolean;
  children: ReactNode;
}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ forceMount = false, className, children, ...rest }, ref) {
    const { open } = useCollapsible();

    if (!forceMount && !open) {
      // Still render the grid wrapper for animation, just empty
    }

    return (
      <div
        ref={ref}
        className={cn(styles.Content, className)}
        aria-hidden={!open}
        {...rest}
      >
        <div className={styles.ContentInner}>
          {children}
        </div>
      </div>
    );
  },
);
