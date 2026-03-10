import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import type { ComponentColor, ComponentSize } from '../../system/types';
import { Separator } from '../separator';
import { StatusDot, type StatusDotProps } from '../status-dot';
import { Progress, type ProgressProps } from '../progress';
import styles from './StatusBar.module.css';

// ---------------------------------------------------------------------------
// Context — propagates size to all sub-components
// ---------------------------------------------------------------------------

const StatusBarContext = createContext<{ size: ComponentSize }>({ size: 'sm' });

function useStatusBar() {
  return useContext(StatusBarContext);
}

// ---------------------------------------------------------------------------
// StatusBar (root)
// ---------------------------------------------------------------------------

export interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {
  size?: ComponentSize;
}

const StatusBarRoot = forwardRef<HTMLDivElement, StatusBarProps>(function StatusBar(
  { className, size = 'sm', children, ...props },
  ref,
) {
  return (
    <StatusBarContext.Provider value={{ size }}>
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-size={size}
        {...props}
      >
        {children}
      </div>
    </StatusBarContext.Provider>
  );
});

StatusBarRoot.displayName = 'StatusBar';

// ---------------------------------------------------------------------------
// StatusBar.Section
// ---------------------------------------------------------------------------

export interface StatusBarSectionProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  children: ReactNode;
}

const StatusBarSection = forwardRef<HTMLDivElement, StatusBarSectionProps>(
  function StatusBarSection({ align = 'start', className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.Section, className)}
        data-ov-align={align}
        {...props}
      />
    );
  },
);

StatusBarSection.displayName = 'StatusBar.Section';

// ---------------------------------------------------------------------------
// StatusBar.Item
// ---------------------------------------------------------------------------

export interface StatusBarItemProps extends HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
  active?: boolean;
  children: ReactNode;
}

const StatusBarItem = forwardRef<HTMLDivElement, StatusBarItemProps>(
  function StatusBarItem({ onClick, active, className, children, ...props }, ref) {
    const isClickable = !!onClick;
    const Element = isClickable ? 'button' : 'div';

    return (
      <Element
        ref={ref as never}
        className={cn(styles.Item, className)}
        data-ov-active={active ? 'true' : undefined}
        data-ov-clickable={isClickable ? 'true' : undefined}
        onClick={onClick}
        {...(isClickable ? { type: 'button' as const } : {})}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </Element>
    );
  },
);

StatusBarItem.displayName = 'StatusBar.Item';

// ---------------------------------------------------------------------------
// StatusBar.Indicator — wraps StatusDot for status display in the bar
// ---------------------------------------------------------------------------

export interface StatusBarIndicatorProps extends Omit<StatusDotProps, 'size'> {}

const StatusBarIndicator = forwardRef<HTMLSpanElement, StatusBarIndicatorProps>(
  function StatusBarIndicator({ className, ...props }, ref) {
    return (
      <StatusDot
        ref={ref}
        size="sm"
        className={cn(styles.Indicator, className)}
        {...props}
      />
    );
  },
);

StatusBarIndicator.displayName = 'StatusBar.Indicator';

// ---------------------------------------------------------------------------
// StatusBar.Progress — wraps Progress primitive for inline bar display
// ---------------------------------------------------------------------------

export interface StatusBarProgressProps extends Omit<ProgressProps, 'size'> {
  label?: ReactNode;
}

const StatusBarProgress = forwardRef<HTMLDivElement, StatusBarProgressProps>(
  function StatusBarProgress({ label, className, ...props }, ref) {
    return (
      <div className={cn(styles.Progress, className)}>
        {label != null && <span className={styles.ProgressLabel}>{label}</span>}
        <Progress
          ref={ref}
          size="sm"
          {...props}
        />
      </div>
    );
  },
);

StatusBarProgress.displayName = 'StatusBar.Progress';

// ---------------------------------------------------------------------------
// StatusBar.IconItem
// ---------------------------------------------------------------------------

export interface StatusBarIconItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
  color?: ComponentColor;
  children: ReactNode;
}

const StatusBarIconItem = forwardRef<HTMLDivElement, StatusBarIconItemProps>(
  function StatusBarIconItem({ icon, onClick, active, color, className, children, ...props }, ref) {
    const { size } = useStatusBar();
    const isClickable = !!onClick;
    const Element = isClickable ? 'button' : 'div';

    return (
      <Element
        ref={ref as never}
        className={cn(styles.IconItem, className)}
        data-ov-active={active ? 'true' : undefined}
        data-ov-clickable={isClickable ? 'true' : undefined}
        data-ov-color={color ?? undefined}
        data-ov-size={size}
        onClick={onClick}
        {...(isClickable ? { type: 'button' as const } : {})}
        {...(props as Record<string, unknown>)}
      >
        <span className={styles.IconItemIcon} aria-hidden="true">{icon}</span>
        <span>{children}</span>
      </Element>
    );
  },
);

StatusBarIconItem.displayName = 'StatusBar.IconItem';

// ---------------------------------------------------------------------------
// StatusBar.Separator
// ---------------------------------------------------------------------------

const StatusBarSeparator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function StatusBarSeparator({ className, ...props }, ref) {
    return (
      <Separator
        ref={ref as never}
        orientation="vertical"
        decorative
        className={cn(styles.Separator, className)}
        {...(props as Record<string, unknown>)}
      />
    );
  },
);

StatusBarSeparator.displayName = 'StatusBar.Separator';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type StatusBarCompound = typeof StatusBarRoot & {
  Section: typeof StatusBarSection;
  Item: typeof StatusBarItem;
  Indicator: typeof StatusBarIndicator;
  Progress: typeof StatusBarProgress;
  IconItem: typeof StatusBarIconItem;
  Separator: typeof StatusBarSeparator;
};

export const StatusBar = Object.assign(StatusBarRoot, {
  Section: StatusBarSection,
  Item: StatusBarItem,
  Indicator: StatusBarIndicator,
  Progress: StatusBarProgress,
  IconItem: StatusBarIconItem,
  Separator: StatusBarSeparator,
}) as StatusBarCompound;
