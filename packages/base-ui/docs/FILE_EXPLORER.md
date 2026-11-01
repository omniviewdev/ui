# Filesystem explorer and shortcut summaries

Import components, hooks, and types from `@omniviewdev/base-ui`, and load `@omniviewdev/base-ui/styles.css` once. All surfaces require the existing `ThemeProvider`.

## Choose the smallest surface

| API                            | Responsibility                                                                                 | Starts I/O                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `FileTree<TMetadata>`          | Virtualized file hierarchy, selection, expansion, loaded filtering, icons, and branch status   | Only invokes supplied load/open callbacks          |
| `FileExplorer<TMetadata>`      | Toolbar, optional context panel, resizable tree/preview, capabilities, and sync status         | Only invokes supplied callbacks                    |
| `FilePreview<TMetadata>`       | One 36px filename/path/change/read-only/action header, optional metadata, and supplied content | No                                                 |
| `useFileSystem<TMetadata>`     | Optional provider cache, paging, search, bounded reads, watch batches, and actions             | Lists the root after mount; other work is explicit |
| `ShortcutSummary` / `KeyChord` | Generic descriptions and accessible keyboard/mouse keycaps                                     | No; these do not register shortcuts                |

The tree does not import Monaco, container/Kubernetes clients, or a watch implementation. A consumer can supply static nodes without a provider or preview.

```tsx
import { FileTree, type FileNode } from '@omniviewdev/base-ui';

const files: readonly FileNode<{ layer: number }>[] = [
  {
    id: 'readme',
    parentId: null,
    name: 'README.md',
    path: '/README.md',
    kind: 'file',
    size: 4096,
    metadata: { layer: 2 },
  },
];

export function SmallTree() {
  return <FileTree nodes={files} style={{ height: 320 }} />;
}
```

## Identity, paths, and filtering

- IDs must be unique, nonempty, and source-scoped; parent relationships must form an acyclic tree. Do not use paths as IDs when confirmed moves must preserve focus and selection.
- Supply flat nodes with `parentId`; the displayed root defaults to `null`. `rootId` selects another parent boundary.
- Sibling order follows the supplied node projection. Supply an ordered projection for custom grouping or sorting.
- Incomplete, unloaded, or failed sibling listings expose unknown ARIA set size (`-1`); complete listings expose the visible sibling total.
- Metadata is typed and consumer-owned. The component does not interpret layers, credentials, comparison presence, or authorization.
- `filter(node)` provides controlled metadata scope, including when `filterText` is empty. Ancestors remain visible for matching descendants.
- `filterText` matches loaded display names and paths. `showHidden` follows provider flags, including hidden ancestors, independently of text and metadata filters. Filtering does not recursively fetch directories.
- Provider-wide search is separate: call `useFileSystem().search(query, cursor?)`, display its returned nodes/ancestors, and retain its `coverage` status. Partial results do not establish absence.
- `selectedKeys`, `expandedKeys`, and `activeKey` support controlled operation with corresponding change callbacks. Use `defaultSelectedKeys` and `defaultExpandedKeys` for uncontrolled initial state.
- `getIcon` and `renderMetadata` customize rows without changing identity or starting content reads.
- `FilePreview.parentPath` can override its display-only POSIX/Windows parent extraction for opaque provider paths. Core never normalizes provider paths for I/O.

Desktop defaults are 22px rows, 13px text, 12px metadata, and 14px icons. Narrow explorer surfaces and phone viewports use 34px rows and 16px icons. `density`, `size`, `overscan`, and `estimatedItemSize` remain available; an explicit estimate must match the caller's actual row geometry. Otherwise the virtualizer measures its inherited CSS row size, including responsive changes.

Virtualization bounds mounted rows, not cache size. Data or metadata-scope changes rebuild the loaded-node index in linear time; text filtering scans the loaded hierarchy. Selection and focus do not rebuild that index. The optional controller applies batch deltas to normalized maps, then publishes one immutable node projection per batch. Batch high-frequency changes; constant-time full-tree updates are not promised.

## Optional provider integration

```tsx
import {
  FileExplorer,
  useFileSystem,
  type FileProvider,
  type FileSource,
} from '@omniviewdev/base-ui';

export function ConnectedTree({
  provider,
  source,
}: {
  provider: FileProvider;
  source: FileSource;
}) {
  const files = useFileSystem({ provider, source });
  return (
    <FileExplorer
      nodes={files.nodes}
      rootId={source.rootId}
      sourceLabel={source.label}
      childrenState={files.childrenState}
      onLoadChildren={files.loadChildren}
      onLoadMore={files.loadMore}
      loading={files.loading}
      error={files.error?.message}
      sync={files.sync}
    />
  );
}
```

`FileProvider.listChildren` receives source/revision, parent, optional cursor, and an abort signal. Return immutable nodes, the actual revision, completeness, and a continuation cursor when more pages are available. Child pages must match the established root revision; mixed revisions require reconciliation rather than silently merging snapshots. A refreshed root can establish a newer revision. Unloaded, loading, partial, empty, and failed branches remain distinct.

