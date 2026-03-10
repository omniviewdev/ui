import { forwardRef, type HTMLAttributes, type ReactNode, type ComponentType } from 'react';
import { IconButton, Tooltip } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuX } from '../../system/icons';
import styles from './AIArtifact.module.css';

/* -------------------------------------------------------------------------- */
/*  AIArtifact (root)                                                         */
/* -------------------------------------------------------------------------- */

export interface AIArtifactProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the artifact panel is open (for panel mode) */
  open?: boolean;
  /** Visual mode */
  variant?: 'embedded' | 'panel';
  children: ReactNode;
}

export const AIArtifact = forwardRef<HTMLDivElement, AIArtifactProps>(
  function AIArtifact({ open, variant = 'embedded', className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-variant={variant}
        data-ov-open={open}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  AIArtifactHeader                                                          */
/* -------------------------------------------------------------------------- */

export interface AIArtifactHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AIArtifactHeader = forwardRef<HTMLDivElement, AIArtifactHeaderProps>(
  function AIArtifactHeader({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.Header, className)} {...rest}>
        {children}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  AIArtifactTitle                                                           */
/* -------------------------------------------------------------------------- */

export interface AIArtifactTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const AIArtifactTitle = forwardRef<HTMLHeadingElement, AIArtifactTitleProps>(
  function AIArtifactTitle({ className, children, ...rest }, ref) {
    return (
      <h3 ref={ref} className={cn(styles.Title, className)} {...rest}>
        {children}
      </h3>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  AIArtifactDescription                                                     */
/* -------------------------------------------------------------------------- */

export interface AIArtifactDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const AIArtifactDescription = forwardRef<HTMLParagraphElement, AIArtifactDescriptionProps>(
  function AIArtifactDescription({ className, children, ...rest }, ref) {
    return (
      <p ref={ref} className={cn(styles.Description, className)} {...rest}>
        {children}
      </p>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  AIArtifactClose                                                           */
/* -------------------------------------------------------------------------- */

export interface AIArtifactCloseProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {}

export const AIArtifactClose = forwardRef<HTMLButtonElement, AIArtifactCloseProps>(
  function AIArtifactClose({ className, ...rest }, ref) {
    return (
      <IconButton
        ref={ref}
        size="sm"
        variant="ghost"
        color="neutral"
        aria-label="Close artifact"
        className={cn(styles.Close, className)}
        {...rest}
      >
        <LuX size={16} />
      </IconButton>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  AIArtifactActions                                                         */
/* -------------------------------------------------------------------------- */

export interface AIArtifactActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AIArtifactActions = forwardRef<HTMLDivElement, AIArtifactActionsProps>(
  function AIArtifactActions({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.Actions, className)} {...rest}>
        {children}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  AIArtifactAction                                                          */
/* -------------------------------------------------------------------------- */

export interface AIArtifactActionProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Tooltip text */
  tooltip?: string;
  /** Button label (for accessibility, may be visually hidden) */
  label: string;
  /** Icon component */
  icon?: ComponentType<{ size?: number }>;
  /** Destructive action styling */
  destructive?: boolean;
}

export const AIArtifactAction = forwardRef<HTMLButtonElement, AIArtifactActionProps>(
  function AIArtifactAction({ tooltip, label, icon: Icon, destructive, className, ...rest }, ref) {
    const button = (
      <IconButton
        ref={ref}
        size="sm"
        variant="ghost"
        color={destructive ? 'danger' : 'neutral'}
        aria-label={label}
        className={cn(styles.Action, className)}
        data-destructive={destructive || undefined}
        {...rest}
      >
        {Icon ? <Icon size={14} /> : null}
      </IconButton>
    );

    if (tooltip) {
      return (
        <Tooltip.Root>
          <Tooltip.Trigger render={<span style={{ display: 'inline-flex' }} />}>
            {button}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>{tooltip}</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      );
    }

    return button;
  },
);

/* -------------------------------------------------------------------------- */
/*  AIArtifactContent                                                         */
/* -------------------------------------------------------------------------- */

export interface AIArtifactContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AIArtifactContent = forwardRef<HTMLDivElement, AIArtifactContentProps>(
  function AIArtifactContent({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.Content, className)} {...rest}>
        {children}
      </div>
    );
  },
);
