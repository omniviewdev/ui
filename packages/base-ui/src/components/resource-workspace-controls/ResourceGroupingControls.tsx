import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { cn } from '../../system/classnames';
import type { ResourceGroupingField, ResourceGroupingValue } from './types';
import styles from './ResourceWorkspaceControls.module.css';

export interface ResourceGroupingControlsProps {
  fields: readonly ResourceGroupingField[];
  value: ResourceGroupingValue;
  onChange: (value: ResourceGroupingValue) => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function ResourceGroupingControls({
  fields,
  value,
  onChange,
  loading,
  error,
  disabled,
  className,
}: ResourceGroupingControlsProps) {
  return (
    <fieldset className={cn(styles.Root, className)} disabled={disabled} aria-busy={loading}>
      <legend>Group and split results</legend>
      <p className={styles.Description}>
        Fields and their applicability are supplied by the host. Selection order determines grouping
        order.
      </p>
      {loading ? <p role="status">Loading fields…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {(['groupBy', 'splitBy'] as const).map((mode) => {
        const label = mode === 'groupBy' ? 'Group by' : 'Split by';
        function change(id: string, checked: boolean) {
          onChange({
            ...value,
            [mode]: checked ? [...value[mode], id] : value[mode].filter((entry) => entry !== id),
          });
        }
        return (
          <fieldset key={mode} className={styles.Panel}>
            <legend>{label}</legend>
            {fields.length === 0 && !loading ? <p>No fields available.</p> : null}
            {fields.map((field) => (
              <Checkbox
                key={field.id}
                aria-label={`${label} ${field.label}`}
                checked={value[mode].includes(field.id)}
                disabled={
                  disabled ||
                  (!(mode === 'groupBy' ? field.groupable : field.splittable) &&
                    !value[mode].includes(field.id))
                }
                description={[field.applicability, field.reason].filter(Boolean).join(' · ')}
                onCheckedChange={(checked) => change(field.id, checked)}
              >
                {field.label}
                {value[mode].includes(field.id) ? ` (${value[mode].indexOf(field.id) + 1})` : ''}
              </Checkbox>
            ))}
            {value[mode]
              .filter((id) => !fields.some((field) => field.id === id))
              .map((id) => (
                <div key={id}>
                  <p>Unavailable field: {id}</p>
                  <Button size="sm" variant="ghost" onClick={() => change(id, false)}>
                    Remove {label.toLowerCase()} {id}
                  </Button>
                </div>
              ))}
            <ol aria-label={`${label} order`} className={styles.Order}>
              {value[mode].map((id, index) => (
                <li key={id}>
                  {fields.find((field) => field.id === id)?.label ?? id}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={index === 0}
                    aria-label={`Move ${label.toLowerCase()} ${fields.find((field) => field.id === id)?.label ?? id} earlier`}
                    onClick={() => {
                      const next = [...value[mode]];
                      [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
                      onChange({ ...value, [mode]: next });
                    }}
                  >
                    Move earlier
                  </Button>
                </li>
              ))}
            </ol>
          </fieldset>
        );
      })}
    </fieldset>
  );
}
