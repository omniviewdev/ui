/// <reference lib="es2024.promise" />
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ResourceScopePicker } from './ResourceScopePicker';
import { ResourceGroupingControls } from './ResourceGroupingControls';
import { SavedResourceManager } from './SavedResourceManager';
import { ResourceResultNavigation } from './ResourceResultNavigation';
import { ResourceSearchResults } from './ResourceSearchResults';
import { ExploreWorkspace } from './ExploreWorkspace';
import type { SavedResourceAction, WorkspaceActionResult, ResourceScopeSelection } from './types';

const targets = [
  {
    id: 'cloud/west/vm',
    provider: 'Cloud',
    connection: 'West account',
    resourceType: 'Virtual machines',
    status: 'partial' as const,
    reason: 'Region east timed out',
    dimensions: [{ id: 'region', label: 'Region', values: [{ id: 'west', label: 'West' }] }],
  },
  {
    id: 'engine/local/image',
    provider: 'Engine',
    connection: 'Local engine',
    resourceType: 'Images',
    status: 'denied' as const,
    reason: 'Read access denied',
  },
  {
    id: 'cloud/offline/vm',
    provider: 'Cloud',
    connection: 'Offline account',
    resourceType: 'Virtual machines',
    status: 'offline' as const,
    reason: 'Connection offline',
  },
];

function ScopeHarness() {
  const [value, setValue] = useState<readonly ResourceScopeSelection[]>([]);
  return (
    <>
      <ResourceScopePicker targets={targets} value={value} onChange={setValue} />
      <output>{JSON.stringify(value)}</output>
    </>
  );
}

function ManagerHarness({
  onAction,
}: {
  onAction: (
    action: SavedResourceAction<{ source: string }>,
    signal: AbortSignal,
  ) => Promise<WorkspaceActionResult>;
}) {
  const [name, setName] = useState('Unsaved draft');
  const [importText, setImportText] = useState('opaque host document');
  return (
    <SavedResourceManager
      kind="query"
      items={[{ id: 'saved', name: 'Saved query' }]}
      selectedId="saved"
      nameDraft={name}
      onNameDraftChange={setName}
      importDraft={importText}
      onImportDraftChange={setImportText}
      draft={{ source: 'resource.enabled' }}
      dirty
      onAction={onAction}
    />
  );
}

