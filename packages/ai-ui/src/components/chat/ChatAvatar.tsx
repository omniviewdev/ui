import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { ChatRole } from '../../system/types';
import styles from './ChatAvatar.module.css';

export interface ChatAvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Role determines default icon/color */
  role: ChatRole;
  /** Image source for the avatar */
  src?: string;
  /** Display name (used for initials fallback) */
  name?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const ROLE_ICONS: Record<ChatRole, string> = {
  user: '👤',
  assistant: '✦',
  system: '⚙',
};

export const ChatAvatar = forwardRef<HTMLDivElement, ChatAvatarProps>(
  function ChatAvatar({ role, src, name, className, ...rest }, ref) {
    const fallback = name ? getInitials(name) : ROLE_ICONS[role];

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-role={role}
        aria-label={name ?? role}
        {...rest}
      >
        {src ? (
          <img className={styles.Image} src={src} alt={name ?? role} />
        ) : (
          <span className={styles.Fallback}>{fallback}</span>
        )}
      </div>
    );
  },
);
