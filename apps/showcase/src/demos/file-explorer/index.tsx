import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  FileExplorer,
  FileTree,
  ShortcutSummary,
  Popover,
  useFileSystem,
} from '@omniviewdev/base-ui';
import type { FileExplorerAction, FileNode, FileTreeProps } from '@omniviewdev/base-ui';
import { imageEndpoint, initialExpanded, initialSelection, layers, runtimeEndpoint } from './data';
import { FixtureFileProvider } from './provider';
import { Preview } from './Preview';
import { providerStates, scenarios } from './types';
import type { FixtureMetadata, FixtureOptions, ProviderState, Scenario } from './types';
import styles from './index.module.css';

const shortcuts = [
  { id: 'navigate', keys: ['ArrowUp'], alternatives: [['ArrowDown']], description: 'Navigate' },
  { id: 'expand', keys: ['ArrowRight'], description: 'Expand' },
  { id: 'collapse', keys: ['ArrowLeft'], description: 'Collapse / parent' },
  { id: 'ends', keys: ['Home'], alternatives: [['End']], description: 'First / last' },
  { id: 'open', keys: ['Enter'], description: 'Open' },
  { id: 'space', keys: ['Space'], description: 'Toggle selection' },
  { id: 'toggle', keys: ['Mod', 'Click'], description: 'Toggle selection' },
  { id: 'range', keys: ['Shift', 'Click'], description: 'Select range' },
  { id: 'context', keys: ['Right-click'], description: 'Actions' },
] as const;

