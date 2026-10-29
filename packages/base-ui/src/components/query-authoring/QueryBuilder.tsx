import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../button';
import { QueryValueInput } from './QueryValueInput';
import type {
  QueryAvailability,
  QueryBuilderAnalysis,
  QueryBuilderDiagnostic,
  QueryClause,
  QueryConversionContext,
  QueryField,
  QueryGroup,
  QueryNode,
} from './types';
import styles from './QueryAuthoring.module.css';

export interface QueryBuilderProps {
  value: QueryGroup;
  onChange: (value: QueryGroup) => void;
  fields: readonly QueryField[];
  contextKey?: string;
  disabled?: boolean;
  availability?: QueryAvailability;
  diagnostics?: readonly QueryBuilderDiagnostic[];
  /** Host-authorized operation. Negation is whole-clause/group NOT, never inequality. */
  allowNegation?: boolean;
  analyze?: (value: QueryGroup, context: QueryConversionContext) => Promise<QueryBuilderAnalysis>;
  preview?: string;
  explanation?: string;
  examples?: readonly { label: string; description: string; value: QueryGroup }[];
  className?: string;
}

interface GroupProps {
  value: QueryGroup;
  onChange: (value: QueryGroup) => void;
  fields: readonly QueryField[];
  contextKey: string;
  disabled: boolean;
  allowNegation: boolean;
  diagnostics: readonly QueryBuilderDiagnostic[];
  nextId: () => string;
}

