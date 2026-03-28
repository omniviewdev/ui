import { forwardRef, type HTMLAttributes } from 'react';
import { List } from '@omniviewdev/base-ui';
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

export interface AgentTaskListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** List of agent tasks */
  tasks: AgentTask[];
}

export const AgentTaskList = forwardRef<HTMLDivElement, AgentTaskListProps>(
  function AgentTaskList({ tasks, className, ...rest }, ref) {
    if (tasks.length === 0) return null;

    return (
      <List
        ref={ref}
        className={cn(styles.Root, className)}
        selectionMode="none"
        density="compact"
        {...rest}
      >
        {tasks.map((task) => (
          <List.Item key={task.id} itemKey={task.id} textValue={task.label}>
            <AgentStatusItem
              label={task.label}
              status={task.status}
              detail={task.detail}
            />
          </List.Item>
        ))}
      </List>
    );
  },
);
