import { useId, type ReactNode } from 'react';
import { Button } from '../button/Button';
import { AlertDialog } from '../alert-dialog/AlertDialog';
import { Input } from '../input/Input';
import { cn } from '../../system/classnames';
import type { SavedResourceAction, SavedResourceItem, WorkspaceActionResult } from './types';
import { useWorkspaceAction } from './useWorkspaceAction';
import styles from './ResourceWorkspaceControls.module.css';

export interface SavedResourceManagerProps<TDraft> {
  kind: 'query' | 'view' | 'preset';
  items: readonly SavedResourceItem[];
  selectedId: string | null;
  nameDraft: string;
  onNameDraftChange: (name: string) => void;
  importDraft: string;
  onImportDraftChange: (document: string) => void;
  /** Opaque configuration. Never interpreted, serialized, or validated by this component. */
  draft: TDraft;
  dirty: boolean;
  onAction: (
    action: SavedResourceAction<TDraft>,
    signal: AbortSignal,
  ) => Promise<WorkspaceActionResult>;
  status?: WorkspaceActionResult;
  loading?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  children?: ReactNode;
  className?: string;
}

export function SavedResourceManager<TDraft>({
  kind,
  items,
  selectedId,
  nameDraft,
  onNameDraftChange,
  importDraft,
  onImportDraftChange,
  draft,
  dirty,
  onAction,
  status,
  loading,
  disabled,
  disabledReason,
  children,
  className,
}: SavedResourceManagerProps<TDraft>) {
  const id = useId();
  const action = useWorkspaceAction();
  const selected = items.find((item) => item.id === selectedId);
  const unavailable = Boolean(selectedId && !selected);
  const blocked = disabled || loading || action.pending;
  const feedback = action.result ?? status;
  function dispatch(request: SavedResourceAction<TDraft>) {
    void action.run((signal) => onAction(request, signal));
  }
  return (
    <section
      className={cn(styles.Root, className)}
      aria-label={`Saved ${kind} manager`}
      aria-busy={loading || action.pending}
    >
      <h2 className={styles.Heading}>Saved {kind === 'query' ? 'queries' : `${kind}s`}</h2>
      <p className={styles.Description}>
        The host owns saving, validation, migration and export. Drafts remain editable and are not
        cleared by operations.
      </p>
      {disabledReason ? <p>{disabledReason}</p> : null}
      {loading ? (
        <p role="status">Loading saved {kind === 'query' ? 'queries' : `${kind}s`}…</p>
      ) : null}
      <label className={styles.Label} htmlFor={`${id}-selection`}>
        Saved {kind}
      </label>
      <select
        id={`${id}-selection`}
        className={styles.Select}
        value={selectedId ?? ''}
        disabled={blocked}
        onChange={(event) => dispatch({ type: 'select', id: event.target.value || null })}
      >
        <option value="">Provider default / unsaved</option>
        {unavailable ? (
          <option value={selectedId ?? ''}>
            Unavailable saved {kind}: {selectedId}
          </option>
        ) : null}
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
            {item.status && item.status !== 'ready' ? ` (${item.status})` : ''}
          </option>
        ))}
      </select>
      {selected?.status && selected.status !== 'ready' ? (
        <p role="alert" data-state={selected.status}>
          {selected.status}:{' '}
          {selected.reason ??
            'The host could not open this configuration. Your draft is preserved.'}
        </p>
      ) : null}
      {unavailable ? (
        <p role="alert">Saved {kind} is unavailable. Your draft is preserved.</p>
      ) : null}
      <Input.Root>
        <Input.Label>{kind[0]!.toUpperCase() + kind.slice(1)} name</Input.Label>
        <Input.Control value={nameDraft} onValueChange={onNameDraftChange} disabled={disabled} />
      </Input.Root>
      {children}
      <p role="status">{dirty ? 'Unsaved changes' : 'No unsaved changes'}</p>
      <div className={styles.Actions}>
        <Button
          size="sm"
          disabled={blocked}
          onClick={() => dispatch({ type: 'create', name: nameDraft, draft })}
        >
          Create {kind}
        </Button>
        <Button
          size="sm"
          disabled={blocked || !selectedId}
          onClick={() => {
            if (selectedId) dispatch({ type: 'rename', id: selectedId, name: nameDraft });
          }}
        >
          Rename {kind}
        </Button>
        <Button
          size="sm"
          color="brand"
          disabled={blocked || !selectedId || !dirty}
          onClick={() => {
            if (selectedId) dispatch({ type: 'save', id: selectedId, name: nameDraft, draft });
          }}
        >
          Save {kind}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={blocked}
          onClick={() => dispatch({ type: 'reset', id: selectedId })}
        >
          Reset to provider default
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={blocked || !selectedId}
          onClick={() => {
            if (selectedId) dispatch({ type: 'export', id: selectedId });
          }}
        >
          Export {kind}
        </Button>
        <AlertDialog.Root key={selectedId ?? 'unsaved'}>
          <AlertDialog.Trigger
            size="sm"
            color="danger"
            variant="outline"
            disabled={blocked || !selectedId}
          >
            Delete {kind}
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Popup>
              <AlertDialog.Title>Delete {kind}?</AlertDialog.Title>
              <AlertDialog.Description>
                Ask the host to delete “{selected?.name ?? selectedId}”. This is separate from
                resetting to the provider default. Your current name, configuration and import
                drafts remain preserved.
              </AlertDialog.Description>
              <div className={styles.Actions}>
                <AlertDialog.Close variant="ghost">Cancel deletion</AlertDialog.Close>
                <AlertDialog.Close
                  color="danger"
                  disabled={blocked || !selectedId}
                  onClick={() => {
                    if (!blocked && selectedId) dispatch({ type: 'delete', id: selectedId });
                  }}
                >
                  Confirm delete {kind}
                </AlertDialog.Close>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
      <label className={styles.Label} htmlFor={`${id}-import`}>
        Import document
      </label>
      <textarea
        id={`${id}-import`}
        className={styles.Textarea}
        value={importDraft}
        onChange={(event) => onImportDraftChange(event.target.value)}
        disabled={disabled}
        rows={4}
        spellCheck={false}
      />
      <Button
        size="sm"
        disabled={blocked}
        onClick={() => dispatch({ type: 'import', document: importDraft })}
      >
        Import {kind}
      </Button>
      {action.pending ? (
        <div className={styles.Actions}>
          <p role="status">Host operation pending…</p>
          <Button size="sm" onClick={action.cancel}>
            Cancel operation
          </Button>
        </div>
      ) : null}
      {feedback ? (
        <p role={feedback.status === 'success' ? 'status' : 'alert'} data-state={feedback.status}>
          {feedback.message ??
            (feedback.status === 'success'
              ? 'Host operation completed.'
              : `${feedback.status}: configuration and drafts are preserved.`)}
        </p>
      ) : null}
    </section>
  );
}
