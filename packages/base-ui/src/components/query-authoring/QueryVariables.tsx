import { Button } from '../button';
import { QueryValueInput } from './QueryValueInput';
import type { QueryAvailability, QueryValue, QueryVariable } from './types';
import styles from './QueryAuthoring.module.css';

export interface QueryVariablesProps {
  variables: readonly QueryVariable[];
  value: Readonly<Record<string, QueryValue | undefined>>;
  onChange: (value: Readonly<Record<string, QueryValue | undefined>>) => void;
  /** Include dependency/scope/permission revisions to cancel outdated value lookups. */
  contextKey?: string;
  availability?: QueryAvailability;
  disabled?: boolean;
  diagnostics?: readonly string[];
}

/** Editing drafts only: the host owns defaults, constraints, dependency cycles and binding.
 * Values never interpolate into query text and sensitive values are never serialized here. */
export function QueryVariables({
  variables,
  value,
  onChange,
  contextKey = '',
  availability,
  disabled = false,
  diagnostics,
}: QueryVariablesProps) {
  const blocked = disabled || Boolean(availability && availability.status !== 'ready');
  return (
    <fieldset className={styles.Variables} disabled={blocked} aria-label="Query variables">
      <legend>Variables</legend>
      {availability && availability.status !== 'ready' ? (
        <div role="status" data-status={availability.status}>
          {availability.message ?? `Variables ${availability.status}.`}
        </div>
      ) : null}
      {!variables.length ? <p className={styles.Muted}>This query has no variables.</p> : null}
      {variables.map((variable) => {
        const current = Object.prototype.hasOwnProperty.call(value, variable.id)
          ? value[variable.id]
          : undefined;
        return (
          <div key={variable.id} className={styles.Variable}>
            <QueryValueInput
              label={variable.label}
              definition={variable.definition}
              value={current ?? variable.defaultValue}
              contextKey={`${contextKey}:${variable.id}`}
              sensitive={variable.sensitive}
              required={variable.required}
              error={variable.error}
              disabled={blocked || Boolean(variable.disabledReason)}
              onChange={(next) => {
                const updated = { ...value, [variable.id]: next };
                if (next === undefined) delete updated[variable.id];
                onChange(updated);
              }}
            />
            {variable.description ? <p className={styles.Muted}>{variable.description}</p> : null}
            {variable.disabledReason ? <div role="status">{variable.disabledReason}</div> : null}
            {variable.defaultValue ? (
              <div className={styles.Row}>
                <span className={styles.Muted}>
                  {current === undefined
                    ? 'Showing the declared default; the host applies binding policy.'
                    : 'A default is available.'}
                </span>
                <Button
                  size="xs"
                  disabled={blocked || Boolean(variable.disabledReason)}
                  aria-label={`Reset ${variable.label} to default`}
                  onClick={() => onChange({ ...value, [variable.id]: variable.defaultValue })}
                >
                  Reset to default
                </Button>
              </div>
            ) : null}
            {current !== undefined && !variable.required ? (
              <Button
                size="xs"
                disabled={blocked || Boolean(variable.disabledReason)}
                aria-label={`Unset ${variable.label}`}
                onClick={() => {
                  const updated = { ...value };
                  delete updated[variable.id];
                  onChange(updated);
                }}
              >
                Unset
              </Button>
            ) : null}
          </div>
        );
      })}
      {diagnostics?.map((message, index) => (
        <div key={index} role="alert">
          {message}
        </div>
      ))}
    </fieldset>
  );
}
