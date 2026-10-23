import { useId, useRef } from 'react';
import { Button } from '../button/Button';
import { Diagnostics } from './InspectorEvidence';
import { RelationshipPreview } from './RelationshipPreview';
import { useInspectorAction } from './useInspectorAction';
import type {
  InspectorAsyncContext,
  RelationshipCardinality,
  RelationshipCatalog,
  RelationshipCondition,
  RelationshipPreviewData,
  RelationshipRuleDraft,
  RelationshipValidation,
} from './types';
import styles from './ResourceInspectorControls.module.css';

export interface RelationshipRuleEditorProps {
  draft: RelationshipRuleDraft;
  catalog: RelationshipCatalog;
  onChange: (draft: RelationshipRuleDraft) => void;
  onSave: (draft: RelationshipRuleDraft, context: InspectorAsyncContext) => Promise<void>;
  onPreview: (draft: RelationshipRuleDraft, context: InspectorAsyncContext) => Promise<void>;
  onSetEnabled: (enabled: boolean, context: InspectorAsyncContext) => Promise<void>;
  /** Must describe the current controlled draft. Unknown/pending drafts cannot be saved. */
  validation: RelationshipValidation;
  preview?: RelationshipPreviewData;
  /** The host confirms the preview belongs to this exact draft/access context. Defaults to false. */
  previewIsCurrent?: boolean;
  onNavigate?: (navigationId: string) => void;
  state?: 'ready' | 'loading' | 'denied' | 'unavailable';
  message?: string;
}

