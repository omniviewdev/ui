import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { IconButton } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuPlus, LuSettings } from '../../system/icons';
import styles from './AIConversationHeader.module.css';

export interface AIConversationHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Conversation title */
  title: string;
  /** Model name or info */
  model?: string;
  /** New chat callback */
  onNewChat?: () => void;
  /** Settings callback */
  onSettings?: () => void;
  /** Additional actions slot */
  actions?: ReactNode;
}

export const AIConversationHeader = forwardRef<HTMLDivElement, AIConversationHeaderProps>(
  function AIConversationHeader(
    { title, model, onNewChat, onSettings, actions, className, ...rest },
    ref,
  ) {
    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        <span className={styles.Title}>{title}</span>
        {model && <span className={styles.Model}>{model}</span>}
        <div className={styles.Actions}>
          {actions}
          {onNewChat && (
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="New chat" onClick={onNewChat}>
              <LuPlus size={16} />
            </IconButton>
          )}
          {onSettings && (
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="Settings" onClick={onSettings}>
              <LuSettings size={16} />
            </IconButton>
          )}
        </div>
      </div>
    );
  },
);
