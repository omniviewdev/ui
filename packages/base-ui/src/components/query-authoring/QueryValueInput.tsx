import { useEffect, useId, useRef, useState } from 'react';
import { Input } from '../input';
import { Button } from '../button';
import type { QueryOptionResponse, QueryValue, QueryValueDefinition } from './types';
import styles from './QueryAuthoring.module.css';

export interface QueryValueInputProps {
  definition: QueryValueDefinition;
  value?: QueryValue;
  onChange: (value: QueryValue | undefined) => void;
  contextKey?: string;
  label?: string;
  disabled?: boolean;
  sensitive?: boolean;
  required?: boolean;
  error?: string;
}

/** Renders host-declared types. Numeric drafts never pass through Number/parseInt. */
export function QueryValueInput({
  definition,
  value,
  onChange,
  contextKey = '',
  label = 'Value',
  disabled = false,
  sensitive = false,
  required = false,
  error,
}: QueryValueInputProps) {
  const id = useId();
  const [search, setSearch] = useState('');
  const [response, setResponse] = useState<QueryOptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState('');
  const sequence = useRef(0);
  const load = definition.loadOptions;
  useEffect(() => {
    const generation = ++sequence.current;
    const abort = new AbortController();
    setResponse(null);
    if (!load || disabled) {
      setLoading(false);
      return () => abort.abort();
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await load({ contextKey, search, signal: abort.signal });
        if (!abort.signal.aborted && generation === sequence.current) {
          setResponse(
            result.contextKey === contextKey
              ? result
              : {
                  contextKey,
                  status: 'unavailable',
                  options: [],
                  message: 'Value context changed. Change the search to retry.',
                },
          );
        }
      } catch (reason) {
        if (!abort.signal.aborted && generation === sequence.current)
          setResponse({
            contextKey,
            status: 'error',
            options: [],
            message: reason instanceof Error ? reason.message : 'Values could not be loaded.',
          });
      } finally {
        if (!abort.signal.aborted && generation === sequence.current) setLoading(false);
      }
    }, 120);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [contextKey, search, load, disabled]);
  const options =
    response?.contextKey === contextKey ? response.options : load ? [] : (definition.options ?? []);
  const text = typeof value?.value === 'string' ? value.value : '';
  const description = `${id}-description`;
  const remoteUnavailable = Boolean(load && (loading || !response || response.status !== 'ready'));
  const list = value?.kind === 'list' ? value.value : [];
  const enumOption =
    value?.kind === 'enum' ? options.find((option) => option.value === value.value) : undefined;
  const enumSelection =
    value?.kind === 'enum' ? (enumOption ? `option:${enumOption.id}` : 'current') : '';

  return (
    <div className={styles.ValueControl}>
      {definition.kind !== 'record' ? (
        <label htmlFor={id}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {load ? (
        <Input.Root>
          <Input.Control
            aria-label={`Search ${label} options`}
            placeholder="Search available values…"
            value={search}
            disabled={disabled}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Input.Root>
      ) : null}
      {definition.kind === 'record' ? (
        <fieldset
          className={styles.Group}
          disabled={disabled}
          aria-label={label}
          aria-describedby={description}
        >
          <legend>
            {label}
            {required ? ' *' : ''}
          </legend>
          {definition.fields.map((field) => (
            <QueryValueInput
              key={field.id}
              definition={field.definition}
              label={field.label}
              value={
                value?.kind === 'record' &&
                Object.prototype.hasOwnProperty.call(value.value, field.id)
                  ? value.value[field.id]
                  : undefined
              }
              required={field.required}
              disabled={disabled}
              sensitive={sensitive}
              contextKey={`${contextKey}:${field.id}`}
              onChange={(next) => {
                const values: Record<string, QueryValue | undefined> = {
                  ...(value?.kind === 'record' ? value.value : {}),
                  [field.id]: next,
                };
                if (next === undefined) delete values[field.id];
                onChange({ kind: 'record', value: values });
              }}
            />
          ))}
        </fieldset>
      ) : definition.kind === 'boolean' ? (
        <select
          id={id}
          value={value?.kind === 'boolean' ? String(value.value) : ''}
          disabled={disabled}
          required={required}
          aria-describedby={description}
          aria-invalid={Boolean(error)}
          onChange={(event) =>
            onChange(
              event.target.value === ''
                ? undefined
                : { kind: 'boolean', value: event.target.value === 'true' },
            )
          }
        >
          <option value="">Choose a value…</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      ) : definition.kind === 'enum' ? (
        <select
          id={id}
          value={enumSelection}
          disabled={disabled || remoteUnavailable}
          required={required}
          aria-describedby={description}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            if (event.target.value === '') onChange(undefined);
            else {
              const option = options.find(
                (candidate) => `option:${candidate.id}` === event.target.value,
              );
              if (option && !option.disabledReason) onChange({ kind: 'enum', value: option.value });
            }
          }}
        >
          <option value="">Choose a value…</option>
          {value?.kind === 'enum' && !enumOption ? (
            <option value="current">
              Current value: {text || '(empty string)'} (not in available options)
            </option>
          ) : null}
          {options.map((option) => (
            <option
              key={option.id}
              value={`option:${option.id}`}
              disabled={Boolean(option.disabledReason)}
            >
              {option.label}
              {option.disabledReason ? ` — ${option.disabledReason}` : ''}
            </option>
          ))}
        </select>
      ) : definition.kind === 'list' ? (
        <div>
          <ul className={styles.ValueList}>
            {list.map((entry, index) => (
              <li key={index}>
                <span>{sensitive ? '••••••' : entry}</span>
                <Button
                  size="xs"
                  disabled={disabled}
                  aria-label={`Remove ${label} item ${index + 1}`}
                  onClick={() =>
                    onChange({
                      kind: 'list',
                      value: list.filter((_, position) => position !== index),
                    })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className={styles.Row}>
            <Input.Root>
              <Input.Control
                id={id}
                type={sensitive ? 'password' : 'text'}
                value={item}
                list={!sensitive && options.length ? `${id}-options` : undefined}
                aria-describedby={description}
                disabled={disabled}
                placeholder={definition.placeholder ?? 'Add a value…'}
                onChange={(event) => setItem(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.nativeEvent.isComposing && item) {
                    event.preventDefault();
                    onChange({ kind: 'list', value: [...list, item] });
                    setItem('');
                  }
                }}
              />
            </Input.Root>
            <Button
              size="sm"
              disabled={disabled || !item}
              onClick={() => {
                onChange({ kind: 'list', value: [...list, item] });
                setItem('');
              }}
            >
              Add value
            </Button>
          </div>
        </div>
      ) : (
        <Input.Root>
          <Input.Control
            id={id}
            type={sensitive ? 'password' : 'text'}
            value={text}
            inputMode={
              definition.kind === 'integer'
                ? 'numeric'
                : definition.kind === 'number'
                  ? 'decimal'
                  : 'text'
            }
            required={required}
            disabled={disabled}
            aria-describedby={description}
            aria-invalid={Boolean(error)}
            placeholder={
              definition.placeholder ??
              (definition.kind === 'timestamp'
                ? 'RFC 3339 timestamp, including timezone'
                : undefined)
            }
            autoComplete="off"
            list={!sensitive && options.length ? `${id}-options` : undefined}
            onChange={(event) => {
              const kind = definition.kind;
              if (
                kind === 'string' ||
                kind === 'integer' ||
                kind === 'number' ||
                kind === 'timestamp'
              )
                onChange({ kind, value: event.target.value });
            }}
          />
        </Input.Root>
      )}
      {!sensitive && definition.kind !== 'enum' && options.length ? (
        <datalist id={`${id}-options`}>
          {options.map((option) => (
            <option key={option.id} value={option.value} label={option.label} />
          ))}
        </datalist>
      ) : null}
      <div id={description} className={styles.Muted}>
        {definition.description ? <div>{definition.description}</div> : null}
        {definition.constraint ? <div>{definition.constraint}</div> : null}
        {definition.kind === 'integer' || definition.kind === 'number' ? (
          <div>Exact draft; validated by the query service.</div>
        ) : null}
      </div>
      {load ? (
        <div role="status" data-status={loading ? 'loading' : response?.status}>
          {loading
            ? 'Loading values…'
            : (response?.message ??
              (response?.status === 'denied'
                ? 'Value access denied.'
                : response?.status === 'unavailable'
                  ? 'Values unavailable.'
                  : response?.status === 'error'
                    ? 'Values could not be loaded.'
                    : !options.length
                      ? 'No values found.'
                      : response?.incomplete
                        ? 'Limited observed values. Refine the search.'
                        : `${options.length} available values.`))}
        </div>
      ) : null}
      {definition.kind === 'enum' && value?.kind === 'enum'
        ? options
            .filter((option) => option.value === value.value && option.description)
            .map((option) => (
              <div key={option.id} className={styles.Muted}>
                {option.description}
              </div>
            ))
        : null}
      {error ? <div role="alert">{error}</div> : null}
    </div>
  );
}
