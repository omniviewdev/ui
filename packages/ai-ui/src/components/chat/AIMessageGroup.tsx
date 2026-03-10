import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import type { ChatRole } from '../../system/types';
import styles from './AIMessageGroup.module.css';

export interface AIMessageGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Chat role for the group */
  role: ChatRole;
  /** Avatar to show once for the group */
  avatar?: ReactNode;
  children: ReactNode;
}

export const AIMessageGroup = forwardRef<HTMLDivElement, AIMessageGroupProps>(
  function AIMessageGroup({ role, avatar, children, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-role={role}
        {...rest}
      >
        {avatar && <div className={styles.Avatar}>{avatar}</div>}
        <div className={styles.Messages}>{children}</div>
      </div>
    );
  },
);
