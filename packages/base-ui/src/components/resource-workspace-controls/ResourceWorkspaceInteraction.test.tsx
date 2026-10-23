/// <reference lib="es2024.promise" />
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ResourceGroupingControls } from './ResourceGroupingControls';
import { ResourceScopePicker } from './ResourceScopePicker';
import { ResourceSearchResults } from './ResourceSearchResults';
import { SavedResourceManager } from './SavedResourceManager';
import type { ResourceScopeSelection, ResourceSearchItem, WorkspaceActionResult } from './types';

const searchItems = [
  {
    id: 'r',
    kind: 'resource' as const,
    label: 'Resource',
    provenance: 'Provider / account',
    payload: 'opaque',
  },
];

describe('workspace interaction boundaries', () => {
  it('does not widen an explicitly empty dimension and allows selecting any only by an explicit action', async () => {
    function Harness() {
      const [value, setValue] = useState<readonly ResourceScopeSelection[]>([
        { targetId: 'target', dimensions: { project: [] } },
      ]);
      return (
        <>
          <ResourceScopePicker
            targets={[
              {
                id: 'target',
                provider: 'Provider',
                connection: 'Account',
                resourceType: 'Objects',
                dimensions: [
                  {
                    id: 'project',
                    label: 'Project',
                    allowAny: true,
                    values: [{ id: 'a', label: 'Project A' }],
                  },
                ],
              },
            ]}
            value={value}
            onChange={setValue}
          />
          <output>{JSON.stringify(value)}</output>
        </>
      );
    }
    renderWithTheme(<Harness />);
    expect(
      screen.getByText('No values selected; this never means all values.'),
    ).toBeInTheDocument();
    screen.getByRole('checkbox', { name: 'Any permitted Project' }).focus();
    await userEvent.keyboard(' ');
    expect(
      screen.getByText('[{"targetId":"target","dimensions":{"project":"any"}}]'),
    ).toBeInTheDocument();
    await userEvent.keyboard(' ');
    expect(
      screen.getByText('[{"targetId":"target","dimensions":{"project":[]}}]'),
    ).toBeInTheDocument();
  });

  it('offers keyboard reordering without interpreting field names', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ResourceGroupingControls
        fields={[
          { id: 'first', label: 'First', groupable: true, splittable: true },
          { id: 'second', label: 'Second', groupable: true, splittable: true },
        ]}
        value={{ groupBy: ['first', 'second'], splitBy: [] }}
        onChange={onChange}
      />,
    );
    screen.getByRole('button', { name: 'Move group by Second earlier' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith({ groupBy: ['second', 'first'], splitBy: [] });
  });

  it('cancels activation when controlled search changes and rejects a stale action completion', async () => {
    const gate = Promise.withResolvers<WorkspaceActionResult>();
    let signal: AbortSignal | undefined;
    const onActivate = vi.fn((item: ResourceSearchItem<string>, next: AbortSignal) => {
      expect(item.payload).toBe('opaque');
      signal = next;
      return gate.promise;
    });
    const { rerender } = renderWithTheme(
      <ResourceSearchResults
        query="old"
        onQueryChange={vi.fn()}
        items={searchItems}
        onActivate={onActivate}
      />,
    );
    screen.getByRole('searchbox').focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('button', { name: 'Cancel action' })).toBeInTheDocument();
    rerender(
      <ResourceSearchResults
        query="new"
        onQueryChange={vi.fn()}
        items={searchItems}
        onActivate={onActivate}
      />,
    );
    expect(signal?.aborted).toBe(true);
    await act(async () => gate.resolve({ status: 'success', message: 'Stale destination opened' }));
    expect(screen.queryByText('Stale destination opened')).not.toBeInTheDocument();
  });

  it('prevents stale/denied resource activation and supports Escape dismissal', async () => {
    const onActivate = vi.fn(async () => ({ status: 'success' as const }));
    const onDismiss = vi.fn();
    renderWithTheme(
      <ResourceSearchResults
        query=""
        onQueryChange={vi.fn()}
        items={searchItems}
        stale
        onActivate={onActivate}
        onDismiss={onDismiss}
      />,
    );
    screen.getByRole('searchbox').focus();
    await userEvent.keyboard('{ArrowDown}{Enter}{Escape}');
    expect(onActivate).not.toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows loading and host errors without discarding healthy external results', () => {
    renderWithTheme(
      <ResourceSearchResults
        query="q"
        onQueryChange={vi.fn()}
        items={searchItems}
        loading
        error="One provider denied the query"
        onActivate={async () => ({ status: 'success' })}
      />,
    );
    expect(screen.getByText('Resource')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('One provider denied the query');
    expect(screen.getByText('Searching selected sources…')).toBeInTheDocument();
  });

  it('keeps draft controls usable after rejected host callbacks', async () => {
    renderWithTheme(
      <SavedResourceManager
        kind="preset"
        items={[]}
        selectedId={null}
        nameDraft="Kept"
        onNameDraftChange={vi.fn()}
        importDraft="unparsed"
        onImportDraftChange={vi.fn()}
        draft="opaque"
        dirty
        onAction={async () => {
          throw new Error('Host disconnected');
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Host disconnected');
    expect(screen.getByRole('textbox', { name: 'Preset name' })).toHaveValue('Kept');
    expect(screen.getByRole('button', { name: 'Create preset' })).toBeEnabled();
  });
});