describe('resource workspace controls', () => {
  it('starts with no scopes and only changes an explicitly selected target', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ScopeHarness />);
    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).not.toBeChecked();
    expect(
      screen.getByText('No sources selected. Select a resource type to begin.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Virtual machines — West account' }));
    expect(screen.getByText('1 source selected')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'West' }));
    expect(screen.getByText('1 source selected')).toBeInTheDocument();
    expect(
      screen.getByText('[{"targetId":"cloud/west/vm","dimensions":{"region":["west"]}}]'),
    ).toBeInTheDocument();
    expect(screen.getByText('Read access denied')).toBeInTheDocument();
    expect(screen.getByText('Connection offline')).toBeInTheDocument();
    expect(screen.getByText('Region east timed out')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Images — Local engine' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('keeps inaccessible selected scopes removable and preserves missing selections', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ResourceScopePicker
        targets={targets}
        value={[
          { targetId: 'engine/local/image', dimensions: {} },
          { targetId: 'missing', dimensions: {} },
        ]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Images — Local engine' }));
    expect(onChange).toHaveBeenCalledWith([{ targetId: 'missing', dimensions: {} }]);
    expect(screen.getByText('Unavailable source: missing')).toBeInTheDocument();
  });

  it('forwards field grouping and retains unavailable selected field explanations', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ResourceGroupingControls
        fields={[
          {
            id: 'account',
            label: 'Account',
            groupable: true,
            splittable: false,
            reason: 'Cannot split this field',
          },
        ]}
        value={{ groupBy: ['missing'], splitBy: [] }}
        onChange={onChange}
      />,
    );
    expect(screen.getByText('Unavailable field: missing')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Group by Account' }));
    expect(onChange).toHaveBeenCalledWith({ groupBy: ['missing', 'account'], splitBy: [] });
    expect(screen.getByRole('checkbox', { name: 'Split by Account' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Split by Account' }));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it.each(['conflict', 'corrupt', 'unsupported'] as const)(
    'preserves editable name and import drafts after host %s',
    async (status) => {
      renderWithTheme(
        <ManagerHarness onAction={async () => ({ status, message: 'Host requires a decision' })} />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Import query' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Host requires a decision');
      expect(screen.getByRole('textbox', { name: 'Query name' })).toHaveValue('Unsaved draft');
      expect(screen.getByRole('textbox', { name: 'Import document' })).toHaveValue(
        'opaque host document',
      );
    },
  );

  it('cancels a pending save and ignores its late completion without losing newer edits', async () => {
    let complete: (value: WorkspaceActionResult) => void = () => {
      throw new Error('Save not started');
    };
    let signal: AbortSignal | undefined;
    const callback = vi.fn(
      (_action: SavedResourceAction<{ source: string }>, nextSignal: AbortSignal) => {
        signal = nextSignal;
        const gate = Promise.withResolvers<WorkspaceActionResult>();
        complete = gate.resolve;
        return gate.promise;
      },
    );
    renderWithTheme(<ManagerHarness onAction={callback} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save query' }));
    expect(callback.mock.calls[0]?.[0]).toEqual({
      type: 'save',
      id: 'saved',
      name: 'Unsaved draft',
      draft: { source: 'resource.enabled' },
    });
    await userEvent.type(screen.getByRole('textbox', { name: 'Query name' }), ' updated');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel operation' }));
    expect(signal?.aborted).toBe(true);
    await act(async () => complete({ status: 'success', message: 'Old save completed' }));
    expect(screen.queryByText('Old save completed')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Query name' })).toHaveValue(
      'Unsaved draft updated',
    );
    expect(screen.getByRole('button', { name: 'Save query' })).toBeEnabled();
  });

  it('forwards create, rename, select, reset and export to the host without transforming documents', async () => {
    const onAction = vi.fn<
      (
        action: SavedResourceAction<{ source: string }>,
        signal: AbortSignal,
      ) => Promise<WorkspaceActionResult>
    >(async () => ({ status: 'success' }));
    renderWithTheme(<ManagerHarness onAction={onAction} />);
    for (const name of [
      'Create query',
      'Rename query',
      'Reset to provider default',
      'Export query',
    ]) {
      await userEvent.click(screen.getByRole('button', { name }));
      await waitFor(() => expect(screen.getByRole('button', { name })).toBeEnabled());
    }
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Saved query' }), '');
    expect(onAction.mock.calls.map((call) => call[0])).toEqual([
      { type: 'create', name: 'Unsaved draft', draft: { source: 'resource.enabled' } },
      { type: 'rename', id: 'saved', name: 'Unsaved draft' },
      { type: 'reset', id: 'saved' },
      { type: 'export', id: 'saved' },
      { type: 'select', id: null },
    ]);
  });

  it('aborts an outstanding host operation on unmount', async () => {
    let signal: AbortSignal | undefined;
    const { unmount } = renderWithTheme(
      <ManagerHarness
        onAction={(_action, nextSignal) => {
          signal = nextSignal;
          return Promise.withResolvers<WorkspaceActionResult>().promise;
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save query' }));
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('navigates with the original opaque result and workspace context by keyboard', async () => {
    const onNavigate = vi.fn(async () => ({ status: 'success' as const }));
    const result = {
      label: 'Database',
      provenance: 'Provider / Account / Region',
      resource: { opaque: 'a/b/1' },
    };
    const context = { queryId: 'q1', cursor: 'opaque/cursor', selectedScopes: ['explicit'] };
    renderWithTheme(
      <ResourceResultNavigation
        requestKey="database/context-1"
        result={result}
        context={context}
        onNavigate={onNavigate}
      />,
    );
    screen.getByRole('button', { name: 'Open Database' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onNavigate).toHaveBeenCalledWith(result, context, expect.any(AbortSignal));
    expect(screen.getByText('Provider / Account / Region')).toBeInTheDocument();
  });

  it('uses host-ranked external search results and explains denied actions with keyboard navigation', async () => {
    const onActivate = vi.fn(async () => ({ status: 'success' as const }));
    renderWithTheme(
      <ResourceSearchResults
        query="database"
        onQueryChange={vi.fn()}
        items={[
          { id: 'settings', kind: 'setting', label: 'Appearance', payload: { route: '/settings' } },
          {
            id: 'blocked',
            kind: 'command',
            label: 'Delete',
            disabledReason: 'Permission denied',
            payload: {},
          },
          {
            id: 'resource',
            kind: 'resource',
            label: 'Opaque resource',
            provenance: 'Engine / local',
            payload: { id: 'native-id' },
          },
        ]}
        onActivate={onActivate}
      />,
    );
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Permission denied')).toBeInTheDocument();
    screen.getByRole('searchbox').focus();
    await userEvent.keyboard('{Home}{Enter}');
    await waitFor(() =>
      expect(onActivate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'settings' }),
        expect.any(AbortSignal),
      ),
    );
  });

  it('composes host authoring, variables, results and save controls without an independent engine', () => {
    renderWithTheme(
      <ExploreWorkspace
        scope={<span>Scope control</span>}
        query={<input aria-label="Host editor" />}
        variables={<span>Host variables</span>}
        results={<span>Host results</span>}
        saveActions={<button>Host save</button>}
      />,
    );
    expect(screen.getByRole('region', { name: 'Explore results' })).toHaveTextContent(
      'Host results',
    );
    expect(screen.getByRole('textbox', { name: 'Host editor' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Explore save actions' })).getByRole('button', {
        name: 'Host save',
      }),
    ).toBeInTheDocument();
  });

  it('omits the save actions group when the host supplies no save controls', () => {
    renderWithTheme(
      <ExploreWorkspace
        scope={<span>Scope control</span>}
        query={<input aria-label="Host editor" />}
        results={<span>Host results</span>}
      />,
    );
    expect(screen.queryByRole('group', { name: 'Explore save actions' })).not.toBeInTheDocument();
  });
});
