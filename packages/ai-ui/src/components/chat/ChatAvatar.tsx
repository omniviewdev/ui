import { forwardRef, type HTMLAttributes } from 'react';
import { Avatar } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { CHAT_ROLE_ICONS } from '../../system/icons';
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

const ROLE_COLORS: Record<ChatRole, 'brand' | 'neutral' | 'info'> = {
  user: 'brand',
  assistant: 'info',
  system: 'neutral',
};

export const ChatAvatar = forwardRef<HTMLDivElement, ChatAvatarProps>(
  function ChatAvatar({ role, src, name, className, ...rest }, ref) {
    const RoleIcon = CHAT_ROLE_ICONS[role];

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-role={role}
        aria-label={name ?? role}
        {...rest}
      >
        <Avatar
          src={src}
          name={name}
          alt={name ?? role}
          fallbackIcon={!name ? <RoleIcon size={16} /> : undefined}
          size="sm"
          color={ROLE_COLORS[role]}
          shape="circle"
          deterministic
        />
      </div>
    );
  },
);
