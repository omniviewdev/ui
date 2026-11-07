import { LuDatabase } from 'react-icons/lu';
import { cn } from '../system/classnames';
import type { MetricDetailsProps } from './types';
import styles from './Controls.module.css';

const clock = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function sampleTime(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {clock.format(date)}
    </time>
  );
}

export function MetricDetails({
  items,
  source,
  sourceIcon,
  samples,
  labels,
  label = 'Metric details',
  className,
}: MetricDetailsProps) {
  const visible = items.filter((item) => !item.advanced);
  const advanced = items.filter((item) => item.advanced);
  const labelEntries = Object.entries(labels ?? {});
  const renderItems = (rows: typeof items) => (
    <dl className={styles.details}>
      {rows.map((item) => (
        <div key={item.id}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
  return (
    <section aria-label={label} className={cn(styles.detailsRoot, className)}>
      {source != null && (
        <div className={styles.source}>
          <span className={styles.sourceIcon} aria-hidden="true">
            {sourceIcon ?? <LuDatabase />}
          </span>
          <span>{source}</span>
        </div>
      )}
      {!!samples?.length && (
        <table className={styles.timing} aria-label="Sample freshness">
          <thead>
            <tr>
              <th scope="col">Sample</th>
              <th scope="col">Updated</th>
              <th scope="col">Valid until</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((sample) => (
              <tr key={sample.id}>
                <th scope="row">
                  <span
                    className={styles.sampleStatus}
                    data-status={sample.status}
                    role="img"
                    aria-label={sample.status}
                    title={sample.status}
                  />
                  {sample.label}
                </th>
                <td>{sampleTime(sample.updatedAtMs)}</td>
                <td>{sampleTime(sample.validUntilMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {labelEntries.length > 0 && (
        <div className={styles.labels} aria-label="Metric labels">
          {labelEntries.map(([name, value]) => (
            <span key={name} title={`${name}: ${value}`}>
              <span>{name}</span>
              <code>{value}</code>
            </span>
          ))}
        </div>
      )}
      {visible.length > 0 && renderItems(visible)}
      {advanced.length > 0 && (
        <details className={styles.advanced}>
          <summary>Diagnostics</summary>
          {renderItems(advanced)}
        </details>
      )}
    </section>
  );
}
