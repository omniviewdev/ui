import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { AgentStatus } from '../../system/types';
import { AgentStatusItem } from './AgentStatusItem';
import styles from './AgentTaskList.module.css';

export interface AgentTask {
  id: string;
  label: string;
  status: AgentStatus;
  detail?: string;
}

export interface AgentTaskListProps extends HTMLAttributes<HTMLDivElement> {
  /** List of agent tasks */
  tasks: AgentTask[];
}

export const AgentTaskList = forwardRef<HTMLDivElement, AgentTaskListProps>(
  function AgentTaskList({ tasks, className, ...rest }, ref) {
    if (tasks.length === 0) return null;

    return (
      <div ref={ref} className={cn(styles.Root, className)} role="list" {...rest}>
        {tasks.map((task) => (
          <AgentStatusItem
            key={task.id}
            label={task.label}
            status={task.status}
            detail={task.detail}
            role="listitem"
          />
        ))}
      </div>
    );
  },
);
