import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './SplitButton.module.css';

/* ---------------------------------- Types --------------------------------- */

export interface SplitButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, StyledComponentProps {
  disabled?: boolean;
}

export interface SplitButtonActionProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  disabled?: boolean;
}

export interface SplitButtonMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/* --------------------------------- Context -------------------------------- */

interface SplitButtonContextValue extends StyledComponentProps {
  disabled?: boolean;
}

const SplitButtonContext = createContext<SplitButtonContextValue | null>(null);

/* ---------------------------------- Root ---------------------------------- */

const SplitButtonRoot = forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButtonRoot(
  { className, variant = 'soft', color = 'neutral', size = 'md', disabled = false, ...props },
  ref,
) {
  return (
    <SplitButtonContext.Provider value={{ variant, color, size, disabled }}>
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        {...styleDataAttributes({ variant, color, size })}
        data-ov-disabled={disabled ? 'true' : undefined}
        {...props}
      />
    </SplitButtonContext.Provider>
  );
});

/* --------------------------------- Action --------------------------------- */

const SplitButtonAction = forwardRef<HTMLButtonElement, SplitButtonActionProps>(
  function SplitButtonAction({ className, disabled: disabledProp, ...props }, ref) {
    const ctx = useContext(SplitButtonContext);
    const isDisabled = disabledProp ?? ctx?.disabled ?? false;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.Action, className)}
        disabled={isDisabled}
        {...styleDataAttributes({
          variant: ctx?.variant,
          color: ctx?.color,
          size: ctx?.size,
        })}
        {...props}
      />
    );
  },
);

/* ---------------------------------- Menu ---------------------------------- */

const SplitButtonMenu = forwardRef<HTMLDivElement, SplitButtonMenuProps>(function SplitButtonMenu(
  { className, children, ...props },
  ref,
) {
  const ctx = useContext(SplitButtonContext);
  const isDisabled = ctx?.disabled ?? false;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    if (!isDisabled) {
      setOpen((prev) => !prev);
    }
  }, [isDisabled]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={cn(styles.MenuContainer, className)} {...props}>
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={styles.MenuTrigger}
        disabled={isDisabled}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={toggle}
        {...styleDataAttributes({
          variant: ctx?.variant,
          color: ctx?.color,
          size: ctx?.size,
        })}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 5L6 8L9 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className={styles.Dropdown} role="menu">
          {children}
        </div>
      )}
    </div>
  );
});

/* ------------------------------ Display names ----------------------------- */

SplitButtonRoot.displayName = 'SplitButton';
SplitButtonAction.displayName = 'SplitButton.Action';
SplitButtonMenu.displayName = 'SplitButton.Menu';

/* ----------------------------- Compound export ---------------------------- */

type SplitButtonCompound = typeof SplitButtonRoot & {
  Action: typeof SplitButtonAction;
  Menu: typeof SplitButtonMenu;
};

export const SplitButton = Object.assign(SplitButtonRoot, {
  Action: SplitButtonAction,
  Menu: SplitButtonMenu,
}) as SplitButtonCompound;
