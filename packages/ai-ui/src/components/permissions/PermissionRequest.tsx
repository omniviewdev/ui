import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './PermissionRequest.module.css';

export interface PermissionRequestProps extends HTMLAttributes<HTMLDivElement> {
  /** Tool requesting permission */
  tool: string;
  /** Human-readable description of the action */
  description: string;
  /** Permission scope (e.g. "workspace", "file:/path") */
  scope: string;
  /** Allow this specific action */
  onAllow: () => void;
  /** Deny this action */
  onDeny: () => void;
  /** Allow permanently for this tool */
  onAllowAlways?: () => void;
}

export const PermissionRequest = forwardRef<HTMLDivElement, PermissionRequestProps>(
  function PermissionRequest(
    { tool, description, scope, onAllow, onDeny, onAllowAlways, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        role="alertdialog"
        aria-label={`Permission request for ${tool}`}
        {...rest}
      >
        <div className={styles.Header}>
          <span className={styles.Icon} aria-hidden="true">🔒</span>
          <span className={styles.Tool}>{tool}</span>
        </div>
        <p className={styles.Description}>{description}</p>
        <div className={styles.Scope}>
          <span className={styles.ScopeLabel}>Scope:</span>
          <code className={styles.ScopeValue}>{scope}</code>
        </div>
        <div className={styles.Actions}>
          <button type="button" className={styles.Button} data-ov-action="deny" onClick={onDeny}>
            Deny
          </button>
          <button type="button" className={styles.Button} data-ov-action="allow" onClick={onAllow}>
            Allow
          </button>
          {onAllowAlways && (
            <button type="button" className={styles.Button} data-ov-action="allow-always" onClick={onAllowAlways}>
              Always Allow
            </button>
          )}
        </div>
      </div>
    );
  },
);
