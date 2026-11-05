import { useId, type CSSProperties } from 'react';
import { Card } from '../components/card';
import { cn } from '../system/classnames';
import { seriesColor, toneColor } from './format';
import type { MetricPanelProps } from './types';
import styles from './Scalars.module.css';

type NoticeStyle = CSSProperties & { '--_ov-metric-color'?: string };

const messages = {
  initial: 'Loading samples…',
  empty: 'No samples',
  denied: 'Access denied',
  unsupported: 'Not supported',
};

export function MetricPanel({
  title,
  state = { kind: 'data' },
  actions,
  footer,
  details,
  children,
  className,
  style,
  'aria-label': label,
}: MetricPanelProps) {
  const titleId = useId();
  const data = state.kind === 'data';
  const noticeStyle: NoticeStyle = {
    '--_ov-metric-color': data && state.notice ? toneColor(state.notice.tone) : undefined,
  };
  const detailStyle: NoticeStyle = {
    '--_ov-metric-color': seriesColor('details', details?.color ?? 'series-1'),
  };
  return (
    <Card
      className={cn(styles.Panel, className)}
      style={style}
      aria-label={label}
      aria-labelledby={label ? undefined : titleId}
      data-state={state.kind}
      aria-busy={state.kind === 'initial' || (data && state.updating) || undefined}
    >
      <Card.Header className={styles.PanelHeader}>
        <Card.Title id={titleId}>{title}</Card.Title>
        {actions && <Card.Action>{actions}</Card.Action>}
      </Card.Header>
      <Card.Body className={styles.PanelBody}>
        <div className={styles.PanelStatus} aria-live="polite">
          {data ? (
            <>
              {state.updating && <span className={styles.Updating}>Updating…</span>}
              {state.freshness === 'delayed' && <span>Delayed data</span>}
              {state.freshness === 'unknown' && <span>Freshness unknown</span>}
              {state.completeness === 'partial' && <span>Partial data</span>}
              {state.completeness === 'unknown' && <span>Completeness unknown</span>}
              {state.notice && (
                <span className={styles.Colored} style={noticeStyle}>
                  {state.notice.label}
                  {state.notice.detail && <> · {state.notice.detail}</>}
                </span>
              )}
            </>
          ) : (
            <span role={state.kind === 'error' ? 'alert' : undefined}>
              {state.message ||
                (state.kind !== 'error' ? messages[state.kind] : 'Unable to load samples')}
            </span>
          )}
        </div>
        <div className={styles.PanelContent}>{data ? children : null}</div>
      </Card.Body>
      {data && (details || footer) && (
        <Card.Footer className={styles.PanelFooter}>
          {details && (
            <details
              className={styles.PanelDetails}
              open={details.open}
              onToggle={(event) => {
                if (event.currentTarget.open !== details.open) {
                  details.onOpenChange?.(event.currentTarget.open);
                }
              }}
            >
              <summary
                onClick={(event) => {
                  if (details.open !== undefined) {
                    event.preventDefault();
                    details.onOpenChange?.(!details.open);
                  }
                }}
              >
                <span className={styles.DetailsSwatch} style={detailStyle} aria-hidden="true" />
                {details.label ?? 'Details'}
              </summary>
              {details.content}
            </details>
          )}
          {footer}
        </Card.Footer>
      )}
    </Card>
  );
}
