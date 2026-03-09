import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import styles from './Toolbar.module.css';

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the toolbar – controls height. */
  size?: ComponentSize;
}

export interface ToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Show a vertical separator before this group. */
  separator?: boolean;
}

const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { className, size = 'md', role = 'toolbar', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role={role}
      className={cn(styles.Root, className)}
      data-ov-size={size}
      {...props}
    />
  );
});

ToolbarRoot.displayName = 'Toolbar';

const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(function ToolbarGroup(
  { className, separator = false, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      className={cn(styles.Group, className)}
      data-ov-separator={separator ? 'true' : undefined}
      {...props}
    >
      {separator && <span className={styles.Separator} role="separator" aria-hidden="true" />}
      {children}
    </div>
  );
});

ToolbarGroup.displayName = 'Toolbar.Group';

type ToolbarCompound = typeof ToolbarRoot & {
  Group: typeof ToolbarGroup;
};

export const Toolbar = Object.assign(ToolbarRoot, {
  Group: ToolbarGroup,
}) as ToolbarCompound;
