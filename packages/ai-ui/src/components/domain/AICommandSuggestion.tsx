import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './AICommandSuggestion.module.css';

export interface AICommandSuggestionProps extends HTMLAttributes<HTMLDivElement> {
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
          <code className={styles.Code}>{command}</code>
          <div className={styles.Actions}>
            {onCopy && (
              <button type="button" className={styles.Button} onClick={onCopy} aria-label="Copy command">
                ⎘
              </button>
            )}
            {onApply && (
              <button
                type="button"
                className={styles.ApplyButton}
                data-ov-destructive={destructive ? 'true' : undefined}
                onClick={onApply}
              >
                Apply
              </button>
            )}
          </div>
        </div>
        {description && <p className={styles.Description}>{description}</p>}
      </div>
    );
  },
);
