import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../button';
import { QueryInput, type QueryInputProps } from './QueryInput';
import { QueryBuilder, type QueryBuilderProps } from './QueryBuilder';
import type {
  QueryAuthoringLabels,
  QueryAuthoringValue,
  QueryAvailability,
  QueryConversionContext,
  QueryConversionResult,
  QueryDocument,
  QueryEditorRenderProps,
  QueryGroup,
  QueryLanguageService,
  QueryPresentationState,
  QueryScopeOption,
} from './types';
import styles from './QueryAuthoring.module.css';

export interface QueryAuthoringProps {
  value: QueryAuthoringValue;
  onChange: (value: QueryAuthoringValue) => void;
  contextKey: string;
  fields: QueryBuilderProps['fields'];
  request?: QueryLanguageService;
  /** Render the host's code editor without introducing a base-ui/editor dependency. */
  renderEditor?: (props: QueryEditorRenderProps) => ReactNode;
  toBuilder?: (
    document: QueryDocument,
    context: QueryConversionContext,
  ) => Promise<QueryConversionResult<QueryGroup>>;
  toCode?: (
    builder: QueryGroup,
    context: QueryConversionContext,
  ) => Promise<QueryConversionResult<string>>;
  onRun?: (value: QueryAuthoringValue) => void;
  onCancel?: () => void;
  onRefresh?: () => void;
  onClear?: () => void;
  running?: boolean;
  disabled?: boolean;
  availability?: QueryAvailability;
  state?: QueryPresentationState;
  scopes?: readonly QueryScopeOption[];
  scope?: string;
  onScopeChange?: (scope: string) => void;
  inputProps?: Pick<
    QueryInputProps,
    'rows' | 'label' | 'placeholder' | 'debounceMs' | 'maxSuggestions'
  >;
  builderProps?: Omit<
    QueryBuilderProps,
    'value' | 'onChange' | 'fields' | 'contextKey' | 'availability' | 'disabled'
  >;
  labels?: QueryAuthoringLabels;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Both drafts are retained. Only an explicit successful host conversion changes mode. */
export function QueryAuthoring({
  value,
  onChange,
  contextKey,
  fields,
  request,
  renderEditor,
  toBuilder,
  toCode,
  onRun,
  onCancel,
  onRefresh,
  onClear,
  running = false,
  disabled = false,
  availability,
  state,
  scopes,
  scope,
  onScopeChange,
  inputProps,
  builderProps,
  labels,
  actions,
  children,
  className,
}: QueryAuthoringProps) {
  const active = useRef<{
    abort: AbortController;
    value: QueryAuthoringValue;
    contextKey: string;
  } | null>(null);
  const [converting, setConverting] = useState(false);
  const [notice, setNotice] = useState<string>();
  const blocked = disabled || Boolean(availability && availability.status !== 'ready');
  const latest = useRef({ value, contextKey, blocked });
  latest.current = { value, contextKey, blocked };
  useEffect(() => {
    active.current?.abort.abort();
    active.current = null;
    setConverting(false);
    setNotice(undefined);
    return () => {
      active.current?.abort.abort();
    };
  }, [value, contextKey, toBuilder, toCode, blocked]);

  async function switchMode(mode: QueryAuthoringValue['mode']) {
    if (mode === value.mode || blocked || converting) return;
    const abort = new AbortController();
    const operation = { abort, value, contextKey };
    active.current?.abort.abort();
    active.current = operation;
    setConverting(true);
    setNotice(undefined);
    try {
      const result =
        mode === 'builder'
          ? await toBuilder?.(value.code, { contextKey, signal: abort.signal })
          : await toCode?.(value.builder, { contextKey, signal: abort.signal });
      if (
        abort.signal.aborted ||
        active.current !== operation ||
        latest.current.blocked ||
        latest.current.value !== value ||
        latest.current.contextKey !== contextKey
      )
        return;
      if (!result) {
        setNotice(`Conversion to ${mode} mode is unavailable. Your current query is unchanged.`);
      } else if (result.status !== 'ready') {
        setNotice(result.message);
      } else if (mode === 'builder' && typeof result.value !== 'string')
        onChange({ ...value, mode, builder: result.value });
      else if (mode === 'code' && typeof result.value === 'string')
        onChange({ ...value, mode, code: { ...value.code, text: result.value, version: value.code.version + 1 } });
    } catch (reason) {
      if (!abort.signal.aborted && active.current === operation)
        setNotice(
          reason instanceof Error
            ? reason.message
            : 'Mode conversion failed. Your current query is unchanged.',
        );
    } finally {
      if (!abort.signal.aborted && active.current === operation) {
        active.current = null;
        setConverting(false);
      }
    }
  }

  return (
    <section aria-label="Query authoring" className={`${styles.Authoring} ${className ?? ''}`}>
      <div className={styles.Toolbar}>
        <div role="group" aria-label="Query editing mode" className={styles.Row}>
          <Button
            size="sm"
            aria-pressed={value.mode === 'code'}
            disabled={blocked || converting}
            onClick={() => void switchMode('code')}
          >
            {labels?.code ?? 'Code'}
          </Button>
          <Button
            size="sm"
            aria-pressed={value.mode === 'builder'}
            disabled={blocked || converting}
            onClick={() => void switchMode('builder')}
          >
            {labels?.builder ?? 'Builder'}
          </Button>
        </div>
        {scopes ? (
          <label className={styles.InlineLabel}>
            Scope
            <select
              aria-label="Query scope"
              value={scope ?? ''}
              disabled={blocked || !onScopeChange}
              onChange={(event) => onScopeChange?.(event.target.value)}
            >
              <option value="">Choose a scope…</option>
              {scope && !scopes.some((item) => item.id === scope) ? (
                <option value={scope}>Unavailable scope: {scope}</option>
              ) : null}
              {scopes.map((item) => (
                <option key={item.id} value={item.id} disabled={Boolean(item.disabledReason)}>
                  {item.label}
                  {item.disabledReason ? ` — ${item.disabledReason}` : ''}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className={styles.ToolbarActions}>
          {actions}
          {onClear ? (
            <Button size="sm" disabled={blocked || converting} onClick={onClear}>
              {labels?.clear ?? 'Clear'}
            </Button>
          ) : null}
          {onRefresh ? (
            <Button size="sm" disabled={blocked || running || converting} onClick={onRefresh}>
              Refresh
            </Button>
          ) : null}
          {running && onCancel ? (
            <Button size="sm" onClick={onCancel}>
              Cancel query
            </Button>
          ) : onRun ? (
            <Button
              size="sm"
              color="brand"
              disabled={blocked || running || converting}
              onClick={() => onRun(value)}
            >
              {labels?.run ?? 'Run query'}
            </Button>
          ) : null}
        </div>
      </div>
      {scope && scopes?.find((item) => item.id === scope)?.description ? (
        <p className={styles.Muted}>{scopes.find((item) => item.id === scope)?.description}</p>
      ) : null}
      {converting ? <div role="status">Converting query…</div> : null}
      {notice ? (
        <div role="alert" className={styles.Notice}>
          {notice} <span>Your source and builder drafts are preserved.</span>
        </div>
      ) : null}
      {value.mode === 'code' ? (
        renderEditor ? (
          renderEditor({
            ...inputProps,
            document: value.code,
            contextKey,
            request,
            onChange: (text) =>
              onChange({ ...value, code: { ...value.code, text, version: value.code.version + 1 } }),
            onSubmit: onRun
              ? () => {
                  if (!running && !converting) onRun(value);
                }
              : undefined,
            disabled: disabled || converting,
            availability,
          })
        ) : (
          <QueryInput
            {...inputProps}
            document={value.code}
            contextKey={contextKey}
            request={request}
            onChange={(text) =>
              onChange({ ...value, code: { ...value.code, text, version: value.code.version + 1 } })
            }
            onSubmit={
              onRun
                ? () => {
                    if (!running && !converting) onRun(value);
                  }
                : undefined
            }
            disabled={disabled || converting}
            availability={availability}
          />
        )
      ) : (
        <QueryBuilder
          {...builderProps}
          fields={fields}
          value={value.builder}
          onChange={(builder) => onChange({ ...value, builder })}
          contextKey={contextKey}
          disabled={disabled || converting}
          availability={availability}
        />
      )}
      {children}
      {state ? (
        <div role="status" className={styles.ExecutionState} data-status={state.status}>
          <strong>{state.message}</strong>
          {state.detail ? <div>{state.detail}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
