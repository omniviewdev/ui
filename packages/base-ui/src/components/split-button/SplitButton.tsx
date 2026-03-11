import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { ComponentSize, ComponentVariant } from '../../system/types';
import { Menu } from '../menu';
import styles from './SplitButton.module.css';

/* ---------------------------------- Types --------------------------------- */

export type SplitButtonColor = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

export interface SplitButtonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  variant?: ComponentVariant;
  color?: SplitButtonColor;
  size?: ComponentSize;
  disabled?: boolean;
}

export interface SplitButtonActionProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  disabled?: boolean;
}

export interface SplitButtonMenuProps {
  children: ReactNode;
  /** Accessible label for the menu trigger button. @default 'More actions' */
  menuAriaLabel?: string;
}

/* --------------------------------- Context -------------------------------- */

interface SplitButtonContextValue {
  variant?: ComponentVariant;
  color?: SplitButtonColor;
  size?: ComponentSize;
  disabled?: boolean;
}

const SplitButtonContext = createContext<SplitButtonContextValue | null>(null);

/* ---------------------------------- Root ---------------------------------- */

const SplitButtonRoot = forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButtonRoot(
  { className, variant = 'soft', color = 'neutral', size = 'md', disabled = false, ...props },
  ref,
) {
  const contextValue = useMemo(
    () => ({ variant, color, size, disabled }),
    [variant, color, size, disabled],
  );
  return (
    <SplitButtonContext.Provider value={contextValue}>
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
    const isDisabled = ctx?.disabled || disabledProp || false;

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
  { children, menuAriaLabel = 'More actions' },
  ref,
) {
  const ctx = useContext(SplitButtonContext);
  const isDisabled = ctx?.disabled ?? false;

  return (
    <div ref={ref} className={styles.MenuContainer}>
      <Menu>
        <Menu.Trigger
          className={styles.MenuTrigger}
          disabled={isDisabled}
          aria-label={menuAriaLabel}
          {...styleDataAttributes({
            variant: ctx?.variant,
            color: ctx?.color,
            size: ctx?.size,
          })}
        >
          <LuChevronDown aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={4}>
            <Menu.Popup>
              {children}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu>
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