function LayerHelp() {
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        render={<button type="button" className={styles.help} aria-label="Layer view help" />}
      >
        ?
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={6}>
          <Popover.Popup role="dialog" aria-label="Layer scope" className={styles.helpPopup}>
            Show all files at the selected layer. Turn off to show only changes in that layer,
            including deleted files.
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ScenarioSurface({
  options,
  layerControls,
}: {
  readonly options: FixtureOptions;
  readonly layerControls?: ReactNode;
}) {
  const provider = useMemo(() => new FixtureFileProvider(options), [options]);
  const initial = initialSelection(options);
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<string>>(
    () => new Set(initial ? [initial] : []),
  );
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        options.scenario === 'States' && options.state === 'permission'
          ? [...initialExpanded, 'root']
          : initialExpanded,
      ),
  );
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState(false);
  const [changed, setChanged] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [eventKind, setEventKind] = useState<'modify' | 'add' | 'remove' | 'move'>('modify');
  const [events, setEvents] = useState<readonly string[]>([]);
  const [contextNode, setContextNode] = useState<FileNode<FixtureMetadata> | null>(null);
  const selectedId = selectedKeys.values().next().value ?? null;
  const fs = useFileSystem({
    provider,
    source: provider.source,
    defaultLive: options.scenario === 'Live watch',
    previewNodeId: selectedId,
    previewEnabled: previewVisible && options.scenario !== 'Tree only',
    readLimit: 8192,
  });
  const {
    nodes: loadedNodes,
    childrenState,
    loadChildren,
    searchState,
    search: searchFiles,
    sync,
  } = fs;
  const selected = fs.nodes.find((node) => node.id === selectedId) ?? null;

  useEffect(() => {
    for (const node of loadedNodes) {
      if (
        node.kind === 'directory' &&
        expandedKeys.has(node.id) &&
        (!childrenState.has(node.id) || childrenState.get(node.id)?.status === 'unloaded')
      )
        void loadChildren(node);
    }
  }, [expandedKeys, loadedNodes, childrenState, loadChildren]);

  useEffect(() => {
    if (sync.status === 'refreshing') return;
    if (!query) {
      if (searchState.status !== 'idle') void searchFiles('');
      return;
    }
    if (searchState.query !== query || searchState.status === 'idle') void searchFiles(query);
  }, [query, searchFiles, searchState.query, searchState.status, sync.status]);

  const expansion = useMemo(() => {
    if (!query || searchState.query !== query || searchState.status !== 'ready')
      return expandedKeys;
    return new Set([
      ...expandedKeys,
      ...searchState.nodes.filter((node) => node.kind === 'directory').map((node) => node.id),
    ]);
  }, [expandedKeys, query, searchState]);

  const actions: readonly FileExplorerAction<FixtureMetadata>[] = provider.actions
    .filter((action) => action.id !== 'download')
    .map((action) => ({
      id: action.id,
      label: action.label,
      capability: action.capability,
      onSelect: () => fs.runAction(action.id, selected),
    }));
  const nodes =
    query && fs.searchState.query === query && fs.searchState.status === 'ready'
      ? fs.searchState.nodes
      : fs.nodes;
  const metadataFilter = useCallback(
    (node: FileNode<FixtureMetadata>) => {
      if (changed && (node.change === 'unchanged' || !node.change)) return false;
      if (options.scenario !== 'Image layers') return true;
      return options.cumulative
        ? node.metadata.layer <= options.layer && node.metadata.current !== 'absent'
        : node.metadata.layer === options.layer;
    },
    [changed, options.scenario, options.cumulative, options.layer],
  );
  const treeProps: FileTreeProps<FixtureMetadata> = {
    nodes,
    rootId: provider.source.rootId,
    selectedKeys,
    onSelectedKeysChange: setSelectedKeys,
    expandedKeys: expansion,
    onExpandedKeysChange: setExpandedKeys,
    selectionMode: 'multiple',
    childrenState: fs.childrenState,
    onLoadChildren: fs.loadChildren,
    onLoadMore: fs.loadMore,
    filterText: query,
    filter: metadataFilter,
    showHidden: hidden,
    density: 'compact',
    size: 'sm',
    loading: fs.loading,
    error: fs.error?.message,
    empty: query ? 'No matching paths' : 'Directory is empty',
    onOpen: (node) => {
      setSelectedKeys(new Set([node.id]));
      if (node.kind === 'directory') setExpandedKeys((keys) => new Set([...keys, node.id]));
      else setPreviewVisible(true);
    },
    onNodeContextMenu: (node, event) => {
      event.preventDefault();
      setContextNode(node);
      setSelectedKeys(new Set([node.id]));
    },
    renderMetadata: (node) =>
      node.metadata.mount ? (
        <span title={node.metadata.mount}>Unknown</span>
      ) : node.size === undefined ? null : (
        <span>{node.size < 1024 ? `${node.size} B` : `${(node.size / 1024).toFixed(1)} KB`}</span>
      ),
  };
  const searchStatus = query
    ? fs.searchState.query !== query || fs.searchState.status === 'loading'
      ? 'Searching…'
      : fs.searchState.status === 'error'
        ? fs.searchState.error?.message
        : fs.searchState.status === 'ready'
          ? 'Partial coverage · /root excluded'
          : undefined
    : undefined;
  const layerPanel =
    options.scenario === 'Image layers' ? (
      <>
        {layerControls}
        <div className={styles.scopeLabel}>
          {options.cumulative ? 'Applied filesystem' : `Changes in layer ${options.layer}`}
          <span>A Added · M Modified · D Deleted</span>
        </div>
      </>
    ) : options.scenario === 'Compare' ? (
      <div className={styles.endpoints}>
        <span>
          <strong>Image →</strong> {imageEndpoint} · layer 2
        </span>
        <span>
          <strong>Runtime</strong> {runtimeEndpoint}
        </span>
        <span>Mounts excluded · non-atomic snapshot</span>
      </div>
    ) : undefined;

  return (
    <>
      {options.scenario === 'Live watch' && (
        <section className={styles.controls} aria-label="Live watch showcase controls">
          <strong>Showcase controls</strong>
          <select
            aria-label="Change type"
            value={eventKind}
            onChange={(event) => setEventKind(event.target.value as typeof eventKind)}
          >
            <option value="modify">Modify file</option>
            <option value="add">Add file</option>
            <option value="remove">Remove event file</option>
            <option value="move">Confirmed move</option>
          </select>
          <button
            type="button"
            onClick={() => {
              const message = provider.inject(eventKind);
              setEvents((previous) => [...previous.slice(-3), message]);
            }}
          >
            Inject change
          </button>
          <button
            type="button"
            onClick={() => {
              provider.interrupt();
              setEvents((previous) => [...previous.slice(-3), 'Watch interrupted']);
            }}
          >
            Interrupt watch
          </button>
        </section>
      )}
      {options.scenario === 'States' && options.state === 'offline' && (
        <section className={styles.controls} aria-label="Connection showcase controls">
          <strong>Showcase controls</strong>
          <button
            type="button"
            onClick={() => {
              provider.reconnect();
              void fs.refresh();
            }}
          >
            Reconnect
          </button>
        </section>
      )}
      {options.scenario === 'Tree only' ? (
        <div className={styles.standalone}>
          <section className={styles.treePanel} aria-label="Standalone file tree">
            <div className={styles.treeToolbar}>
              <input
                aria-label="Search filesystem"
                placeholder="Search paths…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(event) => setHidden(event.target.checked)}
                />
                Hidden files
              </label>
              <button
                type="button"
                onClick={() => {
                  void fs.refresh();
                }}
              >
                Refresh
              </button>
            </div>
            <FileTree {...treeProps} className={styles.tree} />
            <div className={styles.treeStatus}>
              {searchStatus ?? `${selectedKeys.size} selected`}
              {fs.searchState.nextCursor && (
                <button
                  type="button"
                  onClick={() => {
                    void fs.search(query, fs.searchState.nextCursor);
                  }}
                >
                  More results
                </button>
              )}
            </div>
          </section>
          <aside className={styles.shortcuts}>
            <ShortcutSummary title="Keyboard & mouse" items={shortcuts} />
          </aside>
        </div>
      ) : (
        <FileExplorer
          {...treeProps}
          className={styles.explorer}
          sourceLabel={provider.source.label}
          contextPanel={layerPanel}
          actions={actions}
          previewVisible={previewVisible}
          onPreviewVisibleChange={setPreviewVisible}
          onFilterTextChange={setQuery}
          onShowHiddenChange={setHidden}
          sync={fs.sync}
          toolbarActions={
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={changed}
                onChange={(event) => setChanged(event.target.checked)}
              />
              Changed only
            </label>
          }
          preview={(node) => (
            <Preview
              node={node}
              provider={provider}
              content={fs.content}
              compare={options.scenario === 'Compare'}
              branchState={fs.childrenState.get(node.id)}
              onDownload={() => {
                void fs.runAction('download', node);
              }}
            />
          )}
          emptyPreview={
            <div className={styles.shortcuts}>
              <ShortcutSummary title="Keyboard & mouse" items={shortcuts} />
            </div>
          }
          status={
            <>
              <span>
                {searchStatus ?? (selected ? selected.path : `${fs.nodes.length} loaded`)}
              </span>
              {fs.searchState.nextCursor && (
                <button
                  type="button"
                  onClick={() => {
                    void fs.search(query, fs.searchState.nextCursor);
                  }}
                >
                  More results
                </button>
              )}
            </>
          }
        />
      )}
      {fs.actionState.status !== 'idle' && (
        <div className={styles.actionStatus} role="status">
          <span>
            {fs.actionState.status === 'running'
              ? `${fs.actionState.progress?.label ?? 'Exporting'} ${fs.actionState.progress?.completed ?? 0}${fs.actionState.progress?.total ? ` / ${fs.actionState.progress.total}` : ''}`
              : fs.actionState.status === 'error'
                ? fs.actionState.error?.message
                : fs.actionState.status === 'cancelled'
                  ? 'Export cancelled'
                  : 'Download created'}
          </span>
          {fs.actionState.status === 'running' && (
            <button type="button" onClick={fs.cancelAction}>
              Cancel export
            </button>
          )}
        </div>
      )}
      {events.length > 0 && (
        <section className={styles.activity} aria-label="Recent changes">
          <strong>Changes</strong>
          {events.map((event, index) => (
            <code key={`${index}:${event}`}>{event}</code>
          ))}
        </section>
      )}
      {contextNode && (
        <div
          className={styles.contextActions}
          role="dialog"
          aria-modal="false"
          aria-label={`${contextNode.name} actions`}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setContextNode(null);
          }}
        >
          <strong>{contextNode.name}</strong>
          <button
            type="button"
            disabled={contextNode.kind !== 'file' || contextNode.change === 'deleted'}
            onClick={() => {
              void fs.runAction('download', contextNode);
              setContextNode(null);
            }}
          >
            Download file
          </button>
          <button type="button" autoFocus onClick={() => setContextNode(null)}>
            Close
          </button>
        </div>
      )}
    </>
  );
}

