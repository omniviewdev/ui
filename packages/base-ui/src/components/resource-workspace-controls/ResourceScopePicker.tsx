import { useId } from 'react';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { cn } from '../../system/classnames';
import type { ResourceScopeSelection, ResourceScopeTarget } from './types';
import styles from './ResourceWorkspaceControls.module.css';

export interface ResourceScopePickerProps {
  targets: readonly ResourceScopeTarget[];
  value: readonly ResourceScopeSelection[];
  onChange: (value: readonly ResourceScopeSelection[]) => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function ResourceScopePicker({
  targets,
  value,
  onChange,
  loading,
  error,
  disabled,
  className,
}: ResourceScopePickerProps) {
  const id = useId();
  function updateDimension(
    selection: ResourceScopeSelection,
    dimension: string,
    next: readonly string[] | 'any',
  ) {
    onChange(
      value.map((entry) =>
        entry.targetId === selection.targetId
          ? { ...entry, dimensions: { ...entry.dimensions, [dimension]: next } }
          : entry,
      ),
    );
  }
  const missing = value.filter((entry) => !targets.some((target) => target.id === entry.targetId));
  return (
    <fieldset className={cn(styles.Root, className)} disabled={disabled} aria-busy={loading}>
      <legend>Query sources</legend>
      <p className={styles.Description}>
        Choose explicit provider, connection and resource types. No connection is selected
        automatically.
      </p>
      <p role="status">
        {loading
          ? 'Loading source catalog…'
          : value.length
            ? `${value.length} source${value.length === 1 ? '' : 's'} selected`
            : 'No sources selected. Select a resource type to begin.'}
      </p>
      {error ? <p role="alert">{error}</p> : null}
      {targets.length === 0 && !loading ? <p>No sources available.</p> : null}
      {targets.map((target, index) => {
        const selected = value.find((entry) => entry.targetId === target.id);
        const blocked =
          target.status === 'denied' ||
          target.status === 'offline' ||
          target.status === 'unsupported' ||
          target.status === 'loading';
        const reasonId = `${id}-${index}-reason`;
        return (
          <fieldset key={target.id} className={styles.Panel}>
            <legend>
              {target.provider} / {target.connection}
            </legend>
            <Checkbox
              checked={Boolean(selected)}
              disabled={disabled || (blocked && !selected)}
              aria-label={`${target.resourceType} — ${target.connection}`}
              aria-describedby={reasonId}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...value, { targetId: target.id, dimensions: {} }]
                    : value.filter((entry) => entry.targetId !== target.id),
                )
              }
            >
              {target.resourceType}
            </Checkbox>
            <p id={reasonId} className={styles.Description}>
              {target.description ? `${target.description} · ` : ''}
              {target.status ?? 'ready'}
              {target.reason ? (
                <>
                  : <span className={styles.Reason}>{target.reason}</span>
                </>
              ) : null}
            </p>
            {selected
              ? target.dimensions?.map((dimension) => {
                  const current = Object.hasOwn(selected.dimensions, dimension.id)
                    ? selected.dimensions[dimension.id]
                    : undefined;
                  return (
                    <fieldset key={dimension.id} className={styles.Dimension} disabled={blocked}>
                      <legend>{dimension.label}</legend>
                      {current === undefined ? (
                        <p className={styles.Description}>
                          No selection; the host must resolve this scope.
                        </p>
                      ) : null}
                      {dimension.allowAny ? (
                        <Checkbox
                          checked={current === 'any'}
                          disabled={disabled || blocked}
                          onCheckedChange={(checked) =>
                            updateDimension(selected, dimension.id, checked ? 'any' : [])
                          }
                        >
                          Any permitted {dimension.label}
                        </Checkbox>
                      ) : null}
                      {dimension.values.map((option) => (
                        <Checkbox
                          key={option.id}
                          checked={current !== 'any' && Boolean(current?.includes(option.id))}
                          disabled={
                            disabled ||
                            blocked ||
                            (Boolean(option.disabledReason) &&
                              !(current !== 'any' && current?.includes(option.id)))
                          }
                          description={option.disabledReason}
                          onCheckedChange={(checked) =>
                            updateDimension(
                              selected,
                              dimension.id,
                              checked
                                ? [...(current === 'any' ? [] : (current ?? [])), option.id]
                                : (current === 'any' ? [] : (current ?? [])).filter(
                                    (entry) => entry !== option.id,
                                  ),
                            )
                          }
                        >
                          {option.label}
                        </Checkbox>
                      ))}
                      {Array.isArray(current) && current.length === 0 ? (
                        <p className={styles.Description}>
                          No values selected; this never means all values.
                        </p>
                      ) : null}
                      {Array.isArray(current)
                        ? current
                            .filter(
                              (entry) => !dimension.values.some((option) => option.id === entry),
                            )
                            .map((entry) => (
                              <p key={entry}>
                                Unavailable value: {entry}{' '}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    updateDimension(
                                      selected,
                                      dimension.id,
                                      current.filter((item) => item !== entry),
                                    )
                                  }
                                >
                                  Remove {entry}
                                </Button>
                              </p>
                            ))
                        : null}
                    </fieldset>
                  );
                })
              : null}
            {selected
              ? Object.keys(selected.dimensions)
                  .filter((key) => !target.dimensions?.some((dimension) => dimension.id === key))
                  .map((key) => (
                    <div key={key}>
                      <p>Unavailable scope dimension: {key}. Selection is preserved.</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          const dimensions = { ...selected.dimensions };
                          delete dimensions[key];
                          onChange(
                            value.map((entry) =>
                              entry.targetId === selected.targetId
                                ? { ...entry, dimensions }
                                : entry,
                            ),
                          );
                        }}
                      >
                        Remove scope dimension {key}
                      </Button>
                    </div>
                  ))
              : null}
          </fieldset>
        );
      })}
      {missing.map((entry) => (
        <div key={entry.targetId} className={styles.Panel}>
          <p>Unavailable source: {entry.targetId}</p>
          <Button
            size="sm"
            onClick={() => onChange(value.filter((item) => item.targetId !== entry.targetId))}
          >
            Remove unavailable source {entry.targetId}
          </Button>
        </div>
      ))}
    </fieldset>
  );
}
