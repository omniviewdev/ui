import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import type { ChatRole } from '../../system/types';
import styles from './ChatBubble.module.css';

export interface ChatBubbleProps extends HTMLAttributes<HTMLDivElement> {
  /** Message role determines alignment and styling */
  role: ChatRole;
  /** Avatar node rendered beside the bubble */
  avatar?: ReactNode;
  /** Timestamp of the message */
  timestamp?: Date;
  /** Action buttons (copy, retry, edit) shown on hover */
  actions?: ReactNode;
}

export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  function ChatBubble(
    { role, avatar, timestamp, actions, children, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-role={role}
        {...rest}
      >
        {avatar && <div className={styles.Avatar}>{avatar}</div>}
        <div className={styles.Content}>
          <div className={styles.Bubble}>{children}</div>
          <div className={styles.Meta}>
            {timestamp && (
              <time className={styles.Timestamp} dateTime={timestamp.toISOString()}>
                {timestamp.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            )}
            {actions && <div className={styles.Actions}>{actions}</div>}
          </div>
        </div>
      </div>
    );
  },
);
