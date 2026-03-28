import { forwardRef, type HTMLAttributes } from 'react';
import { Button, IconButton } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { LuCopy, LuCornerDownRight } from '../../system/icons';
import styles from './AICommandSuggestion.module.css';

export interface AICommandSuggestionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** The command to suggest */
  command: string;
  /** Description of what the command does */
  description?: string;
  /** Whether the command is destructive */
  destructive?: boolean;
  /** Apply/execute callback */
  onApply?: () => void;
  /** Copy callback */
  onCopy?: () => void;
}

export const AICommandSuggestion = forwardRef<HTMLDivElement, AICommandSuggestionProps>(
  function AICommandSuggestion(
    { command, description, destructive = false, onApply, onCopy, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-destructive={destructive ? 'true' : undefined}
        {...rest}
      >
        <div className={styles.Command}>
          <LuCornerDownRight size={14} className={styles.CommandIcon} />
          <code className={styles.Code}>{command}</code>
          {onCopy && (
            <IconButton size="sm" variant="ghost" color="neutral" aria-label="Copy command" onClick={onCopy}>
              <LuCopy size={14} />
            </IconButton>
          )}
        </div>
        {description && <p className={styles.Description}>{description}</p>}
        {onApply && (
          <div className={styles.Actions}>
            <Button
              size="sm"
              variant="soft"
              color={destructive ? 'danger' : 'brand'}
              onClick={onApply}
            >
              {destructive ? 'Run' : 'Apply'}
            </Button>
          </div>
        )}
      </div>
    );
  },
);
