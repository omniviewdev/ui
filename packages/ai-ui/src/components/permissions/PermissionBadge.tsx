import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './PermissionBadge.module.css';

export type PermissionLevel = 'granted' | 'denied' | 'ask';

export interface PermissionBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Permission level */
  level: PermissionLevel;
  /** Optional label override */
  label?: string;
}

const LEVEL_LABELS: Record<PermissionLevel, string> = {
  granted: 'Allowed',
  denied: 'Denied',
  ask: 'Ask',
};

export const PermissionBadge = forwardRef<HTMLSpanElement, PermissionBadgeProps>(
  function PermissionBadge({ level, label, className, ...rest }, ref) {
    return (
      <span
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-level={level}
        {...rest}
      >
        {label ?? LEVEL_LABELS[level]}
      </span>
    );
  },
);