function Clause({
  value,
  onChange,
  fields,
  contextKey,
  disabled,
  allowNegation,
  diagnostics,
}: Omit<GroupProps, 'value' | 'onChange' | 'nextId'> & {
  value: QueryClause;
  onChange: (value: QueryClause) => void;
}) {
  const id = useId();
  const field = fields.find((candidate) => candidate.id === value.field);
  const operator = field?.operators.find((candidate) => candidate.id === value.operator);
  const fieldBlocked = disabled || Boolean(field?.disabledReason);
  return (
    <div className={styles.Clause}>
      <div className={styles.ClauseControls}>
        <label>
          Field
          <select
            aria-label="Field"
            value={value.field ?? ''}
            disabled={disabled}
            aria-describedby={`${id}-field-description`}
            onChange={(event) =>
              onChange({
                kind: 'clause',
                id: value.id,
                field: event.target.value || undefined,
                negated: value.negated,
              })
            }
          >
            <option value="">Choose a field…</option>
            {value.field && !field ? (
              <option value={value.field}>Unavailable field: {value.field}</option>
            ) : null}
            {fields.map((item) => (
              <option key={item.id} value={item.id} disabled={Boolean(item.disabledReason)}>
                {item.label} · {item.type}
                {item.condition ? ' (conditional)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Operator
          <select
            aria-label="Operator"
            value={value.operator ?? ''}
            disabled={fieldBlocked || !field}
            aria-describedby={`${id}-operator-description`}
            onChange={(event) =>
              onChange({ ...value, operator: event.target.value || undefined, value: undefined })
            }
          >
            <option value="">Choose an operator…</option>
            {value.operator && !operator ? (
              <option value={value.operator}>Unavailable operator: {value.operator}</option>
            ) : null}
            {field?.operators.map((item) => (
              <option key={item.id} value={item.id} disabled={Boolean(item.disabledReason)}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {operator?.value ? (
          <QueryValueInput
            key={`${value.field}:${value.operator}`}
            label="Value"
            definition={operator.value}
            value={value.value}
            contextKey={contextKey}
            disabled={fieldBlocked || Boolean(operator.disabledReason)}
            onChange={(next) => onChange({ ...value, value: next })}
          />
        ) : null}
      </div>
      <div id={`${id}-field-description`} className={styles.Muted}>
        {field?.description ? <div>{field.description}</div> : null}
        {field?.condition ? (
          <div className={styles.Condition}>Conditional: {field.condition}</div>
        ) : null}
        {field?.disabledReason ? <div>{field.disabledReason}</div> : null}
        {value.field && !field ? (
          <div role="alert">
            This field is no longer available. Its saved condition is preserved; choose a
            replacement or remove it.
          </div>
        ) : null}
      </div>
      <div id={`${id}-operator-description`} className={styles.Muted}>
        {operator?.description}
        {operator?.disabledReason ? <div>{operator.disabledReason}</div> : null}
        {value.operator && !operator ? (
          <div role="alert">
            The saved operator is unavailable. The condition has not been rewritten.
          </div>
        ) : null}
      </div>
      {allowNegation || value.negated ? (
        <label className={styles.Checkbox}>
          <input
            type="checkbox"
            checked={Boolean(value.negated)}
            disabled={disabled || !allowNegation}
            onChange={(event) => onChange({ ...value, negated: event.target.checked })}
          />
          Negate whole condition (NOT)
        </label>
      ) : null}
      {diagnostics
        .filter((diagnostic) => diagnostic.nodeId === value.id)
        .map((diagnostic, index) => (
          <div
            key={index}
            role={diagnostic.severity === 'error' ? 'alert' : 'status'}
            data-severity={diagnostic.severity}
          >
            {diagnostic.message}
          </div>
        ))}
    </div>
  );
}

function Group({
  value,
  onChange,
  fields,
  contextKey,
  disabled,
  allowNegation,
  diagnostics,
  nextId,
}: GroupProps) {
  function replace(index: number, child: QueryNode) {
    onChange({
      ...value,
      children: value.children.map((item, position) => (position === index ? child : item)),
    });
  }
  function move(index: number, direction: number) {
    const children = [...value.children];
    const next = index + direction;
    const current = children[index];
    const target = children[next];
    if (!current || !target) return;
    children[index] = target;
    children[next] = current;
    onChange({ ...value, children });
  }
  return (
    <fieldset className={styles.Group} disabled={disabled} aria-label="Condition group">
      <legend>Condition group</legend>
      <div className={styles.Row}>
        <label className={styles.InlineLabel}>
          Match
          <select
            aria-label="Match"
            value={value.combinator}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...value, combinator: event.target.value === 'or' ? 'or' : 'and' })
            }
          >
            <option value="and">All conditions (AND)</option>
            <option value="or">Any condition (OR)</option>
          </select>
        </label>
        {allowNegation || value.negated ? (
          <label className={styles.Checkbox}>
            <input
              type="checkbox"
              checked={Boolean(value.negated)}
              disabled={disabled || !allowNegation}
              onChange={(event) => onChange({ ...value, negated: event.target.checked })}
            />
            Negate whole group (NOT)
          </label>
        ) : null}
      </div>
      {!value.children.length ? (
        <p className={styles.Muted}>No conditions. Add a condition or group.</p>
      ) : null}
      <ol className={styles.Nodes}>
        {value.children.map((child, index) => (
          <li key={child.id} className={styles.Node}>
            {index > 0 ? (
              <span className={styles.Combinator}>{value.combinator.toUpperCase()}</span>
            ) : null}
            <div className={styles.NodeBody}>
              {child.kind === 'group' ? (
                <Group
                  value={child}
                  onChange={(next) => replace(index, next)}
                  fields={fields}
                  contextKey={contextKey}
                  disabled={disabled}
                  allowNegation={allowNegation}
                  diagnostics={diagnostics}
                  nextId={nextId}
                />
              ) : (
                <Clause
                  value={child}
                  onChange={(next) => replace(index, next)}
                  fields={fields}
                  contextKey={contextKey}
                  disabled={disabled}
                  allowNegation={allowNegation}
                  diagnostics={diagnostics}
                />
              )}
              <div className={styles.NodeActions}>
                <Button
                  size="xs"
                  disabled={disabled || index === 0}
                  aria-label={`Move ${child.kind === 'group' ? 'group' : 'condition'} up`}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </Button>
                <Button
                  size="xs"
                  disabled={disabled || index === value.children.length - 1}
                  aria-label={`Move ${child.kind === 'group' ? 'group' : 'condition'} down`}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </Button>
                <Button
                  size="xs"
                  color="danger"
                  disabled={disabled}
                  aria-label={`Remove ${child.kind === 'group' ? 'group' : 'condition'}`}
                  onClick={() =>
                    onChange({
                      ...value,
                      children: value.children.filter((_, position) => index !== position),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className={styles.Row}>
        <Button
          size="sm"
          disabled={disabled}
          onClick={() =>
            onChange({ ...value, children: [...value.children, { kind: 'clause', id: nextId() }] })
          }
        >
          Add condition
        </Button>
        <Button
          size="sm"
          variant="soft"
          disabled={disabled}
          onClick={() =>
            onChange({
              ...value,
              children: [
                ...value.children,
                { kind: 'group', id: nextId(), combinator: 'and', children: [] },
              ],
            })
          }
        >
          Add group
        </Button>
      </div>
      {diagnostics
        .filter((diagnostic) => diagnostic.nodeId === value.id)
        .map((diagnostic, index) => (
          <div key={index} role={diagnostic.severity === 'error' ? 'alert' : 'status'}>
            {diagnostic.message}
          </div>
        ))}
    </fieldset>
  );
}

const noDiagnostics: readonly QueryBuilderDiagnostic[] = [];
export function QueryBuilder({
  value,
  onChange,
  fields,
  contextKey = '',
  disabled = false,
  availability,
  allowNegation = false,
  diagnostics = noDiagnostics,
  analyze,
  preview,
  explanation,
  examples,
  className,
}: QueryBuilderProps) {
  const prefix = useId();
  const counter = useRef(0);
  const sequence = useRef(0);
  const [analysis, setAnalysis] = useState<{
    value: QueryGroup;
    contextKey: string;
    result: QueryBuilderAnalysis;
  } | null>(null);
  const blocked = disabled || Boolean(availability && availability.status !== 'ready');
  const [loading, setLoading] = useState(Boolean(analyze && !blocked));
  // Invalidate request presentation with its inputs; effects only own the remote request.
  const [analysisInputs, setAnalysisInputs] = useState(() => ({ value, contextKey, analyze, blocked }));
  if (
    analysisInputs.value !== value ||
    analysisInputs.contextKey !== contextKey ||
    analysisInputs.analyze !== analyze ||
    analysisInputs.blocked !== blocked
  ) {
    setAnalysisInputs({ value, contextKey, analyze, blocked });
    setLoading(Boolean(analyze && !blocked));
  }
  useEffect(() => {
    const generation = ++sequence.current;
    const abort = new AbortController();
    if (!analyze || blocked) {
      return () => abort.abort();
    }
    const timer = setTimeout(async () => {
      try {
        const result = await analyze(value, { contextKey, signal: abort.signal });
        if (!abort.signal.aborted && generation === sequence.current)
          setAnalysis({ value, contextKey, result });
      } catch (reason) {
        if (!abort.signal.aborted && generation === sequence.current)
          setAnalysis({
            value,
            contextKey,
            result: {
              status: 'error',
              message: reason instanceof Error ? reason.message : 'Builder validation failed.',
              diagnostics: [],
            },
          });
      } finally {
        if (!abort.signal.aborted && generation === sequence.current) setLoading(false);
      }
    }, 120);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [value, contextKey, analyze, blocked]);
  const current =
    analysis?.value === value && analysis.contextKey === contextKey ? analysis.result : null;
  const allDiagnostics = current ? [...diagnostics, ...current.diagnostics] : diagnostics;
  const displayedPreview = current?.preview ?? preview;
  const displayedExplanation = current?.explanation ?? explanation;

  return (
    <div className={`${styles.Builder} ${className ?? ''}`}>
      {availability && availability.status !== 'ready' ? (
        <div role="status" data-status={availability.status}>
          {availability.message ?? `Builder ${availability.status}.`}
        </div>
      ) : null}
      <Group
        value={value}
        onChange={onChange}
        fields={fields}
        contextKey={contextKey}
        disabled={blocked}
        allowNegation={allowNegation}
        diagnostics={allDiagnostics}
        nextId={() => `${prefix}-${++counter.current}`}
      />
      {allDiagnostics
        .filter((diagnostic) => !diagnostic.nodeId)
        .map((diagnostic, index) => (
          <div key={index} role={diagnostic.severity === 'error' ? 'alert' : 'status'}>
            {diagnostic.message}
          </div>
        ))}
      {loading ? (
        <div role="status">Validating conditions…</div>
      ) : current?.message ? (
        <div role="status" data-status={current.status}>
          {current.message}
        </div>
      ) : null}
      {displayedPreview !== undefined ? (
        <section aria-label="Query preview">
          <h4>Query preview</h4>
          <pre className={styles.Preview}>{displayedPreview}</pre>
        </section>
      ) : null}
      {displayedExplanation ? (
        <section aria-label="Query explanation">
          <h4>Explanation</h4>
          <p>{displayedExplanation}</p>
        </section>
      ) : null}
      {examples?.length ? (
        <details>
          <summary>Examples</summary>
          <ul className={styles.Examples}>
            {examples.map((example) => (
              <li key={example.label}>
                <Button size="sm" disabled={blocked} onClick={() => onChange(example.value)}>
                  {example.label}
                </Button>
                <p className={styles.Muted}>{example.description}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
