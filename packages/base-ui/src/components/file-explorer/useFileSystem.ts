import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type {
  FileActionState,
  FileChangeBatch,
  FileChildrenState,
  FileContentState,
  FileNode,
  FileSearchState,
  FileSource,
  FileSyncStatus,
  UseFileSystemOptions,
  UseFileSystemResult,
} from './types';

const asError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

type Snapshot<T> = Pick<
  UseFileSystemResult<T>,
  | 'nodes'
  | 'childrenState'
  | 'loading'
  | 'error'
  | 'content'
  | 'sync'
  | 'searchState'
  | 'actionState'
> & {
  readonly findNode: (id: string | null | undefined) => FileNode<T> | undefined;
  readonly contentEpoch: number;
};

/** Source-owned cache. Construction does not perform I/O, including during SSR. */
function createFileSystem<T>(options: UseFileSystemOptions<T>) {
  const { provider, source } = options;
  const maxPending = Math.max(1, options.maxPendingChanges ?? 1000);
  const nodes = new Map<string, FileNode<T>>();
  const searchNodes = new Map<string, FileNode<T>>();
  let searchSource: FileSource | undefined;
  const childIds = new Map<string | null, Set<string>>();
  const childStates = new Map<string | null, FileChildrenState>();
  // Listing coverage survives transient pagination loading/errors, unlike row status.
  const listedParents = new Set<string | null>();
  let childrenDirty = true;
  const listeners = new Set<() => void>();
  const listings = new Map<
    string | null,
    { controller: AbortController; promise: Promise<boolean> }
  >();
  let session = 0;
  let epoch = 0;
  let disposed = true;
  let currentSource: FileSource = source;
  let latestRevision = source.revision;
  let cursor: string | undefined;
  let live = Boolean(options.defaultLive && provider.watch);
  let hasWatched = live;
  let stale = false;
  let refreshing = false;
  let rootError: Error | null = null;
  let pending: FileChangeBatch<T>[] = [];
  let pendingCount = 0;
  let watchController: AbortController | undefined;
  let stopWatch: (() => void) | void;
  let contentController: AbortController | undefined;
  let contentRequest = 0;
  let searchController: AbortController | undefined;
  let searchRequest = 0;
  let actionController: AbortController | undefined;
  let actionRequest = 0;
  let content: FileContentState = { status: 'idle' };
  let searchState: FileSearchState<T> = { status: 'idle', query: '', nodes: [] };
  let actionState: FileActionState = { status: 'idle' };
  let snapshot: Snapshot<T>;

  function status(): FileSyncStatus {
    if (refreshing) return 'refreshing';
    if (stale) return 'stale';
    if (rootError) return 'offline';
    return live && provider.watch ? 'live' : 'idle';
  }

  function setChildrenState(parentId: string | null, state: FileChildrenState) {
    childStates.set(parentId, state);
    childrenDirty = true;
  }

  function publish(changedNodes = false) {
    snapshot = {
      nodes: changedNodes ? Array.from(nodes.values()) : (snapshot?.nodes ?? []),
      childrenState: childrenDirty ? new Map(childStates) : snapshot.childrenState,
      loading: refreshing || childStates.get(source.rootId)?.status === 'loading',
      error: rootError,
      content,
      sync: {
        available: Boolean(provider.watch),
        enabled: live,
        status: status(),
        pendingChanges: pendingCount,
        onEnabledChange: setLive,
        onRefresh: refresh,
      },
      searchState,
      actionState,
      findNode: (id) => (id ? (searchNodes.get(id) ?? nodes.get(id)) : undefined),
      contentEpoch: epoch,
    };
    childrenDirty = false;
    if (!disposed) for (const listener of listeners) listener();
  }

  function detach(id: string) {
    const node = nodes.get(id);
    if (node) childIds.get(node.parentId)?.delete(id);
  }

  function upsert(node: FileNode<T>) {
    const old = nodes.get(node.id);
    if (old && old.parentId !== node.parentId) detach(node.id);
    nodes.set(node.id, node);
    let siblings = childIds.get(node.parentId);
    if (!siblings) childIds.set(node.parentId, (siblings = new Set()));
    siblings.add(node.id);
  }

  function remove(id: string) {
    const stack = [id],
      visited = new Set<string>();
    while (stack.length) {
      const key = stack.pop()!;
      if (visited.has(key)) continue;
      visited.add(key);
      for (const child of childIds.get(key) ?? []) stack.push(child);
      detach(key);
      nodes.delete(key);
      childIds.delete(key);
      childStates.delete(key);
      listedParents.delete(key);
      childrenDirty = true;
      listings.get(key)?.controller.abort();
      listings.delete(key);
    }
  }

  function invalidate(parentId: string | null) {
    listings.get(parentId)?.controller.abort();
    listings.delete(parentId);
    listedParents.delete(parentId);
    setChildrenState(parentId, { status: 'unloaded' });
  }

  function applyUpsert(node: FileNode<T>) {
    // Watch events describe individual entries, not a listing of an unknown branch.
    // Evict the old location too; a later listing restores the same provider-owned IDs.
    if (!listedParents.has(node.parentId)) {
      remove(node.id);
      return;
    }
    upsert(node);
  }

  function apply(batch: FileChangeBatch<T>) {
    for (const change of batch.changes) {
      if (change.type === 'upsert') applyUpsert(change.node);
      else if (change.type === 'remove') remove(change.id);
      else if (change.type === 'invalidate') {
        invalidate(change.parentId);
        stale = true;
      } else {
        const node = nodes.get(change.id);
        if (!node) continue;
        if (!listedParents.has(change.parentId)) {
          remove(change.id);
          continue;
        }
        // Providers must include descendant upserts for opaque path moves.
        const separator = source.pathStyle === 'windows' ? '\\' : '/';
        const prefix = node.path.endsWith(separator) ? node.path : node.path + separator;
        if (node.kind === 'directory') {
          const descendants = [...(childIds.get(node.id) ?? [])];
          const visited = new Set<string>();
          while (descendants.length) {
            const id = descendants.pop()!;
            if (visited.has(id)) continue;
            visited.add(id);
            const child = nodes.get(id);
            if (!child) continue;
            if (source.pathStyle !== 'opaque' && child.path.startsWith(prefix)) {
              nodes.set(id, {
                ...child,
                path: change.path + separator + child.path.slice(prefix.length),
              });
            } else if (source.pathStyle === 'opaque') invalidate(child.parentId);
            for (const nested of childIds.get(id) ?? []) descendants.push(nested);
          }
        }
        upsert({ ...node, parentId: change.parentId, name: change.name, path: change.path });
      }
    }
    currentSource = { ...currentSource, revision: batch.revision };
  }

  function gap() {
    if (disposed) return;
    stale = true;
    pending = [];
    pendingCount = 0;
    publish();
  }

  function receive(batch: FileChangeBatch<T>) {
    if (disposed || batch.sourceId !== source.id) return;
    latestRevision = batch.revision;
    if (
      cursor !== undefined &&
      batch.previousCursor !== undefined &&
      batch.previousCursor !== cursor
    ) {
      gap();
    }
    cursor = batch.cursor ?? cursor;
    if (stale || refreshing) return;
    if (!live) {
      const count = batch.changes.length;
      if (pendingCount + count > maxPending) {
        gap();
        return;
      }
      pending.push(batch);
      pendingCount += count;
      publish();
      return;
    }
    apply(batch);
    publish(true);
  }

  function startWatch() {
    if (
      !provider.watch ||
      watchController ||
      disposed ||
      !hasWatched ||
      childStates.get(source.rootId)?.status !== 'loaded'
    )
      return;
    const ownSession = session;
    const controller = (watchController = new AbortController());
    try {
      stopWatch = provider.watch({
        source: currentSource,
        signal: controller.signal,
        onBatch: (batch) => {
          if (ownSession === session && !controller.signal.aborted) receive(batch);
        },
        onGap: () => {
          if (ownSession === session && !controller.signal.aborted) gap();
        },
      });
    } catch (error) {
      rootError = asError(error);
      gap();
    }
  }

  function setLive(enabled: boolean) {
    live = enabled && Boolean(provider.watch);
    if (live) {
      hasWatched = true;
      startWatch();
      if (!stale && !refreshing) {
        for (const batch of pending) apply(batch);
        pending = [];
        pendingCount = 0;
        publish(true);
        return;
      }
    }
    publish();
  }

  function load(
    parentId: string | null,
    nextCursor?: string,
    revision = currentSource.revision,
  ): Promise<boolean> {
    const existing = listings.get(parentId);
    if (existing) return existing.promise;
    if (disposed) return Promise.resolve(false);
    const controller = new AbortController();
    const ownSession = session,
      ownEpoch = epoch;
    const requestSource = { ...currentSource, revision };
    setChildrenState(parentId, { status: 'loading' });
    publish();
    const promise = (async () => {
      try {
        const page = await Promise.resolve().then(() =>
          provider.listChildren({
            source: requestSource,
            parentId,
            cursor: nextCursor,
            signal: controller.signal,
          }),
        );
        if (disposed || controller.signal.aborted || ownSession !== session || ownEpoch !== epoch)
          return false;
        if (parentId !== source.rootId && parentId !== null && !nodes.has(parentId)) return false;
        // Child pages must belong to the established snapshot, including during refresh.
        const crossedRevision =
          !refreshing &&
          currentSource.revision !== requestSource.revision &&
          page.revision !== currentSource.revision;
        const mismatchedPage =
          (parentId !== source.rootId || nextCursor !== undefined) &&
          page.revision !== currentSource.revision;
        if (crossedRevision || mismatchedPage) {
          if (!crossedRevision) latestRevision = page.revision;
          setChildrenState(parentId, {
            status: 'error',
            error: new Error('Files changed. Refresh to see updates.'),
          });
          gap();
          return false;
        }
        if (!nextCursor) {
          const incoming = new Set(page.nodes.map((node) => node.id));
          for (const id of [...(childIds.get(parentId) ?? [])]) if (!incoming.has(id)) remove(id);
        }
        for (const node of page.nodes) upsert(node);
        listedParents.add(parentId);
        setChildrenState(parentId, {
          status: 'loaded',
          complete: page.complete,
          nextCursor: page.nextCursor,
        });
        currentSource = { ...currentSource, revision: page.revision };
        latestRevision = page.revision;
        if (parentId === source.rootId) {
          rootError = null;
          if (!refreshing) startWatch();
        }
        publish(true);
        return true;
      } catch (error) {
        if (disposed || controller.signal.aborted || ownSession !== session || ownEpoch !== epoch)
          return false;
        const failure = asError(error);
        setChildrenState(parentId, { status: 'error', error: failure });
        if (parentId === source.rootId) rootError = failure;
        publish();
        return false;
      } finally {
        if (listings.get(parentId)?.controller === controller) listings.delete(parentId);
      }
    })();
    listings.set(parentId, { controller, promise });
    return promise;
  }

  function cancelReads() {
    contentController?.abort();
    contentRequest++;
    searchController?.abort();
    searchRequest++;
    content = { status: 'idle' };
    searchState = { status: 'idle', query: '', nodes: [] };
    searchNodes.clear();
    searchSource = undefined;
  }

  async function refresh() {
    if (disposed || refreshing) return;
    epoch++;
    for (const request of listings.values()) request.controller.abort();
    listings.clear();
    cancelReads();
    const parents = [
      source.rootId,
      ...[...childStates.keys()].filter(
        (id) => id !== source.rootId && id !== null && nodes.has(id),
      ),
    ];
    const targetRevision = latestRevision;
    watchController?.abort();
    stopWatch?.();
    watchController = undefined;
    stopWatch = undefined;
    cursor = undefined;
    refreshing = true;
    stale = false;
    pending = [];
    pendingCount = 0;
    publish();
    const rootLoaded = await load(source.rootId, undefined, targetRevision);
    if (rootLoaded)
      await Promise.all(parents.slice(1).map((id) => load(id, undefined, currentSource.revision)));
    if (disposed) return;
    refreshing = false;
    stale = stale || !rootLoaded;
    startWatch();
    publish();
  }

  async function read(nodeId: string | null | undefined, enabled: boolean, limit: number) {
    contentController?.abort();
    const requestId = ++contentRequest;
    const node = nodeId ? (searchNodes.get(nodeId) ?? nodes.get(nodeId)) : undefined;
    if (
      !enabled ||
      !node ||
      node.kind !== 'file' ||
      node.change === 'deleted' ||
      !provider.readFile
    ) {
      if (content.status !== 'idle') {
        content = { status: 'idle' };
        publish();
      }
      return;
    }
    const controller = (contentController = new AbortController());
    const ownSession = session;
    content = { status: 'loading', nodeId: node.id };
    publish();
    try {
      const value = await provider.readFile({
        source: searchNodes.has(node.id) ? (searchSource ?? currentSource) : currentSource,
        node,
        limit,
        signal: controller.signal,
      });
      if (
        disposed ||
        controller.signal.aborted ||
        requestId !== contentRequest ||
        ownSession !== session
      )
        return;
      content = { status: 'ready', nodeId: node.id, content: value };
    } catch (error) {
      if (
        disposed ||
        controller.signal.aborted ||
        requestId !== contentRequest ||
        ownSession !== session
      )
        return;
      content = { status: 'error', nodeId: node.id, error: asError(error) };
    }
    publish();
  }

  async function search(query: string, nextCursor?: string) {
    searchController?.abort();
    const requestId = ++searchRequest;
    if (!query) {
      searchNodes.clear();
      searchSource = undefined;
      searchState = { status: 'idle', query: '', nodes: [] };
      publish();
      return;
    }
    if (!provider.search) {
      searchState = {
        status: 'error',
        query,
        nodes: [],
        error: new Error('Filesystem search is unavailable.'),
      };
      publish();
      return;
    }
    const ownSession = session;
    const controller = (searchController = new AbortController());
    const previous = nextCursor && searchState.query === query ? searchState.nodes : [];
    if (!nextCursor) {
      searchNodes.clear();
      searchSource = undefined;
    }
    searchState = { status: 'loading', query, nodes: previous };
    publish();
    try {
      const page = await provider.search({
        source: currentSource,
        query,
        cursor: nextCursor,
        signal: controller.signal,
      });
      if (
        disposed ||
        controller.signal.aborted ||
        requestId !== searchRequest ||
        ownSession !== session
      )
        return;
      const matches = new Map(previous.map((node) => [node.id, node]));
      for (const node of page.ancestors ?? []) matches.set(node.id, node);
      for (const node of page.nodes) matches.set(node.id, node);
      searchNodes.clear();
      for (const [id, node] of matches) searchNodes.set(id, node);
      searchSource = { ...currentSource, revision: page.revision };
      searchState = {
        status: 'ready',
        query,
        nodes: [...matches.values()],
        coverage: page.coverage,
        nextCursor: page.nextCursor,
      };
    } catch (error) {
      if (
        disposed ||
        controller.signal.aborted ||
        requestId !== searchRequest ||
        ownSession !== session
      )
        return;
      searchState = { status: 'error', query, nodes: previous, error: asError(error) };
    }
    publish();
  }

  function cancelAction() {
    if (!actionController) return;
    actionController.abort();
    actionController = undefined;
    actionRequest++;
    actionState = { status: 'cancelled', actionId: actionState.actionId };
    publish();
  }

  async function runAction(actionId: string, node: FileNode<T> | null = null) {
    cancelAction();
    const action = provider.actions?.find((candidate) => candidate.id === actionId);
    const requestId = ++actionRequest,
      ownSession = session;
    if (!action || action.capability.status !== 'available') {
      const reason =
        action?.capability.status === 'unavailable'
          ? action.capability.reason
          : 'Action is unavailable.';
      actionState = { status: 'error', actionId, error: new Error(reason) };
      publish();
      return;
    }
    const controller = (actionController = new AbortController());
    actionState = { status: 'running', actionId };
    publish();
    try {
      await action.run({
        source: currentSource,
        node,
        signal: controller.signal,
        onProgress: (progress) => {
          if (
            disposed ||
            controller.signal.aborted ||
            requestId !== actionRequest ||
            ownSession !== session
          )
            return;
          actionState = { status: 'running', actionId, progress };
          publish();
        },
      });
      if (
        disposed ||
        controller.signal.aborted ||
        requestId !== actionRequest ||
        ownSession !== session
      )
        return;
      actionState = { status: 'complete', actionId };
    } catch (error) {
      if (
        disposed ||
        controller.signal.aborted ||
        requestId !== actionRequest ||
        ownSession !== session
      )
        return;
      actionState = { status: 'error', actionId, error: asError(error) };
    }
    if (actionController === controller) actionController = undefined;
    publish();
  }

  function dispose() {
    disposed = true;
    session++;
    epoch++;
    for (const request of listings.values()) request.controller.abort();
    listings.clear();
    watchController?.abort();
    stopWatch?.();
    watchController = undefined;
    stopWatch = undefined;
    contentController?.abort();
    searchController?.abort();
    actionController?.abort();
  }

  publish();
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    start() {
      disposed = false;
      session++;
      void load(source.rootId);
    },
    dispose,
    read,
    clearContent() {
      contentController?.abort();
      contentRequest++;
      if (content.status !== 'idle') {
        content = { status: 'idle' };
        publish();
      }
    },
    loadChildren: async (node: FileNode<T>) => {
      await load(node.id);
    },
    loadMore: async (node: FileNode<T> | null) => {
      const parentId = node?.id ?? source.rootId;
      const state = childStates.get(parentId);
      if (state?.status === 'loaded' && !state.complete && state.nextCursor)
        await load(parentId, state.nextCursor);
      else if (!state || state.status === 'error' || state.status === 'unloaded')
        await load(parentId);
    },
    refresh,
    search,
    runAction,
    cancelAction,
  };
}

