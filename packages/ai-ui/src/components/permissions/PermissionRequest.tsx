import { forwardRef, useState, type HTMLAttributes } from 'react';
import { Button, Card } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { LuLock } from '../../system/icons';
import styles from './PermissionRequest.module.css';

export interface PermissionRequestProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Tool requesting permission */
  tool: string;
  /** Human-readable description of the action */
  description: string;
  /** Permission scope (e.g. "workspace", "file:/path") */
  scope: string;
  /** Raw content to review — shell command, file path, script, etc. */
  content?: string;
  /** Allow this specific action */
  onAllow: () => void;
  /** Deny this action */
  onDeny: () => void;
  /** Allow permanently for this tool */
  onAllowAlways?: () => void;
}

/** Max lines to show before collapsing with "Show more" */
const COLLAPSE_THRESHOLD = 6;

export const PermissionRequest = forwardRef<HTMLDivElement, PermissionRequestProps>(
  function PermissionRequest(
    { tool, description, scope, content, onAllow, onDeny, onAllowAlways, className, ...rest },
    ref,
  ) {
    const [expanded, setExpanded] = useState(false);
    const lineCount = content ? content.split('\n').length : 0;
    const isCollapsible = lineCount > COLLAPSE_THRESHOLD;

    return (
      <Card
        ref={ref as React.Ref<HTMLElement>}
        as="div"
        size="sm"
        className={cn(styles.Root, className)}
        role="alertdialog"
        aria-label={`Permission request for ${tool}`}
        {...rest}
      >
        <Card.Row align="start" gap="sm">
          <div className={styles.IconBadge} aria-hidden="true">
            <LuLock size={12} />
          </div>
          <div className={styles.Content}>
            <div className={styles.Header}>
              <span className={styles.Label}>Permission requested</span>
            </div>
            <code className={styles.Tool}>{tool}</code>
            <p className={styles.Description}>{description}</p>
            {content && (
              <div className={styles.CodeBlock}>
                <pre
                  className={cn(
                    styles.Code,
                    isCollapsible && !expanded && styles.CodeCollapsed,
                  )}
                >
                  {content}
                </pre>
                {isCollapsible && (
                  <button
                    type="button"
                    className={styles.ShowMore}
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? 'Show less' : `Show all ${lineCount} lines`}
                  </button>
                )}
              </div>
            )}
            <div className={styles.Scope}>
              <span className={styles.ScopeLabel}>Scope</span>
              <code className={styles.ScopeValue}>{scope}</code>
            </div>
          </div>
        </Card.Row>
        <Card.Footer>
          <Button size="sm" variant="soft" color="danger" onClick={onDeny}>
            Deny
          </Button>
          <div className={styles.AllowGroup}>
            <Button size="sm" variant="solid" color="neutral" onClick={onAllow}>
              Allow
            </Button>
            {onAllowAlways && (
              <Button size="sm" variant="ghost" color="neutral" onClick={onAllowAlways}>
                Always Allow
              </Button>
            )}
          </div>
        </Card.Footer>
      </Card>
    );
  },
);
