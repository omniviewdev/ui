import { useEffect } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFileSystem } from './useFileSystem';
import type {
  FileChangeBatch,
  FileContent,
  FileNode,
  FileProvider,
  FileSearchPage,
  FileSource,
} from './types';

const source: FileSource = { id: 'runtime', revision: '0', rootId: null, pathStyle: 'posix' };
const file = (id: string, name = id, parentId: string | null = null): FileNode => ({
  id,
  name,
  parentId,
  path: '/' + name,
  kind: 'file',
  metadata: undefined,
});
function deferred<T>() {
  // Keep this fixture compatible with the package's ES2022 library target.
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe('useFileSystem source and request ownership', () => {
  it('invalidates a complete destination when an uncached entry moves into it', async () => {
    const destination: FileNode = { ...file('destination'), kind: 'directory' };
    const unlisted: FileNode = { ...file('unlisted'), kind: 'directory' };
    const moved: FileNode = {
      ...file('moved', 'a.txt', destination.id),
      path: '/destination/a.txt',
    };
    let revision = '0';
    let emit!: (batch: FileChangeBatch) => void;
    const requests: (string | null)[] = [];
    const provider: FileProvider = {
      listChildren: async ({ parentId }) => {
        requests.push(parentId);
        return {
          nodes: parentId === null ? [destination, unlisted] : revision === '0' ? [] : [moved],
          revision,
          complete: true,
        };
      },
      watch: ({ onBatch }) => {
        emit = onBatch;
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
    await waitFor(() => expect(result.current.nodes).toHaveLength(2));
    await act(() => result.current.loadChildren(destination));
    revision = '1';
    act(() =>
      emit({
        sourceId: source.id,
        revision,
        changes: [
          {
            type: 'move',
            id: moved.id,
            parentId: destination.id,
            name: moved.name,
            path: moved.path,
          },
        ],
      }),
    );
    expect(result.current.childrenState.get(destination.id)?.status).toBe('unloaded');
    expect(result.current.sync.status).toBe('stale');
    expect(result.current.nodes.some((node) => node.id === moved.id)).toBe(false);
    expect(requests).toEqual([null, destination.id]);
    await act(() => result.current.refresh());
    expect(result.current.nodes.find((node) => node.id === moved.id)).toEqual(moved);
    expect(result.current.childrenState.get(destination.id)).toMatchObject({
      status: 'loaded',
      complete: true,
    });
    expect(result.current.sync.status).toBe('live');
  });

  it('settles an outside-view directory request without leaving permanent loading or changing cached siblings', async () => {
    const stable = file('stable');
    const outside: FileNode = { ...file('outside'), kind: 'directory' };
    const provider: FileProvider = {
      listChildren: async ({ parentId }) => ({
        nodes: parentId === null ? [stable] : [file('child', 'child', outside.id)],
        revision: '0',
        complete: true,
      }),
    };
    const { result } = renderHook(() => useFileSystem({ provider, source }));
    await waitFor(() => expect(result.current.nodes).toEqual([stable]));
    await act(() => result.current.loadChildren(outside));
    expect(result.current.childrenState.get(outside.id)?.status).toBe('error');
    expect(result.current.nodes).toEqual([stable]);
    expect(result.current.loading).toBe(false);
  });

  it.each(['root', 'child'] as const)(
    'retains watch additions while a listed %s continuation page is in flight',
    async (branch) => {
      const directory: FileNode = { ...file('folder'), kind: 'directory' };
      const parentId = branch === 'root' ? null : directory.id;
      const first = file('first', 'first', parentId);
      const added = file('added', 'added', parentId);
      const later = file('later', 'later', parentId);
      const continuation = deferred<{ nodes: FileNode[]; revision: string; complete: boolean }>();
      const requests: { parentId: string | null; cursor?: string }[] = [];
      let emit!: (batch: FileChangeBatch) => void;
      const provider: FileProvider = {
        listChildren: ({ parentId: requestedParent, cursor }) => {
          requests.push({ parentId: requestedParent, cursor });
          if (requestedParent !== parentId) {
            return Promise.resolve({ nodes: [directory], revision: '0', complete: true });
          }
          return cursor
            ? continuation.promise
            : Promise.resolve({
                nodes: [first],
                revision: '0',
                complete: false,
                nextCursor: 'page2',
              });
        },
        watch: ({ onBatch }) => {
          emit = onBatch;
        },
      };
      const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
      await waitFor(() => expect(result.current.childrenState.get(null)?.status).toBe('loaded'));
      if (branch === 'child') await act(() => result.current.loadChildren(directory));
      expect(result.current.childrenState.get(parentId)).toMatchObject({
        status: 'loaded',
        complete: false,
        nextCursor: 'page2',
      });
      let loading!: Promise<void>;
      act(() => {
        loading = result.current.loadMore(branch === 'root' ? null : directory);
      });
      expect(result.current.childrenState.get(parentId)?.status).toBe('loading');
      act(() =>
        emit({
          sourceId: source.id,
          revision: '1',
          changes: [{ type: 'upsert', node: added }],
        }),
      );
      expect(result.current.nodes.filter((node) => node.parentId === parentId)).toEqual([
        first,
        added,
      ]);
      await act(async () => {
        continuation.resolve({ nodes: [later], revision: '1', complete: true });
        await loading;
      });
      expect(result.current.nodes.filter((node) => node.parentId === parentId)).toEqual([
        first,
        added,
        later,
      ]);
      expect(result.current.childrenState.get(parentId)).toMatchObject({
        status: 'loaded',
        complete: true,
      });
      expect(requests.at(-1)).toEqual({ parentId, cursor: 'page2' });
      expect(result.current.sync.status).toBe('live');
    },
  );

  it('keeps watch upserts beneath an unseen parent unknown until its complete listing arrives', async () => {
    const directory: FileNode = { ...file('folder'), kind: 'directory' };
    const first = file('first', 'first', directory.id);
    const second = file('second', 'second', directory.id);
    let revision = '0';
    const requests: (string | null)[] = [];
    let emit!: (batch: FileChangeBatch) => void;
    const provider: FileProvider = {
      listChildren: async ({ parentId }) => {
        requests.push(parentId);
        return {
          nodes: parentId === null ? [directory] : [first, second],
          revision,
          complete: true,
        };
      },
      watch: ({ onBatch }) => {
        emit = onBatch;
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
    await waitFor(() => expect(result.current.nodes).toEqual([directory]));
    revision = '1';
    act(() => emit({ sourceId: source.id, revision, changes: [{ type: 'upsert', node: first }] }));
    expect(result.current.nodes).toEqual([directory]);
    expect(result.current.childrenState.has(directory.id)).toBe(false);
    expect(requests).toEqual([null]);
    await act(() => result.current.loadChildren(directory));
    expect(result.current.nodes).toEqual([directory, first, second]);
    expect(result.current.childrenState.get(directory.id)).toMatchObject({
      status: 'loaded',
      complete: true,
    });
    expect(requests).toEqual([null, directory.id]);
  });

  it.each(['upsert', 'move'] as const)(
    'evicts an obsolete loaded subtree when %s changes its parent to an unknown branch',
    async (type) => {
      const destination: FileNode = { ...file('destination'), kind: 'directory' };
      const directory: FileNode = { ...file('folder'), kind: 'directory' };
      const child = { ...file('child', 'child', directory.id), path: '/folder/child' };
      const moved = { ...directory, parentId: destination.id, path: '/destination/folder' };
      let revision = '0';
      let emit!: (batch: FileChangeBatch) => void;
      const provider: FileProvider = {
        listChildren: async ({ parentId }) => ({
          nodes:
            parentId === null
              ? revision === '0'
                ? [directory, destination]
                : [destination]
              : parentId === destination.id
                ? [moved]
                : [{ ...child, path: '/destination/folder/child' }],
          revision,
          complete: true,
        }),
        watch: ({ onBatch }) => {
          emit = onBatch;
        },
      };
      const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
      await waitFor(() => expect(result.current.nodes).toHaveLength(2));
      await act(() => result.current.loadChildren(directory));
      expect(result.current.nodes.some((node) => node.id === child.id)).toBe(true);
      revision = '1';
      act(() =>
        emit({
          sourceId: source.id,
          revision,
          changes: [
            type === 'upsert'
              ? { type, node: moved }
              : {
                  type,
                  id: moved.id,
                  parentId: moved.parentId,
                  path: moved.path,
                  name: moved.name,
                },
          ],
        }),
      );
      expect(result.current.nodes).toEqual([destination]);
      expect(result.current.childrenState.has(destination.id)).toBe(false);
      expect(result.current.childrenState.has(directory.id)).toBe(false);
      await act(() => result.current.loadChildren(destination));
      expect(result.current.nodes).toEqual([destination, moved]);
      await act(() => result.current.loadChildren(moved));
      expect(result.current.nodes.find((node) => node.id === child.id)?.path).toBe(
        '/destination/folder/child',
      );
    },
  );

  it('preserves loaded descendants when moving into a loaded destination', async () => {
    const directory: FileNode = { ...file('folder'), kind: 'directory' };
    const destination: FileNode = { ...file('destination'), kind: 'directory' };
    const child = { ...file('child', 'child', directory.id), path: '/folder/child' };
    let emit!: (batch: FileChangeBatch) => void;
    const provider: FileProvider = {
      listChildren: async ({ parentId }) => ({
        nodes:
          parentId === null ? [directory, destination] : parentId === directory.id ? [child] : [],
        revision: '0',
        complete: true,
      }),
      watch: ({ onBatch }) => {
        emit = onBatch;
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
    await waitFor(() => expect(result.current.nodes).toHaveLength(2));
    await act(() => result.current.loadChildren(directory));
    await act(() => result.current.loadChildren(destination));
    act(() =>
      emit({
        sourceId: source.id,
        revision: '1',
        changes: [
          {
            type: 'move',
            id: directory.id,
            parentId: destination.id,
            name: directory.name,
            path: '/destination/folder',
          },
        ],
      }),
    );
    expect(result.current.nodes.find((node) => node.id === directory.id)?.parentId).toBe(
      destination.id,
    );
    expect(result.current.nodes.find((node) => node.id === child.id)?.path).toBe(
      '/destination/folder/child',
    );
    expect(result.current.childrenState.get(directory.id)?.status).toBe('loaded');
    expect(result.current.childrenState.get(destination.id)?.status).toBe('loaded');
  });

  it.each(['paused', 'gapped'] as const)(
    'bounds expanded-directory auto-loading after a %s revision mismatch and recovers on Refresh',
    async (mode) => {
      const directory: FileNode = { ...file('folder'), kind: 'directory' };
      const child = file('child', 'child', directory.id);
      let revision = '0';
      let emit!: (batch: FileChangeBatch) => void;
      let onGap!: () => void;
      const requests: (string | null)[] = [];
      const provider: FileProvider = {
        listChildren: async ({ parentId }) => {
          requests.push(parentId);
          return { nodes: parentId === null ? [directory] : [child], revision, complete: true };
        },
        watch: (request) => {
          emit = request.onBatch;
          onGap = request.onGap;
        },
      };
      vi.useFakeTimers();
      const { result, unmount } = renderHook(() => {
        const filesystem = useFileSystem({ provider, source, defaultLive: true });
        useEffect(() => {
          const timer = setInterval(() => {
            const state = filesystem.childrenState.get(directory.id);
            if (!state || state.status === 'unloaded') void filesystem.loadChildren(directory);
          }, 140);
          return () => clearInterval(timer);
        }, [filesystem]);
        return filesystem;
      });
      await act(async () => {});
      expect(result.current.nodes).toEqual([directory]);
      try {
        revision = '1';
        act(() => {
          if (mode === 'paused') {
            result.current.sync.onEnabledChange(false);
            emit({ sourceId: source.id, revision, changes: [{ type: 'upsert', node: child }] });
          } else onGap();
        });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(140);
        });
        expect(result.current.sync.status).toBe('stale');
        expect(result.current.childrenState.get(directory.id)?.status).toBe('error');
        expect(result.current.nodes).toEqual([directory]);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1400);
        });
        expect(requests).toEqual([null, directory.id]);
        await act(() => result.current.refresh());
        expect(requests).toEqual([null, directory.id, null, directory.id]);
        expect(result.current.childrenState.get(directory.id)).toMatchObject({
          status: 'loaded',
          complete: true,
        });
        expect(result.current.nodes).toEqual([directory, child]);
        expect(result.current.sync.status).toBe(mode === 'paused' ? 'idle' : 'live');
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1400);
        });
        expect(requests).toHaveLength(4);
      } finally {
        unmount();
        vi.useRealTimers();
      }
    },
  );

  it('accepts a listing that has caught up to the current watch revision', async () => {
    const page = deferred<{ nodes: FileNode[]; revision: string; complete: boolean }>();
    const directory: FileNode = { ...file('folder'), kind: 'directory' };
    const current: FileNode = {
      ...file('current'),
      parentId: directory.id,
      path: '/folder/current',
    };
    let emit!: (batch: FileChangeBatch) => void;
    const provider: FileProvider = {
      listChildren: (request) =>
        request.parentId === null
          ? Promise.resolve({ nodes: [directory], revision: '0', complete: true })
          : page.promise,
      watch: (request) => {
        emit = request.onBatch;
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
    await waitFor(() => expect(result.current.nodes).toEqual([directory]));
    act(() => {
      void result.current.loadChildren(directory);
    });
    act(() =>
      emit({
        sourceId: source.id,
        revision: '1',
        cursor: '1',
        changes: [{ type: 'upsert', node: current }],
      }),
    );
    await act(async () => {
      page.resolve({ nodes: [current], revision: '1', complete: true });
      await page.promise;
    });
    expect(result.current.childrenState.get(directory.id)).toEqual({
      status: 'loaded',
      complete: true,
      nextCursor: undefined,
    });
    expect(result.current.sync.status).toBe('live');
  });

  it('starts watching the established root snapshot instead of replaying events behind it', async () => {
    let deliver!: () => void;
    const provider: FileProvider = {
      listChildren: async () => ({
        nodes: [file('stable', 'latest.txt')],
        revision: '3',
        complete: true,
      }),
      watch: (request) => {
        const next =
          request.source.revision === '3'
            ? { revision: '4', node: file('stable', 'after.txt') }
            : { revision: '1', node: file('stable', 'obsolete.txt') };
        deliver = () =>
          request.onBatch({
            sourceId: source.id,
            revision: next.revision,
            changes: [{ type: 'upsert', node: next.node }],
          });
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
    await waitFor(() => expect(result.current.nodes[0]?.name).toBe('latest.txt'));
    act(() => deliver());
    expect(result.current.nodes[0]?.name).toBe('after.txt');
  });

  it('keeps healthy branches live when refreshing a denied branch', async () => {
    const directory: FileNode = { ...file('folder'), kind: 'directory' };
    const healthy = file('healthy', 'before.txt');
    let revision = '0';
    let emit!: (batch: FileChangeBatch) => void;
    const provider: FileProvider = {
      listChildren: async (request) => {
        if (request.parentId === directory.id) throw new Error('Permission denied');
        return { nodes: [directory, healthy], revision, complete: true };
      },
      watch: (request) => {
        emit = request.onBatch;
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
    await waitFor(() => expect(result.current.nodes).toHaveLength(2));
    await act(() => result.current.loadChildren(directory));
    revision = '1';
    await act(() => result.current.refresh());
    act(() =>
      emit({
        sourceId: source.id,
        revision: '2',
        changes: [{ type: 'upsert', node: { ...healthy, name: 'after.txt', path: '/after.txt' } }],
      }),
    );
    expect(result.current.nodes.find((node) => node.id === healthy.id)?.name).toBe('after.txt');
    expect(result.current.childrenState.get(directory.id)?.status).toBe('error');
    expect(result.current.sync.status).toBe('live');
  });

  it('never replaces a new source with a late response from an aborted source', async () => {
    const late = deferred<{ nodes: FileNode[]; revision: string; complete: boolean }>();
    const provider: FileProvider = {
      listChildren: (request) =>
        request.source.id === 'old'
          ? late.promise
          : Promise.resolve({ nodes: [file('current')], revision: '0', complete: true }),
    };
    const { result, rerender } = renderHook(
      ({ id }) => useFileSystem({ provider, source: { ...source, id } }),
      { initialProps: { id: 'old' } },
    );
    rerender({ id: 'new' });
    await waitFor(() => expect(result.current.nodes.map((node) => node.id)).toEqual(['current']));
    await act(async () => {
      late.resolve({ nodes: [file('stale')], revision: '0', complete: true });
      await late.promise;
    });
    expect(result.current.nodes.map((node) => node.id)).toEqual(['current']);
  });

  it('cancels superseded previews and removes content when preview closes', async () => {
    const first = deferred<FileContent>(),
      second = deferred<FileContent>();
    const provider: FileProvider = {
      listChildren: async () => ({ nodes: [file('a'), file('b')], revision: '0', complete: true }),
      readFile: (request) => (request.node.id === 'a' ? first.promise : second.promise),
    };
    const { result, rerender } = renderHook(
      ({ selected, visible }) =>
        useFileSystem({ provider, source, previewNodeId: selected, previewEnabled: visible }),
      { initialProps: { selected: 'a', visible: true } },
    );
    await waitFor(() => expect(result.current.content).toEqual({ status: 'loading', nodeId: 'a' }));
    rerender({ selected: 'b', visible: true });
    await act(async () => {
      second.resolve({ kind: 'text', text: 'B', revision: '0', truncated: false });
      await second.promise;
    });
    await waitFor(() =>
      expect(result.current.content).toMatchObject({
        status: 'ready',
        nodeId: 'b',
        content: { text: 'B' },
      }),
    );
    await act(async () => {
      first.resolve({ kind: 'text', text: 'A', revision: '0', truncated: false });
      await first.promise;
    });
    expect(result.current.content).toMatchObject({
      status: 'ready',
      nodeId: 'b',
      content: { text: 'B' },
    });
    rerender({ selected: 'b', visible: false });
    await waitFor(() => expect(result.current.content.status).toBe('idle'));
  });

  it('refreshes selected content when a provider reuses the same node object', async () => {
    const entry = file('config');
    let text = 'before';
    const provider: FileProvider = {
      listChildren: async () => ({ nodes: [entry], revision: '0', complete: true }),
      readFile: async () => ({ kind: 'text', text, revision: '0', truncated: false }),
    };
    const { result } = renderHook(() =>
      useFileSystem({ provider, source, previewNodeId: entry.id }),
    );
    await waitFor(() =>
      expect(result.current.content).toMatchObject({
        status: 'ready',
        content: { text: 'before' },
      }),
    );
    text = 'after';
    await act(() => result.current.refresh());
    await waitFor(() =>
      expect(result.current.content).toMatchObject({ status: 'ready', content: { text: 'after' } }),
    );
  });

  it('does not read symlinks, deleted files, or special files as regular content', async () => {
    let unsafeRead = false;
    const provider: FileProvider = {
      listChildren: async () => ({
        nodes: [
          { ...file('device'), kind: 'device' },
          { ...file('link'), kind: 'symlink' },
          { ...file('gone'), change: 'deleted' },
        ],
        revision: '0',
        complete: true,
      }),
      readFile: async () => {
        unsafeRead = true;
        return { kind: 'text', text: 'unsafe', revision: '0', truncated: false };
      },
    };
    const { result, rerender } = renderHook(
      ({ selected }) => useFileSystem({ provider, source, previewNodeId: selected }),
      { initialProps: { selected: 'device' } },
    );
    await waitFor(() => expect(result.current.nodes).toHaveLength(3));
    rerender({ selected: 'link' });
    rerender({ selected: 'gone' });
    expect(result.current.content.status).toBe('idle');
    expect(unsafeRead).toBe(false);
  });
});

describe('useFileSystem loading and search', () => {
  it('distinguishes partial root data and failed branches, and supports retry without erasing siblings', async () => {
    let denied = true;
    const directory: FileNode = { ...file('folder'), kind: 'directory' };
    const provider: FileProvider = {
      listChildren: async (request) => {
        if (request.parentId === 'folder') {
          if (denied) throw new Error('Permission denied');
          return { nodes: [file('inside', 'inside.txt', 'folder')], revision: '0', complete: true };
        }
        return request.cursor
          ? { nodes: [file('second')], revision: '0', complete: true }
          : { nodes: [directory], revision: '0', complete: false, nextCursor: 'next' };
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source }));
    await waitFor(() =>
      expect(result.current.childrenState.get(null)).toMatchObject({
        status: 'loaded',
        complete: false,
      }),
    );
    await act(() => result.current.loadMore(null));
    expect(result.current.nodes.map((node) => node.id)).toEqual(['folder', 'second']);
    await act(() => result.current.loadChildren(directory));
    expect(result.current.childrenState.get('folder')).toMatchObject({
      status: 'error',
      error: new Error('Permission denied'),
    });
    expect(result.current.nodes.map((node) => node.id)).toEqual(['folder', 'second']);
    denied = false;
    await act(() => result.current.loadChildren(directory));
    expect(result.current.nodes.map((node) => node.id)).toEqual(['folder', 'second', 'inside']);
    expect(result.current.childrenState.get('folder')).toMatchObject({
      status: 'loaded',
      complete: true,
    });
  });

  it('rejects old search results and previews a result from an unloaded directory at its search revision', async () => {
    const old = deferred<FileSearchPage>();
    const parent: FileNode = { ...file('parent'), kind: 'directory' };
    const found = file('found', 'found.txt', 'parent');
    const provider: FileProvider = {
      listChildren: async () => ({ nodes: [], revision: '0', complete: true }),
      search: (request) =>
        request.query === 'old'
          ? old.promise
          : Promise.resolve({
              nodes: [found],
              ancestors: [parent],
              revision: '7',
              complete: false,
              coverage: 'partial',
              nextCursor: 'more',
            }),
      readFile: async (request) => ({
        kind: 'text',
        text: request.source.revision === '7' ? 'searched snapshot' : 'wrong snapshot',
        revision: request.source.revision,
        truncated: false,
      }),
    };
    const initialProps: { selected: string | null } = { selected: null };
    const { result, rerender } = renderHook(
      ({ selected }) => useFileSystem({ provider, source, previewNodeId: selected }),
      { initialProps },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('old');
    });
    await act(() => result.current.search('new'));
    await act(async () => {
      old.resolve({ nodes: [file('wrong')], revision: '0', complete: true, coverage: 'complete' });
      await pending;
    });
    expect(result.current.searchState).toMatchObject({
      query: 'new',
      coverage: 'partial',
      nextCursor: 'more',
    });
    expect(result.current.searchState.nodes.map((node) => node.id)).toEqual(['parent', 'found']);
    rerender({ selected: 'found' });
    await waitFor(() =>
      expect(result.current.content).toMatchObject({
        status: 'ready',
        nodeId: 'found',
        content: { text: 'searched snapshot' },
      }),
    );
    expect(result.current.nodes).toEqual([]);
  });
  it('requires reconciliation instead of merging a child page from a different revision', async () => {
    const directory: FileNode = { ...file('folder'), kind: 'directory' };
    let rootRevision = '0';
    const provider: FileProvider = {
      listChildren: async (request) => ({
        nodes: request.parentId === null ? [directory] : [file('child', 'child', directory.id)],
        revision: request.parentId === null ? rootRevision : '1',
        complete: true,
      }),
    };
    const { result } = renderHook(() => useFileSystem({ provider, source }));
    await waitFor(() => expect(result.current.nodes).toEqual([directory]));
    await act(() => result.current.loadChildren(directory));
    expect(result.current.nodes).toEqual([directory]);
    expect(result.current.sync.status).toBe('stale');
    rootRevision = '1';
    await act(() => result.current.refresh());
    expect(result.current.nodes.map((node) => node.id)).toEqual(['folder', 'child']);
    expect(result.current.sync.status).toBe('idle');
  });
});

describe('useFileSystem live revisions', () => {
  it('manual refresh preserves disabled live sync, confirmed identity, and a usable subscription', async () => {
    let entry = file('stable', 'before.txt'),
      revision = 0;
    let emit: ((batch: FileChangeBatch) => void) | undefined;
    const provider: FileProvider = {
      listChildren: async () => ({ nodes: [entry], revision: String(revision), complete: true }),
      watch: (request) => {
        emit = request.onBatch;
        return () => {
          emit = undefined;
        };
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
    await waitFor(() => expect(result.current.nodes[0]?.name).toBe('before.txt'));
    act(() => result.current.sync.onEnabledChange(false));
    entry = { ...entry, name: 'renamed.txt', path: '/renamed.txt' };
    revision = 1;
    act(() =>
      emit!({
        sourceId: 'runtime',
        revision: '1',
        cursor: '1',
        changes: [
          { type: 'move', id: 'stable', name: entry.name, path: entry.path, parentId: null },
        ],
      }),
    );
    expect(result.current.sync.pendingChanges).toBe(1);
    expect(result.current.nodes[0]?.name).toBe('before.txt');
    await act(() => result.current.refresh());
    expect(result.current.sync).toMatchObject({
      enabled: false,
      pendingChanges: 0,
      status: 'idle',
    });
    expect(result.current.nodes[0]).toMatchObject({ id: 'stable', name: 'renamed.txt' });
    entry = { ...entry, name: 'later.txt', path: '/later.txt' };
    revision = 2;
    act(() =>
      emit!({
        sourceId: 'runtime',
        revision: '2',
        cursor: '2',
        changes: [{ type: 'upsert', node: entry }],
      }),
    );
    expect(result.current.nodes[0]?.name).toBe('renamed.txt');
    act(() => result.current.sync.onEnabledChange(true));
    expect(result.current.nodes[0]).toMatchObject({ id: 'stable', name: 'later.txt' });
    act(() =>
      emit!({
        sourceId: 'runtime',
        revision: '3',
        previousCursor: '2',
        cursor: '3',
        changes: [{ type: 'remove', id: 'stable' }],
      }),
    );
    expect(result.current.nodes).toEqual([]);
  });

  it('ignores callbacks from a replaced watch subscription', async () => {
    const callbacks: ((batch: FileChangeBatch) => void)[] = [];
    const provider: FileProvider = {
      listChildren: async () => ({ nodes: [file('current')], revision: '0', complete: true }),
      watch: (request) => {
        callbacks.push(request.onBatch);
      },
    };
    const { result } = renderHook(() => useFileSystem({ provider, source, defaultLive: true }));
    await waitFor(() => expect(result.current.nodes[0]?.id).toBe('current'));
    const oldEmit = callbacks[0]!;
    await act(() => result.current.refresh());
    act(() =>
      oldEmit({
        sourceId: source.id,
        revision: 'old',
        changes: [{ type: 'upsert', node: file('obsolete') }],
      }),
    );
    expect(result.current.nodes.map((node) => node.id)).toEqual(['current']);
    act(() =>
      callbacks[1]!({
        sourceId: source.id,
        revision: 'new',
        changes: [{ type: 'upsert', node: file('fresh') }],
      }),
    );
    expect(result.current.nodes.map((node) => node.id)).toEqual(['current', 'fresh']);
  });

  it('bounds paused updates and requires reconciliation after overflow or a cursor gap', async () => {
    let entries = [file('one')];
    let emit!: (batch: FileChangeBatch) => void;
    const provider: FileProvider = {
      listChildren: async () => ({ nodes: entries, revision: '3', complete: true }),
      watch: (request) => {
        emit = request.onBatch;
      },
    };
    const { result } = renderHook(() =>
      useFileSystem({ provider, source, defaultLive: true, maxPendingChanges: 1 }),
    );
    await waitFor(() => expect(result.current.nodes[0]?.id).toBe('one'));
    act(() => result.current.sync.onEnabledChange(false));
    entries = [file('one'), file('two'), file('three')];
    act(() =>
      emit({
        sourceId: 'runtime',
        revision: '4',
        cursor: '4',
        changes: [
          { type: 'upsert', node: entries[1]! },
          { type: 'upsert', node: entries[2]! },
        ],
      }),
    );
    expect(result.current.sync).toMatchObject({ status: 'stale', pendingChanges: 0 });
    act(() => result.current.sync.onEnabledChange(true));
    expect(result.current.nodes.map((node) => node.id)).toEqual(['one']);
    expect(result.current.sync.status).toBe('stale');
    await act(() => result.current.refresh());
    expect(result.current.nodes.map((node) => node.id)).toEqual(['one', 'two', 'three']);
    act(() => emit({ sourceId: 'runtime', revision: '5', cursor: '5', changes: [] }));
    act(() =>
      emit({
        sourceId: 'runtime',
        revision: '7',
        previousCursor: '6',
        cursor: '7',
        changes: [{ type: 'remove', id: 'one' }],
      }),
    );
    expect(result.current.sync.status).toBe('stale');
    expect(result.current.nodes.some((node) => node.id === 'one')).toBe(true);
  });
});

it('does not complete cancelled transfers when their adapter resolves later', async () => {
  const transfer = deferred<void>();
  const provider: FileProvider = {
    listChildren: async () => ({ nodes: [], revision: '0', complete: true }),
    actions: [
      {
        id: 'export',
        label: 'Export',
        capability: { status: 'available' },
        run: async ({ onProgress }) => {
          onProgress({ completed: 2, total: 10 });
          await transfer.promise;
        },
      },
    ],
  };
  const { result } = renderHook(() => useFileSystem({ provider, source }));
  let running!: Promise<void>;
  act(() => {
    running = result.current.runAction('export');
  });
  expect(result.current.actionState).toMatchObject({
    status: 'running',
    progress: { completed: 2, total: 10 },
  });
  act(() => result.current.cancelAction());
  await act(async () => {
    transfer.resolve();
    await running;
  });
  expect(result.current.actionState).toMatchObject({ status: 'cancelled', actionId: 'export' });
});