/** Optional I/O controller; FileTree itself never starts requests or subscriptions. */
export function useFileSystem<TMetadata = unknown>(
  options: UseFileSystemOptions<TMetadata>,
): UseFileSystemResult<TMetadata> {
  const {
    provider,
    source,
    defaultLive,
    maxPendingChanges,
    previewNodeId,
    previewEnabled = true,
    readLimit = 65536,
  } = options;
  const { id, revision, rootId, pathStyle, label } = source;
  const engine = useMemo(
    () =>
      createFileSystem({
        provider,
        source: { id, revision, rootId, pathStyle, label },
        defaultLive,
        maxPendingChanges,
      }),
    [provider, id, revision, rootId, pathStyle, label, defaultLive, maxPendingChanges],
  );
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);
  const previewNode = snapshot.findNode(previewNodeId);
  const refreshing = snapshot.sync.status === 'refreshing';
  useEffect(() => {
    engine.start();
    return engine.dispose;
  }, [engine]);
  useEffect(() => {
    if (refreshing) return;
    void engine.read(previewNodeId, previewEnabled, Math.max(1, readLimit));
    return engine.clearContent;
  }, [
    engine,
    previewNodeId,
    previewNode,
    previewEnabled,
    readLimit,
    snapshot.contentEpoch,
    refreshing,
  ]);
  return useMemo(() => {
    return {
      nodes: snapshot.nodes,
      childrenState: snapshot.childrenState,
      loading: snapshot.loading,
      error: snapshot.error,
      content: snapshot.content,
      sync: snapshot.sync,
      searchState: snapshot.searchState,
      actionState: snapshot.actionState,
      loadChildren: engine.loadChildren,
      loadMore: engine.loadMore,
      refresh: engine.refresh,
      search: engine.search,
      runAction: engine.runAction,
      cancelAction: engine.cancelAction,
    };
  }, [snapshot, engine]);
}
