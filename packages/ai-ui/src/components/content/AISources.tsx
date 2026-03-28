import { forwardRef, type HTMLAttributes } from 'react';
import { List } from '@omniviewdev/base-ui';
import { cn } from '../../system/classnames';
import styles from './AISources.module.css';

export interface AISource {
  id: string;
  label: string;
  url?: string;
  detail?: string;
}

export interface AISourcesProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** List of sources */
  sources: AISource[];
  /** Called when a source is clicked */
  onNavigate?: (source: AISource) => void;
}

export const AISources = forwardRef<HTMLDivElement, AISourcesProps>(
  function AISources({ sources, onNavigate, className, ...rest }, ref) {
    if (sources.length === 0) return null;

    return (
      <div ref={ref} className={cn(styles.Root, className)} data-ov-ai-sources {...rest}>
        <div className={styles.Title}>Sources</div>
        <List selectionMode="none" density="compact" size="sm">
          {sources.map((source, i) => (
            <List.Item key={source.id} itemKey={source.id} onClick={() => onNavigate?.(source)}>
              <List.ItemIcon>{i + 1}</List.ItemIcon>
              <List.ItemLabel>{source.label}</List.ItemLabel>
              {source.detail && <List.ItemDescription>{source.detail}</List.ItemDescription>}
            </List.Item>
          ))}
        </List>
      </div>
    );
  },
);
