import { useEffect, type ReactNode } from 'react';
import { Button } from '../button/Button';
import { CommandList } from '../command-list/CommandList';
import type { ResourceSearchItem, WorkspaceActionResult } from './types';
import { useWorkspaceAction } from './useWorkspaceAction';
import styles from './ResourceWorkspaceControls.module.css';

export interface ResourceSearchResultsProps<TPayload> {
  query: string;
  onQueryChange: (query: string) => void;
  items: readonly ResourceSearchItem<TPayload>[];
  onActivate: (
    item: ResourceSearchItem<TPayload>,
    signal: AbortSignal,
  ) => Promise<WorkspaceActionResult>;
  onDismiss?: () => void;
  loading?: boolean;
  error?: string;
  /** Host-supplied permission, freshness, partial-source and bounded-result explanations. */
  status?: ReactNode;
  scopeStatus?: ReactNode;
  /** The host can disable older results while replacing its query generation. */
  stale?: boolean;
}

const groupLabels: Readonly<Record<string, string>> = {
  command: 'Commands',
  setting: 'Settings',
  navigation: 'Navigation',
  resource: 'Resources',
};

export function ResourceSearchResults<TPayload>({
  query,
  onQueryChange,
  items,
  onActivate,
  onDismiss,
  loading,
  error,
  status,
  scopeStatus,
  stale,
}: ResourceSearchResultsProps<TPayload>) {
  const action = useWorkspaceAction();
  const { cancel } = action;
  useEffect(() => cancel, [query, stale, cancel]);
  return (
    <section
      className={styles.Root}
      aria-label="Command and resource search"
      aria-busy={loading || action.pending}
    >
      <CommandList.Root
        aria-label="Search results"
        items={items}
        itemKey={(item) => item.id}
        query={query}
        onQueryChange={(next) => {
          action.cancel();
          onQueryChange(next);
        }}
        groupBy={(item) => item.kind}
        groupLabel={(key) => groupLabels[key] ?? key}
        groupOrder={['command', 'setting', 'navigation', 'resource']}
        disabledKeys={items
          .filter((item) => item.disabledReason || stale || action.pending)
          .map((item) => item.id)}
        loading={loading}
        onDismiss={() => {
          action.cancel();
          onDismiss?.();
        }}
        onAction={(_key, item) => {
          if (!item.disabledReason && !stale) void action.run((signal) => onActivate(item, signal));
        }}
        renderItem={(item, meta) => (
          <CommandList.Item itemKey={meta.key} disabled={meta.isDisabled}>
            {item.decoration ? (
              <CommandList.ItemIcon>{item.decoration}</CommandList.ItemIcon>
            ) : null}
            <CommandList.ItemLabel>{item.label}</CommandList.ItemLabel>
            {item.description ? (
              <CommandList.ItemDescription>{item.description}</CommandList.ItemDescription>
            ) : null}
            {item.provenance ? (
              <CommandList.ItemDescription>{item.provenance}</CommandList.ItemDescription>
            ) : null}
            {item.disabledReason ? (
              <CommandList.ItemDescription>{item.disabledReason}</CommandList.ItemDescription>
            ) : null}
          </CommandList.Item>
        )}
      >
        <CommandList.Input
          role="searchbox"
          aria-label="Search commands, settings, navigation and resources"
          placeholder="Search commands, settings and resources…"
        />
        <CommandList.Results />
      </CommandList.Root>
      {items.length === 0 && !loading && !error ? (
        <p role="status">No results in the selected sources.</p>
      ) : null}
      {loading ? <p role="status">Searching selected sources…</p> : null}
      {stale ? <p role="status">Previous results; waiting for the current search.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {status ? <div role="status">{status}</div> : null}
      {scopeStatus}
      {action.pending ? (
        <Button size="sm" onClick={action.cancel}>
          Cancel action
        </Button>
      ) : null}
      {action.result ? (
        <p role={action.result.status === 'success' ? 'status' : 'alert'}>
          {action.result.message ?? action.result.status}
        </p>
      ) : null}
    </section>
  );
}