export default function FileExplorerDemo() {
  const parameters = new URLSearchParams(window.location.search);
  const requestedScenario = parameters.get('mode');
  const requestedState = parameters.get('state');
  const [scenario, setScenario] = useState<Scenario>(
    () => scenarios.find((item) => item === requestedScenario) ?? 'Browse',
  );
  const [state, setState] = useState<ProviderState>(
    () => providerStates.find((item) => item === requestedState) ?? 'permission',
  );
  const [layer, setLayer] = useState(3);
  const [cumulative, setCumulative] = useState(false);
  const options = useMemo<FixtureOptions>(
    () => ({ scenario, state, layer, cumulative }),
    [scenario, state, layer, cumulative],
  );
  const layerControls =
    scenario === 'Image layers' ? (
      <section className={styles.layerControls} aria-label="Image layer scope">
        <div className={styles.layers}>
          {layers.map((command, index) => (
            <button
              type="button"
              key={command}
              aria-pressed={layer === index}
              onClick={() => setLayer(index)}
            >
              <span>Layer {index}</span>
              <strong>{command}</strong>
            </button>
          ))}
        </div>
        <div className={styles.layerOptions}>
          <label>
            <input
              type="checkbox"
              checked={cumulative}
              onChange={(event) => setCumulative(event.target.checked)}
            />
            Cumulative filesystem
          </label>
          <LayerHelp />
        </div>
      </section>
    ) : undefined;
  return (
    <div className={styles.demo}>
      <nav className={styles.scenarios} aria-label="File explorer showcase scenarios">
        <strong>File Explorer</strong>
        {scenarios.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={scenario === item}
            onClick={() => setScenario(item)}
          >
            {item}
          </button>
        ))}
        <span>Local fixtures</span>
      </nav>
      {scenario === 'States' && (
        <section className={styles.controls} aria-label="Provider state showcase controls">
          <strong>Showcase controls</strong>
          <label>
            Provider state{' '}
            <select
              value={state}
              onChange={(event) => setState(event.target.value as ProviderState)}
            >
              {providerStates.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </section>
      )}
      <ScenarioSurface
        key={`${scenario}:${state}:${layer}:${cumulative}`}
        options={options}
        layerControls={layerControls}
      />
    </div>
  );
}
