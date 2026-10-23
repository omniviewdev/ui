import { useState } from 'react';
import { act, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { QueryExplainPanel } from './QueryExplainPanel';
import { ResourceIndexManager } from './ResourceIndexManager';
import { RelationshipRuleEditor } from './RelationshipRuleEditor';
import { RelationshipPreview } from './RelationshipPreview';
import type { InspectorAsyncContext, RelationshipRuleDraft, ResourceIndexAction } from './types';
import {
  exampleExplain,
  exampleIndex,
  exampleProposal,
  exampleAdvice,
  exampleRule,
  exampleCatalog,
  examplePreview,
} from './fixtures';

describe('QueryExplainPanel', () => {
  it('distinguishes observed work, estimates, scope, coverage and host plan selection', () => {
    renderWithTheme(<QueryExplainPanel explain={exampleExplain} />);
    expect(screen.getByText('Snapshot only; refresh required')).toBeVisible();
    expect(screen.getByText('Partial: 400 of unknown total')).toBeVisible();
    expect(screen.getByText('Selective tag lookup')).toBeVisible();
    expect(screen.getByText('Observed: 12 candidates')).toBeVisible();
    expect(screen.getByText('Estimated: 4 ms')).toBeVisible();
    expect(screen.getByText(/Host sample of 80 resources/)).toBeVisible();
  });

  it.each(['loading', 'denied', 'unavailable'] as const)(
    'does not display stale plans when %s',
    (state) => {
      renderWithTheme(<QueryExplainPanel explain={exampleExplain} state={state} />);
      expect(screen.getByRole('status')).toBeVisible();
      expect(screen.queryByText('Observed: 12 candidates')).not.toBeInTheDocument();
    },
  );
});

describe('ResourceIndexManager', () => {
  it('shows actual and estimated footprints without inventing disk storage', () => {
    renderWithTheme(
      <ResourceIndexManager
        indexes={[exampleIndex]}
        proposals={[]}
        advice={[]}
        onAction={vi.fn()}
      />,
    );
    expect(screen.getByText('Actual: 8 KiB')).toBeVisible();
    expect(screen.getByText('Retained heap sample')).toBeVisible();
    expect(screen.getByText('Not applicable: Memory-only index; no disk storage')).toBeVisible();
    expect(screen.getByText('schema-cloud@3')).toBeVisible();
    expect(screen.getByText('Document path')).toBeVisible();
  });

  it('requires explicit creation approval and displays evidence without promising a speedup', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn().mockResolvedValue(undefined);
    renderWithTheme(
      <ResourceIndexManager
        indexes={[]}
        proposals={[exampleProposal]}
        advice={[exampleAdvice]}
        onAction={onAction}
      />,
    );
    expect(
      screen.getByText('Benefit is not guaranteed; compare before/after measurements.'),
    ).toBeVisible();
    expect(screen.getByText('Estimated: 16 KiB')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Review creation' }));
    expect(onAction).not.toHaveBeenCalled();
    const approval = screen.getByRole('region', { name: 'Approve create' });
    await user.click(within(approval).getByRole('button', { name: 'Approve create' }));
    expect(onAction).toHaveBeenCalledWith(
      { kind: 'create', definition: exampleProposal },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('warns about referenced views and scan fallback before dropping; failure preserves approval', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <ResourceIndexManager
        indexes={[exampleIndex]}
        proposals={[]}
        advice={[]}
        onAction={async () => {
          throw new Error('Permission denied');
        }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Drop cloud-tags' }));
    const approval = screen.getByRole('region', { name: 'Approve drop' });
    expect(within(approval).getByText(/Referenced by: Fleet view/)).toBeVisible();
    expect(within(approval).getByText(/scan fallback/)).toBeVisible();
    await user.click(within(approval).getByRole('button', { name: 'Approve drop' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Permission denied');
    expect(screen.getByRole('region', { name: 'Approve drop' })).toBeVisible();
  });

  it('prevents duplicate approvals while pending and allows host build cancellation', async () => {
    const user = userEvent.setup();
    let resolveAction: (() => void) | undefined;
    const onAction = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve;
        }),
    );
    const building = {
      ...exampleIndex,
      state: 'building' as const,
      operation: { id: 'op-1', label: 'Catching up', progress: 42, cancellable: true },
    };
    const { rerender } = renderWithTheme(
      <ResourceIndexManager
        indexes={[exampleIndex]}
        proposals={[]}
        advice={[]}
        onAction={onAction}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Rebuild cloud-tags' }));
    await user.click(screen.getByRole('button', { name: 'Approve rebuild' }));
    expect(screen.getByRole('button', { name: 'Approving…' })).toBeDisabled();
    await act(async () => {
      resolveAction?.();
    });
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Approve rebuild' })).not.toBeInTheDocument(),
    );
    rerender(
      <ResourceIndexManager indexes={[building]} proposals={[]} advice={[]} onAction={onAction} />,
    );
    expect(screen.getByRole('progressbar', { name: 'cloud-tags build progress' })).toHaveAttribute(
      'aria-valuenow',
      '42',
    );
    await user.click(screen.getByRole('button', { name: 'Cancel build cloud-tags' }));
    expect(onAction).toHaveBeenLastCalledWith(
      { kind: 'cancel', operationId: 'op-1' },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    await act(async () => {
      resolveAction?.();
    });
  });

  it('shows build failures, prior-generation fallback and unavailable footprints', () => {
    renderWithTheme(
      <ResourceIndexManager
        indexes={[
          {
            ...exampleIndex,
            state: 'failed',
            failure: 'Quota exceeded',
            fallback: 'Previous generation remains active',
            memory: { kind: 'unavailable', reason: 'Measurement unavailable' },
          },
        ]}
        proposals={[]}
        advice={[]}
        onAction={vi.fn()}
      />,
    );
    expect(screen.getByText('Quota exceeded')).toBeVisible();
    expect(screen.getByText('Previous generation remains active')).toBeVisible();
    expect(screen.getByText('Unavailable: Measurement unavailable')).toBeVisible();
  });

  it('invalidates approval when the host removes permission', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { rerender } = renderWithTheme(
      <ResourceIndexManager
        indexes={[exampleIndex]}
        proposals={[]}
        advice={[]}
        onAction={onAction}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Drop cloud-tags' }));
    rerender(
      <ResourceIndexManager
        indexes={[{ ...exampleIndex, actions: [] }]}
        proposals={[]}
        advice={[]}
        onAction={onAction}
      />,
    );
    expect(screen.getByRole('button', { name: 'Approve drop' })).toBeDisabled();
    expect(screen.getByText(/This action is no longer available/)).toBeVisible();
    expect(onAction).not.toHaveBeenCalled();
  });

  it.each([
    'scope',
    'schema',
    'storage',
    'dataPolicy',
    'provider',
    'resourceType',
    'path',
  ] as const)('invalidates same-ID create approval when reviewed %s changes', async (field) => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const props = { indexes: [], advice: [], onAction };
    const { rerender } = renderWithTheme(
      <ResourceIndexManager {...props} proposals={[exampleProposal]} />,
    );
    await user.click(screen.getByRole('button', { name: 'Review creation' }));
    const replacement = {
      ...exampleProposal,
      [field]: field === 'storage' ? ('persisted' as const) : 'Changed after review',
    };
    rerender(<ResourceIndexManager {...props} proposals={[replacement]} />);
    expect(screen.getByRole('button', { name: 'Approve create' })).toBeDisabled();
    expect(screen.getByText(/reviewed index definition changed/i)).toBeVisible();
    expect(onAction).not.toHaveBeenCalled();
    const approval = screen.getByRole('region', { name: 'Approve create' });
    expect(within(approval).getByText(exampleProposal.scope)).toBeVisible();
  });

  it.each(['rebuild', 'drop'] as const)(
    'invalidates %s approval when same-ID target identity changes',
    async (kind) => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const props = { proposals: [], advice: [], onAction };
      const { rerender } = renderWithTheme(
        <ResourceIndexManager {...props} indexes={[exampleIndex]} />,
      );
      await user.click(
        screen.getByRole('button', { name: `${kind === 'drop' ? 'Drop' : 'Rebuild'} cloud-tags` }),
      );
      rerender(
        <ResourceIndexManager
          {...props}
          indexes={[{ ...exampleIndex, scope: 'A different account' }]}
        />,
      );
      expect(screen.getByRole('button', { name: `Approve ${kind}` })).toBeDisabled();
      expect(screen.getByText(/reviewed index definition changed/i)).toBeVisible();
      expect(onAction).not.toHaveBeenCalled();
    },
  );

  it('does not resurrect an aborted approval request after ready → loading → ready', async () => {
    const user = userEvent.setup();
    let signal: AbortSignal | undefined;
    let rejectRequest: ((reason: Error) => void) | undefined;
    const onAction = vi.fn((_action: ResourceIndexAction, context: InspectorAsyncContext) => {
      signal = context.signal;
      return new Promise<void>((_resolve, reject) => {
        rejectRequest = reject;
      });
    });
    const props = { indexes: [exampleIndex], proposals: [], advice: [], onAction };
    const { rerender } = renderWithTheme(<ResourceIndexManager {...props} />);
    await user.click(screen.getByRole('button', { name: 'Rebuild cloud-tags' }));
    await user.click(screen.getByRole('button', { name: 'Approve rebuild' }));
    rerender(<ResourceIndexManager {...props} state="loading" />);
    expect(signal?.aborted).toBe(true);
    rerender(<ResourceIndexManager {...props} state="ready" />);
    expect(screen.getByRole('button', { name: 'Approve rebuild' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeEnabled();
    await act(async () => {
      rejectRequest?.(new Error('Late aborted approval'));
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('interrupts a pending rebuild request to dispatch host build cancellation', async () => {
    const user = userEvent.setup();
    let rebuildSignal: AbortSignal | undefined;
    const onAction = vi.fn((request: ResourceIndexAction, context: InspectorAsyncContext) => {
      if (request.kind === 'cancel') return Promise.resolve();
      rebuildSignal = context.signal;
      return new Promise<void>(() => {});
    });
    const props = { proposals: [], advice: [], onAction };
    const { rerender } = renderWithTheme(
      <ResourceIndexManager {...props} indexes={[exampleIndex]} />,
    );
    await user.click(screen.getByRole('button', { name: 'Rebuild cloud-tags' }));
    await user.click(screen.getByRole('button', { name: 'Approve rebuild' }));
    rerender(
      <ResourceIndexManager
        {...props}
        indexes={[
          {
            ...exampleIndex,
            state: 'building',
            operation: {
              id: 'early-build',
              label: 'Started before request settled',
              cancellable: true,
            },
          },
        ]}
      />,
    );
    const cancel = screen.getByRole('button', { name: 'Cancel build cloud-tags' });
    expect(cancel).toBeEnabled();
    await user.click(cancel);
    expect(rebuildSignal?.aborted).toBe(true);
    expect(onAction).toHaveBeenLastCalledWith(
      { kind: 'cancel', operationId: 'early-build' },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it.each(['create', 'drop', 'other-rebuild'] as const)(
    'preserves an unrelated pending %s request instead of aborting it to cancel a build',
    async (pendingKind) => {
      const user = userEvent.setup();
      let signal: AbortSignal | undefined;
      let resolveRequest: (() => void) | undefined;
      const onAction = vi.fn((_request: ResourceIndexAction, context: InspectorAsyncContext) => {
        signal = context.signal;
        return new Promise<void>((resolve) => {
          resolveRequest = resolve;
        });
      });
      renderWithTheme(
        <ResourceIndexManager
          indexes={[
            {
              ...exampleIndex,
              state: 'building',
              operation: { id: 'existing-build', label: 'Existing host build', cancellable: true },
            },
            { ...exampleIndex, id: 'other-index', label: 'other-index' },
          ]}
          proposals={[exampleProposal]}
          advice={[]}
          onAction={onAction}
        />,
      );
      const kind = pendingKind === 'other-rebuild' ? 'rebuild' : pendingKind;
      await user.click(
        screen.getByRole('button', {
          name:
            pendingKind === 'create'
              ? 'Review creation'
              : pendingKind === 'drop'
                ? 'Drop cloud-tags'
                : 'Rebuild other-index',
        }),
      );
      await user.click(screen.getByRole('button', { name: `Approve ${kind}` }));
      const cancel = screen.getByRole('button', { name: 'Cancel build cloud-tags' });
      expect(cancel).toBeDisabled();
      await user.click(cancel);
      expect(signal?.aborted).toBe(false);
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Approving…' })).toBeDisabled();
      await act(async () => {
        resolveRequest?.();
      });
      expect(screen.queryByRole('region', { name: `Approve ${kind}` })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel build cloud-tags' })).toBeEnabled();
    },
  );

  it.each(['loading', 'denied', 'unavailable'] as const)(
    'hides inventory actions when %s',
    (state) => {
      renderWithTheme(
        <ResourceIndexManager
          indexes={[exampleIndex]}
          proposals={[exampleProposal]}
          advice={[exampleAdvice]}
          onAction={vi.fn()}
          state={state}
        />,
      );
      expect(screen.getByRole('status')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Drop cloud-tags' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Review creation' })).not.toBeInTheDocument();
    },
  );
});

function RuleHarness({
  onSave = async () => {},
  onPreview = async () => {},
  onSetEnabled = async () => {},
}: {
  onSave?: (draft: RelationshipRuleDraft) => Promise<void>;
  onPreview?: (draft: RelationshipRuleDraft, context: InspectorAsyncContext) => Promise<void>;
  onSetEnabled?: (enabled: boolean) => Promise<void>;
}) {
  const [draft, setDraft] = useState(exampleRule);
  return (
    <RelationshipRuleEditor
      draft={draft}
      catalog={exampleCatalog}
      onChange={setDraft}
      onSave={onSave}
      onPreview={onPreview}
      onSetEnabled={onSetEnabled}
      validation={{ state: 'valid', diagnostics: [] }}
      preview={examplePreview}
    />
  );
}

describe('RelationshipRuleEditor', () => {
  it('edits typed conditions, explicit scope mapping and cardinality without inferring identities', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderWithTheme(<RuleHarness onSave={onSave} />);
    await user.selectOptions(screen.getByLabelText('Scope mapping'), 'cross-account');
    await user.selectOptions(screen.getByLabelText('Cardinality'), 'many-to-one');
    await user.selectOptions(screen.getByLabelText('Source field 1'), 'image');
    await user.click(screen.getByRole('button', { name: 'Save rule' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scopeMappingId: 'cross-account',
        cardinality: 'many-to-one',
        conditions: [{ ...exampleRule.conditions[0], sourceFieldId: 'image' }],
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(screen.getByText('Image identifier · string')).toBeInTheDocument();
  });

  it('adds and removes condition rows and sends current controlled draft for preview', async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn().mockResolvedValue(undefined);
    renderWithTheme(<RuleHarness onPreview={onPreview} />);
    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    expect(screen.getByLabelText('Source field 2')).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Remove condition 2' }));
    await user.click(screen.getByRole('button', { name: 'Preview rule' }));
    expect(onPreview).toHaveBeenCalledWith(
      exampleRule,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('preserves edited draft after failed save and reports failure', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <RuleHarness
        onSave={async () => {
          throw new Error('Scope denied');
        }}
      />,
    );
    await user.clear(screen.getByLabelText('Rule name'));
    await user.type(screen.getByLabelText('Rule name'), 'Keep this draft');
    await user.click(screen.getByRole('button', { name: 'Save rule' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Scope denied');
    expect(screen.getByLabelText('Rule name')).toHaveValue('Keep this draft');
  });

  it('disables duplicate actions while awaiting enable approval and never toggles optimistically', async () => {
    const user = userEvent.setup();
    let rejectAction: ((reason: Error) => void) | undefined;
    renderWithTheme(
      <RuleHarness
        onSetEnabled={() =>
          new Promise<void>((_resolve, reject) => {
            rejectAction = reject;
          })
        }
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Disable rule' }));
    expect(screen.getByRole('button', { name: 'Updating…' })).toBeDisabled();
    expect(screen.getByText('Enabled')).toBeVisible();
    rejectAction?.(new Error('Update failed'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Update failed');
    expect(screen.getByRole('button', { name: 'Disable rule' })).toBeEnabled();
  });

  it('shows host validation errors and blocks save while unvalidated', () => {
    renderWithTheme(
      <RelationshipRuleEditor
        draft={exampleRule}
        catalog={exampleCatalog}
        onChange={vi.fn()}
        onSave={vi.fn()}
        onPreview={vi.fn()}
        onSetEnabled={vi.fn()}
        validation={{
          state: 'invalid',
          diagnostics: [{ id: 'bad', severity: 'error', message: 'Incompatible field types' }],
        }}
      />,
    );
    expect(screen.getByText('Incompatible field types')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save rule' })).toBeDisabled();
  });

  it('cancels preview requests and ignores late failures from canceled requests', async () => {
    const user = userEvent.setup();
    let rejectPreview: ((reason: Error) => void) | undefined;
    let signal: AbortSignal | undefined;
    renderWithTheme(
      <RuleHarness
        onPreview={(_draft, context) => {
          signal = context.signal;
          return new Promise<void>((_resolve, reject) => {
            rejectPreview = reject;
          });
        }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Preview rule' }));
    await user.click(screen.getByRole('button', { name: 'Cancel preview request' }));
    expect(signal?.aborted).toBe(true);
    rejectPreview?.(new Error('Late stale failure'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Preview rule' })).toBeEnabled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('retains unavailable fields rather than silently changing the controlled draft', () => {
    renderWithTheme(
      <RelationshipRuleEditor
        draft={{
          ...exampleRule,
          conditions: [{ ...exampleRule.conditions[0]!, sourceFieldId: 'removed-field' }],
        }}
        catalog={exampleCatalog}
        onChange={vi.fn()}
        onSave={vi.fn()}
        onPreview={vi.fn()}
        onSetEnabled={vi.fn()}
        validation={{ state: 'unchecked', diagnostics: [] }}
      />,
    );
    expect(screen.getByLabelText('Source field 1')).toHaveValue('removed-field');
    expect(screen.getByText('removed-field (unavailable; retained in draft)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save rule' })).toBeDisabled();
  });

  it('keeps provider rules read-only and hides unconfirmed previews', () => {
    renderWithTheme(
      <RelationshipRuleEditor
        draft={{ ...exampleRule, origin: 'provider' }}
        catalog={exampleCatalog}
        onChange={vi.fn()}
        onSave={vi.fn()}
        onPreview={vi.fn()}
        onSetEnabled={vi.fn()}
        validation={{ state: 'valid', diagnostics: [] }}
        preview={examplePreview}
      />,
    );
    expect(screen.getByLabelText('Rule name')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save rule' })).toBeDisabled();
    expect(screen.queryByText(/Bounded preview: 4 edges/)).not.toBeInTheDocument();
    expect(screen.getByText(/Previous preview is not confirmed/)).toBeVisible();
  });

  it.each(['denied', 'unavailable', 'loading'] as const)(
    'suppresses cached confirmed preview and navigation when editor becomes %s',
    (state) => {
      const props = {
        draft: exampleRule,
        catalog: exampleCatalog,
        onChange: vi.fn(),
        onSave: vi.fn(),
        onPreview: vi.fn(),
        onSetEnabled: vi.fn(),
        validation: { state: 'valid' as const, diagnostics: [] },
        preview: examplePreview,
        previewIsCurrent: true,
        onNavigate: vi.fn(),
      };
      const { rerender } = renderWithTheme(<RelationshipRuleEditor {...props} />);
      expect(screen.getByRole('button', { name: 'Open VM alpha' })).toBeEnabled();
      rerender(<RelationshipRuleEditor {...props} state={state} />);
      expect(screen.queryByRole('button', { name: 'Open VM alpha' })).not.toBeInTheDocument();
      expect(screen.queryByText('Provider-defined · Built-in ownership')).not.toBeInTheDocument();
      expect(screen.queryByText(examplePreview.scope)).not.toBeInTheDocument();
    },
  );

  it('supports keyboard preview activation and aborts stale draft request errors', async () => {
    const user = userEvent.setup();
    let rejectPreview: ((reason: Error) => void) | undefined;
    let signal: AbortSignal | undefined;
    const onPreview = vi.fn((_draft: RelationshipRuleDraft, context: InspectorAsyncContext) => {
      signal = context.signal;
      return new Promise<void>((_resolve, reject) => {
        rejectPreview = reject;
      });
    });
    const props = {
      catalog: exampleCatalog,
      onChange: vi.fn(),
      onSave: vi.fn(),
      onPreview,
      onSetEnabled: vi.fn(),
      validation: { state: 'valid' as const, diagnostics: [] },
    };
    const { rerender } = renderWithTheme(<RelationshipRuleEditor {...props} draft={exampleRule} />);
    screen.getByRole('button', { name: 'Preview rule' }).focus();
    await user.keyboard('{Enter}');
    expect(onPreview).toHaveBeenCalledTimes(1);
    rerender(
      <RelationshipRuleEditor
        {...props}
        draft={{ ...exampleRule, name: 'A different host draft' }}
      />,
    );
    expect(signal?.aborted).toBe(true);
    rejectPreview?.(new Error('Old draft error'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Preview rule' })).toBeEnabled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('RelationshipPreview', () => {
  it('shows bounded matches, ambiguity and denied/unavailable edges with distinct provenance', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderWithTheme(<RelationshipPreview preview={examplePreview} onNavigate={onNavigate} />);
    expect(screen.getByText(/Bounded preview: 4 edges/)).toBeVisible();
    expect(screen.getByText(/Truncated/)).toBeVisible();
    expect(screen.getByText('Denied')).toBeVisible();
    expect(screen.getByText('Unavailable')).toBeVisible();
    expect(screen.getByText('Target unavailable')).toBeVisible();
    expect(screen.queryByText('No matched target')).not.toBeInTheDocument();
    expect(screen.getByText('Provider-defined · Built-in ownership')).toBeVisible();
    expect(screen.getAllByText('User-defined · Image link')).toHaveLength(3);
    expect(screen.getByText('Multiple targets share the configured key')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Open VM alpha' }));
    expect(onNavigate).toHaveBeenCalledWith('vm-alpha');
    expect(screen.queryByRole('button', { name: /Open Restricted/ })).not.toBeInTheDocument();
  });
});
