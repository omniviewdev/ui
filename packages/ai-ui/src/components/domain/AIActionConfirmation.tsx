import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './AIActionConfirmation.module.css';

export interface AIActionConfirmationProps extends HTMLAttributes<HTMLDivElement> {
  /** Action title */
  title: string;
  /** Description of the action */
  description: string;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Confirm callback */
  onConfirm: () => void;
  /** Cancel callback */
  onCancel: () => void;
}

export const AIActionConfirmation = forwardRef<HTMLDivElement, AIActionConfirmationProps>(
  function AIActionConfirmation(
    { title, description, destructive = false, onConfirm, onCancel, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-destructive={destructive ? 'true' : undefined}
        role="alertdialog"
        aria-label={title}
        {...rest}
      >
        <div className={styles.Title}>{title}</div>
        <p className={styles.Description}>{description}</p>
        <div className={styles.Actions}>
          <button type="button" className={styles.CancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.ConfirmButton}
            data-ov-destructive={destructive ? 'true' : undefined}
            onClick={onConfirm}
          >
            {destructive ? 'Confirm' : 'Apply'}
          </button>
        </div>
      </div>
    );
  },
);
