import { forwardRef, type HTMLAttributes } from 'react';
import { IconButton } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuCopy, LuRefreshCw, LuPencil, LuThumbsUp, LuThumbsDown, LuShare2, LuGitBranch, LuTrash2 } from '../../system/icons';
import styles from './AIMessageActions.module.css';

export interface AIMessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Copy message content */
  onCopy?: () => void;
  /** Regenerate response */
  onRegenerate?: () => void;
  /** Edit message */
  onEdit?: () => void;
  /** Share or forward message */
  onShare?: () => void;
  /** Branch/fork conversation from this message */
  onBranch?: () => void;
  /** Delete message */
  onDelete?: () => void;
  /** Feedback value: 'positive' | 'negative' | null */
  feedback?: 'positive' | 'negative' | null;
  /** Feedback callback */
  onFeedback?: (value: 'positive' | 'negative') => void;
}

export const AIMessageActions = forwardRef<HTMLDivElement, AIMessageActionsProps>(
  function AIMessageActions(
    { onCopy, onRegenerate, onEdit, onShare, onBranch, onDelete, feedback, onFeedback, className, ...rest },
    ref,
  ) {
    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        {onCopy && (
          <IconButton size="sm" variant="ghost" color="neutral" aria-label="Copy message" onClick={onCopy}>
            <LuCopy size={14} />
          </IconButton>
        )}
        {onRegenerate && (
          <IconButton size="sm" variant="ghost" color="neutral" aria-label="Regenerate response" onClick={onRegenerate}>
            <LuRefreshCw size={14} />
          </IconButton>
        )}
        {onEdit && (
          <IconButton size="sm" variant="ghost" color="neutral" aria-label="Edit message" onClick={onEdit}>
            <LuPencil size={14} />
          </IconButton>
        )}
        {onShare && (
          <IconButton size="sm" variant="ghost" color="neutral" aria-label="Share message" onClick={onShare}>
            <LuShare2 size={14} />
          </IconButton>
        )}
        {onBranch && (
          <IconButton size="sm" variant="ghost" color="neutral" aria-label="Branch conversation" onClick={onBranch}>
            <LuGitBranch size={14} />
          </IconButton>
        )}
        {onDelete && (
          <IconButton size="sm" variant="ghost" color="neutral" aria-label="Delete message" onClick={onDelete}>
            <LuTrash2 size={14} />
          </IconButton>
        )}
        {onFeedback && (
          <IconButton
            size="sm"
            variant="ghost"
            color={feedback === 'positive' ? 'brand' : 'neutral'}
            aria-label="Positive feedback"
            onClick={() => onFeedback('positive')}
          >
            <LuThumbsUp size={14} />
          </IconButton>
        )}
        {onFeedback && (
          <IconButton
            size="sm"
            variant="ghost"
            color={feedback === 'negative' ? 'brand' : 'neutral'}
            aria-label="Negative feedback"
            onClick={() => onFeedback('negative')}
          >
            <LuThumbsDown size={14} />
          </IconButton>
        )}
      </div>
    );
  },
);
