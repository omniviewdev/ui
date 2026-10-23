import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { Card } from '../card/Card';
import { DescriptionList } from '../description-list/DescriptionList';
import { EmptyState } from '../empty-state/EmptyState';
import { cn } from '../../system/classnames';
import styles from './Visualization.module.css';

export type VisualizationStatus =
  | 'ready'
  | 'loading'
  | 'empty'
  | 'error'
  | 'unavailable'
  | 'denied';
export interface VisualizationPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  title: string;
  status: VisualizationStatus;
  description?: string;
  /** Safe, host-provided diagnostic; never derives or requests protected data. */
  detail?: string;
  actions?: ReactNode;
}
const statusTitles: Record<Exclude<VisualizationStatus, 'ready'>, string> = {
  loading: 'Loading',
  empty: 'No results',
  error: 'Unable to display results',
  unavailable: 'Visualization unavailable',
  denied: 'Access denied',
};

/** Non-ready content is not mounted; each panel fails independently. */
export function VisualizationPanel({
  title,
  status,
  description,
  detail,
  actions,
  children,
  className,
  ...props
}: VisualizationPanelProps) {
  const titleId = useId();
  return (
    <Card
      {...props}
      className={cn(styles.Panel, className)}
      role="region"
      aria-labelledby={titleId}
      aria-busy={status === 'loading'}
      data-ov-status={status}
    >
      <Card.Header>
        <Card.Title id={titleId}>{title}</Card.Title>
        {actions && <Card.Action>{actions}</Card.Action>}
      </Card.Header>
      <Card.Body>
        {status === 'ready' ? (
          <>
            {description && <Card.Description>{description}</Card.Description>}
            {children}
          </>
        ) : (
          <div role={status === 'error' || status === 'denied' ? 'alert' : 'status'}>
            <EmptyState title={statusTitles[status]} description={description} size="sm" />
          </div>
        )}
        {detail && (
          <details className={styles.Detail}>
            <summary>Details</summary>
            <p>{detail}</p>
          </details>
        )}
      </Card.Body>
    </Card>
  );
}

/** Values have already been selected/validated by the caller. Exact integers can remain strings. */
export type VisualizationDisplayValue =
  | string
  | number
  | boolean
  | null
  | readonly VisualizationDisplayValue[]
  | { readonly [key: string]: VisualizationDisplayValue };
export type VisualizationFieldValue =
  | { status: 'ready'; value: VisualizationDisplayValue }
  | { status: 'missing' | 'type-error' | 'unavailable' | 'denied'; message: string };
export interface VisualizationField {
  id: string;
  label: string;
  value: VisualizationFieldValue;
}
export interface VisualizationFieldsProps extends HTMLAttributes<HTMLDivElement> {
  fields: readonly VisualizationField[];
  presentation?: 'stat' | 'list' | 'key-value';
}

function DisplayValue({ value }: { value: VisualizationDisplayValue }) {
  if (value === null) return <span className={styles.Muted}>null</span>;
  if (typeof value === 'boolean') return <span>{value ? 'true' : 'false'}</span>;
  if (typeof value !== 'object') return <span>{value}</span>;
  if (Array.isArray(value))
    return value.length ? (
      <ul className={styles.Values}>
        {value.map((item, index) => (
          <li key={index}>
            <DisplayValue value={item} />
          </li>
        ))}
      </ul>
    ) : (
      <span className={styles.Muted}>Empty array</span>
    );
  const entries = Object.entries(value);
  return entries.length ? (
    <dl className={styles.Map}>
      {entries.map(([key, item]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>
            <DisplayValue value={item} />
          </dd>
        </div>
      ))}
    </dl>
  ) : (
    <span className={styles.Muted}>Empty map</span>
  );
}

/** Bounded presentation only: does not parse field paths, evaluate selectors or fetch resources. */
export function VisualizationFields({
  fields,
  presentation = 'key-value',
  className,
  ...props
}: VisualizationFieldsProps) {
  const content = fields.map((field) => {
    const value =
      field.value.status === 'ready' ? (
        <DisplayValue value={field.value.value} />
      ) : (
        <span
          data-ov-status={field.value.status}
          className={styles.FieldIssue}
          title={field.value.message}
        >
          {field.value.message}
        </span>
      );
    if (presentation === 'stat')
      return (
        <Card key={field.id} size="sm">
          <Card.Body>
            <Card.Eyebrow>{field.label}</Card.Eyebrow>
            <Card.Stat>{value}</Card.Stat>
          </Card.Body>
        </Card>
      );
    if (presentation === 'list')
      return (
        <li key={field.id}>
          <strong>{field.label}</strong>
          <div>{value}</div>
        </li>
      );
    return (
      <DescriptionList.Item key={field.id} label={field.label}>
        {value}
      </DescriptionList.Item>
    );
  });
  return (
    <div {...props} className={cn(styles.Fields, className)} data-ov-presentation={presentation}>
      {fields.length === 0 ? (
        <EmptyState title="No fields selected" size="sm" />
      ) : presentation === 'stat' ? (
        <Card.Group columns="auto">{content}</Card.Group>
      ) : presentation === 'list' ? (
        <ul className={styles.List}>{content}</ul>
      ) : (
        <DescriptionList>{content}</DescriptionList>
      )}
    </div>
  );
}
