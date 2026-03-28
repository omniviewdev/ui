import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Chip } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import { LuFile, LuWrench, LuDatabase } from '../../system/icons';
import styles from './AIContextIndicator.module.css';

export interface ContextItem {
  type: 'file' | 'tool' | 'database' | 'custom';
  label: string;
  icon?: ReactNode;
}

export interface AIContextIndicatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Context items available */
  items: ContextItem[];
  /** Max items to show before "+N more" (default: 3) */
  maxVisible?: number;
}

const DEFAULT_ICONS: Record<string, ReactNode> = {
  file: <LuFile size={12} />,
  tool: <LuWrench size={12} />,
  database: <LuDatabase size={12} />,
};

export const AIContextIndicator = forwardRef<HTMLDivElement, AIContextIndicatorProps>(
  function AIContextIndicator({ items, maxVisible = 3, className, ...rest }, ref) {
    if (items.length === 0) return null;

    const visible = items.slice(0, maxVisible);
    const overflowCount = items.length - maxVisible;

    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        {visible.map((item) => (
          <Chip
            key={item.label}
            size="sm"
            variant="soft"
            color="neutral"
            startDecorator={item.type === 'custom' ? item.icon : DEFAULT_ICONS[item.type]}
          >
            {item.label}
          </Chip>
        ))}
        {overflowCount > 0 && (
          <Chip size="sm" variant="soft" color="neutral">
            +{overflowCount} more
          </Chip>
        )}
      </div>
    );
  },
);
