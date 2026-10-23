/// <reference lib="es2024.promise" />
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ResourceResultNavigation } from './ResourceResultNavigation';
import { ResourceScopePicker } from './ResourceScopePicker';
import { SavedResourceManager } from './SavedResourceManager';
import type { ResourceScopeSelection, SavedResourceAction, WorkspaceActionResult } from './types';

function DeleteHarness({
  onAction,
}: {
  onAction: (
    action: SavedResourceAction<string>,
    signal: AbortSignal,
  ) => Promise<WorkspaceActionResult>;
}) {
  const [name, setName] = useState('Unsaved name');
  const [document, setDocument] = useState('Unparsed import draft');
  return (
    <SavedResourceManager
      kind="query"
      items={[{ id: 'saved', name: 'Saved query' }]}
      selectedId="saved"
      draft="Opaque draft"
      nameDraft={name}
      onNameDraftChange={setName}
      importDraft={document}
      onImportDraftChange={setDocument}
      dirty
      onAction={onAction}
    />
  );
}

async function confirmDelete() {
  await userEvent.click(screen.getByRole('button', { name: 'Delete query' }));
  await userEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm delete query' }),
  );
}

describe('workspace review regressions', () => {
  it('retains navigation across fresh inline props and aborts only when the host request key changes', async () => {
    const gate = Promise.withResolvers<WorkspaceActionResult>();
    let signal: AbortSignal | undefined;
    const onNavigate = vi.fn<
      (result: unknown, context: unknown, signal: AbortSignal) => Promise<WorkspaceActionResult>
    >((...args) => {
      signal = args[2];
      return gate.promise;
    });
    function Inline({ requestKey }: { requestKey: string }) {
      return (
        <ResourceResultNavigation
          requestKey={requestKey}
          result={{ label: 'Object', provenance: 'Provider / route', resource: { id: 'opaque' } }}
          context={{ workspace: 'explore' }}
          onNavigate={onNavigate}
        />
      );
    }
    const { rerender } = renderWithTheme(<Inline requestKey="destination/context-1" />);
    await userEvent.click(screen.getByRole('button', { name: 'Open Object' }));
    rerender(<Inline requestKey="destination/context-1" />);
    expect(signal?.aborted).toBe(false);
    expect(screen.getByRole('button', { name: 'Cancel navigation' })).toBeInTheDocument();
    rerender(<Inline requestKey="destination/context-2" />);
    expect(signal?.aborted).toBe(true);
    await act(async () =>
      gate.resolve({ status: 'success', message: 'Old destination completed' }),
    );
    expect(screen.queryByText('Old destination completed')).not.toBeInTheDocument();
  });

  it.each(['constructor', 'toString', '__proto__'])(
    'treats opaque dimension %s as an own entry rather than an inherited value',
    async (dimensionId) => {
      function Harness() {
        const [value, setValue] = useState<readonly ResourceScopeSelection[]>([]);
        return (
          <>
            <ResourceScopePicker
              targets={[
                {
                  id: 'target',
                  provider: 'Provider',
                  connection: 'Route',
                  resourceType: 'Objects',
                  dimensions: [
                    {
                      id: dimensionId,
                      label: 'Opaque dimension',
                      values: [{ id: 'one', label: 'Value one' }],
                    },
                  ],
                },
              ]}
              value={value}
              onChange={setValue}
            />
            <output aria-label="Selection">{JSON.stringify(value)}</output>
          </>
        );
      }
      renderWithTheme(<Harness />);
      await userEvent.click(screen.getByRole('checkbox', { name: 'Objects — Route' }));
      expect(
        screen.getByText('No selection; the host must resolve this scope.'),
      ).toBeInTheDocument();
      await userEvent.click(screen.getByRole('checkbox', { name: 'Value one' }));
      const selected: unknown = JSON.parse(
        screen.getByLabelText('Selection').textContent ?? 'null',
      );
      expect(selected).toEqual([{ targetId: 'target', dimensions: { [dimensionId]: ['one'] } }]);
    },
  );

  it('permits removing a selected unavailable value while forbidding adding another unavailable value', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ResourceScopePicker
        targets={[
          {
            id: 'target',
            provider: 'Provider',
            connection: 'Route',
            resourceType: 'Objects',
            dimensions: [
              {
                id: 'project',
                label: 'Project',
                values: [
                  { id: 'a', label: 'Unavailable selected', disabledReason: 'Access removed' },
                  { id: 'b', label: 'Available' },
                  { id: 'c', label: 'Unavailable unselected', disabledReason: 'Not selectable' },
                ],
              },
            ],
          },
        ]}
        value={[{ targetId: 'target', dimensions: { project: ['a', 'b'], region: ['west'] } }]}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('checkbox', { name: /^Unavailable selected/ })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await userEvent.click(screen.getByRole('checkbox', { name: /^Unavailable selected/ }));
    expect(onChange).toHaveBeenCalledWith([
      { targetId: 'target', dimensions: { project: ['b'], region: ['west'] } },
    ]);
    await userEvent.click(screen.getByRole('checkbox', { name: /^Unavailable unselected/ }));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('requires destructive confirmation, supports cancelling it, and forwards only the selected saved ID', async () => {
    const onAction = vi.fn<
      (action: SavedResourceAction<string>, signal: AbortSignal) => Promise<WorkspaceActionResult>
    >(async () => ({ status: 'success', message: 'Deleted by host' }));
    renderWithTheme(<DeleteHarness onAction={onAction} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete query' }));
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Saved query');
    await userEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel deletion' }),
    );
    expect(onAction).not.toHaveBeenCalled();
    await confirmDelete();
    expect(onAction).toHaveBeenCalledWith({ type: 'delete', id: 'saved' }, expect.any(AbortSignal));
    expect(await screen.findByText('Deleted by host')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Query name' })).toHaveValue('Unsaved name');
    expect(screen.getByRole('textbox', { name: 'Import document' })).toHaveValue(
      'Unparsed import draft',
    );
  });

  it('cancels pending deletion and ignores late failure without losing edits made while pending', async () => {
    const gate = Promise.withResolvers<WorkspaceActionResult>();
    let signal: AbortSignal | undefined;
    renderWithTheme(
      <DeleteHarness
        onAction={(...args) => {
          signal = args[1];
          return gate.promise;
        }}
      />,
    );
    await confirmDelete();
    await userEvent.type(screen.getByRole('textbox', { name: 'Query name' }), ' edited');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel operation' }));
    expect(signal?.aborted).toBe(true);
    await act(async () => gate.resolve({ status: 'error', message: 'Late delete failed' }));
    expect(screen.queryByText('Late delete failed')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Query name' })).toHaveValue('Unsaved name edited');
    expect(screen.getByRole('button', { name: 'Delete query' })).toBeEnabled();
  });

  it('reports host deletion failure and preserves the saved selection and both drafts', async () => {
    renderWithTheme(
      <DeleteHarness
        onAction={async () => ({
          status: 'conflict',
          message: 'Host refused deletion; newer saved revision exists',
        })}
      />,
    );
    await confirmDelete();
    expect(await screen.findByRole('alert')).toHaveTextContent('Host refused deletion');
    expect(screen.getByRole('combobox', { name: 'Saved query' })).toHaveValue('saved');
    expect(screen.getByRole('textbox', { name: 'Query name' })).toHaveValue('Unsaved name');
    expect(screen.getByRole('textbox', { name: 'Import document' })).toHaveValue(
      'Unparsed import draft',
    );
  });
  it.each(['disabled', 'loading'] as const)(
    'blocks confirmation when host %s changes while the dialog is open, without blocking cancellation',
    async (lock) => {
      const onAction = vi.fn<
        (action: SavedResourceAction<string>, signal: AbortSignal) => Promise<WorkspaceActionResult>
      >(async () => ({ status: 'success' }));
      const renderManager = (locked: boolean) => (
        <SavedResourceManager
          kind="query"
          items={[{ id: 'saved', name: 'Saved query' }]}
          selectedId="saved"
          draft="Opaque draft"
          nameDraft="Kept name"
          onNameDraftChange={vi.fn()}
          importDraft="Kept import"
          onImportDraftChange={vi.fn()}
          dirty
          onAction={onAction}
          disabled={lock === 'disabled' && locked}
          loading={lock === 'loading' && locked}
        />
      );
      const { rerender } = renderWithTheme(renderManager(false));
      await userEvent.click(screen.getByRole('button', { name: 'Delete query' }));
      rerender(renderManager(true));
      const dialog = screen.getByRole('alertdialog');
      const confirm = within(dialog).getByRole('button', { name: 'Confirm delete query' });
      expect(confirm).toBeDisabled();
      await userEvent.click(confirm);
      expect(onAction).not.toHaveBeenCalled();
      const cancel = within(dialog).getByRole('button', { name: 'Cancel deletion' });
      expect(cancel).toBeEnabled();
      await userEvent.click(cancel);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(onAction).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox', { name: 'Query name' })).toHaveValue('Kept name');
      expect(screen.getByRole('textbox', { name: 'Import document' })).toHaveValue('Kept import');
    },
  );
});
