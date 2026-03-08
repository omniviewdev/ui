import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './AISources.module.css';

export interface AISource {
  id: string;
  label: string;
  url?: string;
  detail?: string;
}

export interface AISourcesProps extends HTMLAttributes<HTMLDivElement> {
  /** List of sources */
  sources: AISource[];
  /** Called when a source is clicked */
  onNavigate?: (source: AISource) => void;
}

export const AISources = forwardRef<HTMLDivElement, AISourcesProps>(
  function AISources({ sources, onNavigate, className, ...rest }, ref) {
    if (sources.length === 0) return null;

    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        <div className={styles.Title}>Sources</div>
        <div className={styles.List} role="list">
          {sources.map((source, i) => (
            <button
              key={source.id}
              type="button"
              className={styles.Item}
              role="listitem"
              onClick={() => onNavigate?.(source)}
            >
              <span className={styles.Index}>{i + 1}</span>
              <span className={styles.Label}>{source.label}</span>
              {source.detail && <span className={styles.Detail}>{source.detail}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  },
);