interface Choice {
  id: string;
  label: string;
}
function ChoiceField({
  label,
  value,
  choices,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  choices: readonly Choice[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.Field}>
      {label}
      <select
        className={styles.Select}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select…</option>
        {value && !choices.some((choice) => choice.id === value) ? (
          <option value={value}>{value} (unavailable; retained in draft)</option>
        ) : null}
        {choices.map((choice) => (
          <option value={choice.id} key={choice.id}>
            {choice.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const cardinalities: readonly { id: RelationshipCardinality; label: string }[] = [
  { id: 'one-to-one', label: 'One to one' },
  { id: 'one-to-many', label: 'One to many' },
  { id: 'many-to-one', label: 'Many to one' },
  { id: 'many-to-many', label: 'Many to many' },
];

export function RelationshipRuleEditor({
  draft,
  catalog,
  onChange,
  onSave,
  onPreview,
  onSetEnabled,
  validation,
  preview,
  previewIsCurrent = false,
  onNavigate,
  state = 'ready',
  message,
}: RelationshipRuleEditorProps) {
  const headingId = useId();
  const nextCondition = useRef(0);
  const action = useInspectorAction(`${state}:${JSON.stringify(draft)}`);
  const readOnly = draft.origin === 'provider';
  const disabled = state !== 'ready' || Boolean(action.pending) || readOnly;
  const selectedSource = catalog.sourceTypes.find((type) => type.id === draft.sourceTypeId);
  const selectedTarget = catalog.targetTypes.find((type) => type.id === draft.targetTypeId);
  const mapping = catalog.scopeMappings.find((scope) => scope.id === draft.scopeMappingId);

  function updateCondition(id: string, patch: Partial<RelationshipCondition>) {
    onChange({
      ...draft,
      conditions: draft.conditions.map((condition) =>
        condition.id === id ? { ...condition, ...patch } : condition,
      ),
    });
  }

  function addCondition() {
    let id: string;
    do {
      id = `${headingId}-condition-${nextCondition.current++}`;
    } while (draft.conditions.some((condition) => condition.id === id));
    onChange({
      ...draft,
      conditions: [
        ...draft.conditions,
        { id, sourceFieldId: '', targetFieldId: '', operatorId: '' },
      ],
    });
  }

  return (
    <section
      className={styles.Root}
      aria-labelledby={headingId}
      aria-busy={state === 'loading' || Boolean(action.pending)}
    >
      <div className={styles.Row}>
        <h2 id={headingId}>Relationship rule</h2>
        <span className={styles.Status}>
          {draft.origin === 'provider' ? 'Provider-defined' : 'User-defined'}
        </span>
        <span className={styles.Status}>{draft.enabled ? 'Enabled' : 'Disabled'}</span>
      </div>
      <p className={styles.Muted}>
        Explicit configured links only. The host validates permissions, types, cardinality and
        bounded matching; field names do not imply identity.
      </p>
      {readOnly ? (
        <p>
          Provider-defined rules are read-only here. User rules do not replace or remove
          provider-defined edges.
        </p>
      ) : null}
      {state !== 'ready' ? (
        <p role="status">
          {state === 'loading'
            ? 'Loading rule catalog…'
            : state === 'denied'
              ? 'Rule access denied'
              : 'Rule catalog unavailable'}
          {message ? `: ${message}` : ''}
        </p>
      ) : null}
      <label className={styles.Field}>
        Rule name
        <input
          className={styles.TextInput}
          value={draft.name}
          disabled={disabled}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
        />
      </label>
      <div className={styles.Grid}>
        <ChoiceField
          label="Source type"
          value={draft.sourceTypeId}
          disabled={disabled}
          choices={catalog.sourceTypes.map((type) => ({
            id: type.id,
            label: `${type.label} · ${type.provider}`,
          }))}
          onChange={(sourceTypeId) => onChange({ ...draft, sourceTypeId })}
        />
        <ChoiceField
          label="Target type"
          value={draft.targetTypeId}
          disabled={disabled}
          choices={catalog.targetTypes.map((type) => ({
            id: type.id,
            label: `${type.label} · ${type.provider}`,
          }))}
          onChange={(targetTypeId) => onChange({ ...draft, targetTypeId })}
        />
        <ChoiceField
          label="Scope mapping"
          value={draft.scopeMappingId}
          disabled={disabled}
          choices={catalog.scopeMappings.map((scope) => ({
            id: scope.id,
            label: `${scope.label} · ${scope.state}`,
          }))}
          onChange={(scopeMappingId) => onChange({ ...draft, scopeMappingId })}
        />
        <label className={styles.Field}>
          Cardinality
          <select
            className={styles.Select}
            value={draft.cardinality}
            disabled={disabled}
            onChange={(event) => {
              const cardinality = cardinalities.find(
                (choice) => choice.id === event.target.value,
              )?.id;
              if (cardinality) onChange({ ...draft, cardinality });
            }}
          >
            {cardinalities.map((choice) => (
              <option value={choice.id} key={choice.id}>
                {choice.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {mapping ? (
        <p>
          {mapping.description} · {mapping.state}
        </p>
      ) : (
        <p className={styles.Muted}>Select an explicit host-provided scope mapping.</p>
      )}
      <fieldset className={styles.Conditions} disabled={disabled}>
        <legend>All typed link conditions</legend>
        {draft.conditions.map((condition, index) => (
          <div className={styles.Card} key={condition.id}>
            <div className={styles.Grid}>
              <ChoiceField
                label={`Source field ${index + 1}`}
                value={condition.sourceFieldId}
                disabled={disabled}
                choices={
                  selectedSource?.fields.map((field) => ({
                    id: field.id,
                    label: `${field.label} · ${field.type}`,
                  })) ?? []
                }
                onChange={(sourceFieldId) => updateCondition(condition.id, { sourceFieldId })}
              />
              <ChoiceField
                label={`Operator ${index + 1}`}
                value={condition.operatorId}
                disabled={disabled}
                choices={catalog.operators}
                onChange={(operatorId) => updateCondition(condition.id, { operatorId })}
              />
              <ChoiceField
                label={`Target field ${index + 1}`}
                value={condition.targetFieldId}
                disabled={disabled}
                choices={
                  selectedTarget?.fields.map((field) => ({
                    id: field.id,
                    label: `${field.label} · ${field.type}`,
                  })) ?? []
                }
                onChange={(targetFieldId) => updateCondition(condition.id, { targetFieldId })}
              />
            </div>
            {catalog.operators.find((operator) => operator.id === condition.operatorId)
              ?.description ? (
              <p className={styles.Basis}>
                {
                  catalog.operators.find((operator) => operator.id === condition.operatorId)
                    ?.description
                }
              </p>
            ) : null}
            <Button
              disabled={disabled}
              onClick={() =>
                onChange({
                  ...draft,
                  conditions: draft.conditions.filter((entry) => entry.id !== condition.id),
                })
              }
            >
              Remove condition {index + 1}
            </Button>
          </div>
        ))}
        <Button disabled={disabled} onClick={addCondition}>
          Add condition
        </Button>
      </fieldset>
      <p role="status">Host validation: {validation.state}</p>
      <Diagnostics diagnostics={validation.diagnostics} />
      <div className={styles.Row}>
        <Button
          disabled={state !== 'ready' || Boolean(action.pending)}
          onClick={() => action.run('preview', (context) => onPreview(draft, context))}
        >
          {action.pending === 'preview' ? 'Previewing…' : 'Preview rule'}
        </Button>
        <Button
          disabled={disabled || validation.state !== 'valid'}
          onClick={() => action.run('save', (context) => onSave(draft, context))}
        >
          {action.pending === 'save' ? 'Saving…' : 'Save rule'}
        </Button>
        <Button
          disabled={disabled || (draft.enabled === false && validation.state !== 'valid')}
          onClick={() => action.run('enable', (context) => onSetEnabled(!draft.enabled, context))}
        >
          {action.pending === 'enable'
            ? 'Updating…'
            : draft.enabled
              ? 'Disable rule'
              : 'Enable rule'}
        </Button>
        {action.pending === 'preview' ? (
          <Button onClick={action.cancel}>Cancel preview request</Button>
        ) : null}
      </div>
      {action.error ? (
        <p className={styles.Error} role="alert">
          {action.error}
        </p>
      ) : null}
      {action.pending ? (
        <p role="status">
          Request pending; the current draft is preserved. Cancellation stops waiting, not
          necessarily host work.
        </p>
      ) : null}
      <RelationshipPreview
        preview={previewIsCurrent ? preview : undefined}
        state={state !== 'ready' ? state : action.pending === 'preview' ? 'loading' : 'ready'}
        onNavigate={onNavigate}
      />
      {preview && !previewIsCurrent ? (
        <p className={styles.Muted}>
          Previous preview is not confirmed for this draft. Run preview again.
        </p>
      ) : null}
    </section>
  );
}
