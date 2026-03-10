import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import type { ToolCallStatus } from '../../system/types';
import { ToolCall } from './ToolCall';
import styles from './ToolCallList.module.css';

export interface ToolCallListItem {
  id: string;
  name: string;
  arguments?: Record<string, unknown>;
  status: ToolCallStatus;
  duration?: number;
  /** Result content — can be a static ReactNode or a streaming component.
   *  Rendered inside the ToolCall's collapsible children area. */
  result?: ReactNode;
  resultStatus?: 'success' | 'error';
  /** Whether the item should be expanded (default: auto — expands when running
   *  with result content, collapses when complete) */
  expanded?: boolean;
}

export interface ToolCallListProps extends HTMLAttributes<HTMLDivElement> {
  /** List of tool calls with optional results */
  calls: ToolCallListItem[];
}

export const ToolCallList = forwardRef<HTMLDivElement, ToolCallListProps>(
  function ToolCallList({ calls, className, ...rest }, ref) {
    if (calls.length === 0) return null;

    return (
      <div ref={ref} className={cn(styles.Root, className)} role="list" {...rest}>
        {calls.map((call) => (
          <ToolCall
            key={call.id}
            name={call.name}
            arguments={call.arguments}
            status={call.status}
            duration={call.duration}
            expanded={call.expanded}
            role="listitem"
          >
            {call.result && (
              <div data-ov-status={call.resultStatus ?? 'success'}>
                {call.result}
              </div>
            )}
          </ToolCall>
        ))}
      </div>
    );
  },
);
