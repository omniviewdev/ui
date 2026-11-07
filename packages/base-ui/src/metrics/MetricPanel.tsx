import { createContext, useId, type CSSProperties } from 'react';
import { Card } from '../components/card';
import { Skeleton } from '../components/skeleton';
import { cn } from '../system/classnames';
import { seriesColor, toneColor } from './format';
import type { MetricPanelProps } from './types';
import styles from './Scalars.module.css';
import loadingStyles from './MetricPanel.module.css';

export const MetricPanelLoadingContext = createContext<boolean | undefined>(undefined);

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
  value,
  loadingChart = false,
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
      className={cn(styles.Panel, loadingStyles.Panel, className)}
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
        <div
          className={cn(styles.PanelStatus, loadingStyles.Status)}
          role={state.kind === 'error' ? 'alert' : 'status'}
        >
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
            <span>
              {state.message ||
                (state.kind !== 'error' ? messages[state.kind] : 'Unable to load samples')}
            </span>
          )}
        </div>
        <MetricPanelLoadingContext.Provider
          value={state.kind === 'initial' || (data && !!state.updating)}
        >
          <div className={cn(styles.PanelContent, loadingStyles.Content)}>
            {(data || state.kind === 'initial') && (
              <>
                {value != null && (
                  <div className={cn(styles.PanelValue, loadingStyles.Value)}>
                    <div
                      aria-hidden={state.kind === 'initial' || undefined}
                      className={loadingStyles.ValueContent}
                    >
                      {value}
                    </div>
                    {state.kind === 'initial' && (
                      <Skeleton
                        variant="rounded"
                        width="8ch"
                        height="2.5em"
                        aria-hidden="true"
                        className={loadingStyles.ValueSkeleton}
                      />
                    )}
                  </div>
                )}
                {children}
                {!children && loadingChart && (
                  <Skeleton variant="rounded" height={180} aria-hidden="true" />
                )}
              </>
            )}
          </div>
        </MetricPanelLoadingContext.Provider>
      </Card.Body>
      {(data || state.kind === 'initial') && (details || footer) && (
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
