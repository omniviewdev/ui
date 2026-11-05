import type { CSSProperties } from 'react';
import { cn } from '../system/classnames';
import { formatMetricText } from './format';
import { MetricValue } from './MetricValue';
import type { SloSummaryProps } from './types';
import styles from './Scalars.module.css';

type BudgetStyle = CSSProperties & { '--_ov-metric-fill-size': string };

export function SloSummary({
  objectiveRatio,
  observedRatio,
  windowLabel,
  budgetRemainingRatio,
  burnRates = [],
  className,
}: SloSummaryProps) {
  const objective =
    Number.isFinite(objectiveRatio) && objectiveRatio >= 0 && objectiveRatio <= 1
      ? objectiveRatio
      : null;
  const observed =
    observedRatio !== null &&
    Number.isFinite(observedRatio) &&
    observedRatio >= 0 &&
    observedRatio <= 1
      ? observedRatio
      : null;
  const budget =
    budgetRemainingRatio != null && Number.isFinite(budgetRemainingRatio)
      ? budgetRemainingRatio
      : null;
  const seen = new Set<string>();
  const budgetStyle: BudgetStyle = {
    '--_ov-metric-fill-size': `${Math.min(1, Math.max(0, budget ?? 0)) * 100}%`,
  };
  return (
    <div
      className={cn(styles.Slo, className)}
      role="group"
      aria-label={`Service level objective · ${windowLabel}`}
    >
      <div className={styles.MetricLine}>
        <span className={styles.Muted}>Budget remaining</span>
        <span className={styles.Badge}>
          Objective {formatMetricText(objective, { kind: 'ratio' })} · {windowLabel}
        </span>
      </div>
      <MetricValue value={budget} unit={{ kind: 'ratio' }} />
      {budget !== null ? (
        <div
          className={styles.Track}
          role="img"
          aria-label={`Budget remaining: ${formatMetricText(budget, { kind: 'ratio' })}`}
        >
          <span className={styles.Fill} style={budgetStyle} />
        </div>
      ) : (
        <p className={styles.Muted}>Budget unavailable</p>
      )}
      <dl className={styles.SloDetails}>
        <div>
          <dt>Observed</dt>
          <dd>{formatMetricText(observed, { kind: 'ratio' })}</dd>
        </div>
        {burnRates
          .filter((rate) => {
            if (seen.has(rate.id)) return false;
            seen.add(rate.id);
            return true;
          })
          .map((rate) => (
            <div key={rate.id}>
              <dt>{rate.label}</dt>
              <dd>
                {rate.value !== null && Number.isFinite(rate.value) && rate.value >= 0 ? (
                  <>
                    {formatMetricText(rate.value, { kind: 'number' })}
                    <span className={styles.Unit}>×</span>
                  </>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          ))}
      </dl>
    </div>
  );
}
