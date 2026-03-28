import { forwardRef, useEffect, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Collapsible, CollapsibleContent, Spinner } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { TOOL_STATUS_ICONS, LuChevronDown } from '../../system/icons';
import type { ToolCallStatus } from '../../system/types';
import styles from './ToolCall.module.css';

export interface ToolCallProps extends HTMLAttributes<HTMLDivElement> {
  /** Tool function name */
  name: string;
  /** Tool arguments (shown in collapsible detail section) */
  arguments?: Record<string, unknown>;
  /** Current execution status */
  status: ToolCallStatus;
  /** Execution duration in ms */
  duration?: number;
  /** Whether the detail section (args + children) starts expanded.
   *  Defaults to false. Automatically opens when status transitions to
   *  'running' if there are children to show. */
  defaultExpanded?: boolean;
  /** Controlled expanded state (overrides internal state) */
  expanded?: boolean;
  /** Result content rendered below the arguments. Use this for tool output —
   *  can be a static ReactNode or a streaming component like
   *  `<StreamingText stream={...} />`. Content is visible when expanded. */
  children?: ReactNode;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export const ToolCall = forwardRef<HTMLDivElement, ToolCallProps>(
  function ToolCall(
    {
      name,
      arguments: args,
      status,
      duration,
      defaultExpanded = false,
      expanded: expandedProp,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const expanded = expandedProp ?? internalExpanded;

    // Auto-expand when status transitions to 'running' and there are children
    // (streaming tool output should be visible immediately)
    const [prevStatus, setPrevStatus] = useState(status);
    useEffect(() => {
      if (status !== prevStatus) {
        if (status === 'running' && children != null && expandedProp === undefined) {
          setInternalExpanded(true);
        }
        setPrevStatus(status);
      }
    }, [status, prevStatus, children, expandedProp]);

    const hasDetail = args != null || children != null;
    const toggleExpanded = () => {
      if (expandedProp === undefined && hasDetail) {
        setInternalExpanded((v) => !v);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-ov-status={status}
        {...rest}
      >
        <button
          type="button"
          className={styles.Header}
          onClick={toggleExpanded}
          aria-expanded={hasDetail ? expanded : undefined}
          disabled={!hasDetail}
        >
          <span className={styles.StatusIcon} data-ov-status={status}>
            {status === 'running' ? (
              <Spinner size="sm" />
            ) : (
              (() => { const Icon = TOOL_STATUS_ICONS[status]; return <Icon size={14} />; })()
            )}
          </span>
          <span className={styles.Name}>{name}</span>
          {duration != null && (
            <span className={styles.Duration}>{formatDuration(duration)}</span>
          )}
          {hasDetail && (
            <span
              className={styles.Chevron}
              data-ov-open={expanded ? 'true' : 'false'}
              aria-hidden="true"
            >
              <LuChevronDown size={14} />
            </span>
          )}
        </button>

        <Collapsible open={expanded}>
          <CollapsibleContent>
            {args && (
              <pre className={styles.Arguments}>
                <code>{JSON.stringify(args, null, 2)}</code>
              </pre>
            )}
            {children && (
              <div className={styles.ResultContent}>
                {children}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
);