Treat `source` as the requested source/snapshot identity. Changing its ID, revision, root, or path style resets the controller. Normal watch revisions advance inside the existing controller. Late responses from replaced sources, canceled requests, and replaced subscriptions cannot overwrite current state. Providers must honor abort signals and release subscriptions.

### Preview ownership

Pass `previewNodeId`, `previewEnabled`, and `readLimit` to the hook when content is needed. Closing or changing preview cancels the prior read. No read occurs without a selected regular file and `readFile`; symlinks, devices, sockets, FIFOs, and deletion tombstones are not automatically opened. Refresh invalidates displayed content even when a provider reuses node objects.

Render content through `FileExplorer.preview` and `FilePreview.children`. Content state is keyed by node ID; never display a ready result for another selection. `FileContent.truncated` and `totalBytes` describe bounded previews. Binary handling, baseline reads, text diffing, and rich editors belong to the consumer. Load an optional editor's stylesheet with its module, not from the tree core.

### Live changes and recovery

- Watch is not started by default. `defaultLive` or the first explicit enable starts it after the root snapshot establishes its revision.
- Once watching, turning Live sync off keeps collecting batches in a bounded paused queue. Re-enabling applies a valid queue while preserving stable IDs.
- `refresh()` reconciles root and loaded branches, drains queued changes, refreshes content, and restarts the subscription. It does not enable Live sync.
- A denied child branch remains a local error after reconciliation; healthy branches continue receiving live updates. Live status describes the subscription, not complete filesystem coverage.
- A gap, incompatible page revision, invalidation, or queue overflow marks data stale. Further patches do not silently claim freshness; Refresh reconciles it.
- An incompatible page leaves its branch in an error state requiring explicit Refresh, not an unloaded state eligible for automatic expansion retries.
- A watch adapter must resume from the supplied source revision or report `onGap` when it cannot bridge that revision.
- Batches support upsert, remove, confirmed move, and branch invalidation. An upsert describes one entry; use `move` to relocate cached directories and rebase their descendant paths. Supply descendant upserts when opaque paths change. A remove does not invent rename identity or historical content.
- Watch upserts and moves only populate branches with an established listing, including partial listings while continuation pages load or fail. Removing or invalidating a branch clears that listing coverage. Events targeting an unknown branch evict any cached old location and descendants; listing that branch restores provider-owned IDs without claiming partial watch data is a complete listing. Moves between listed branches retain loaded descendants.
- Use stable source-scoped entry IDs and ordered cursors; batch related changes before publishing. The normalized cache publishes one node projection per applied batch; row content reads remain separate.

The component is not a filesystem snapshot engine. Providers own non-atomic runtime snapshots, mounts, layer reconstruction, OCI whiteouts, comparison provenance (`present` / `absent` / `unknown`), symlink boundaries, and permissions. Credentials must not be placed in file metadata.

### Actions

Provider actions expose explicit available/unavailable/unknown capability state, an abort signal, and progress. `runAction` reports running, complete, canceled, and error states; `cancelAction` cannot later become successful because an old promise resolves. `FileExplorer.actions` displays supplied capabilities and handlers. Browsing does not depend on an archive capability such as `tar`.

The showcase uses an in-memory provider, real file downloads, and a JSON snapshot export. It does not produce container archives or contact a runtime.

## Generic command summaries

```tsx
import { KeyChord, ShortcutSummary } from '@omniviewdev/base-ui';

export function EditorCommands() {
  return (
    <ShortcutSummary
      title="Editor commands"
      items={[
        { id: 'save', keys: ['Mod', 'S'], description: 'Save file' },
        { id: 'move', keys: ['ArrowUp'], alternatives: [['ArrowDown']], description: 'Navigate' },
      ]}
    />
  );
}

export function SaveHint() {
  return <KeyChord keys={['Mod', 'S']} platform="auto" />;
}
```

`Mod` becomes Command on macOS and Control on Windows/Linux. `Meta` identifies Command on macOS, the Windows key on Windows, and Super on Linux; explicit Command/Ctrl names remain literal. Explicit `platform` values produce deterministic output. Automatic platform detection uses a hydration-safe snapshot. Descriptions accept React content; alternate chords share the same keycap and spoken-label formatting. No keyboard handlers or global listeners are registered.

## Verification surfaces

- Storybook: `Files/FileExplorer`, including a lazily created 100,000-node large-directory story; generic shortcut stories include non-explorer commands.
- Showcase: File Explorer → Browse, Tree only, Image layers, Compare, Live watch, and States.
- Tree regressions cover offscreen keyboard reveal, responsive estimates, pinned active descendants, overscan, and visible sibling ARIA metadata.
- Provider regressions cover source changes, paging, permission retry, bounded/canceled preview, search revision, manual refresh, stale queues, replaced watches, mixed revisions, and canceled transfers.

Screen-reader software, mobile Safari, native Wails surfaces, real filesystem authorization, and real archive transports require integration-specific validation; Chromium DOM roles and touch emulation do not establish those guarantees.
