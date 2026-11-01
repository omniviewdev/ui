import type {
  FileChangeBatch,
  FileContent,
  FileMutation,
  FileNode,
  FileProvider,
  FileProviderAction,
  FileSource,
} from '@omniviewdev/base-ui';
import { createEntries, imageEndpoint, runtimeEndpoint } from './data';
import type { FixtureEntry, FixtureMetadata, FixtureOptions } from './types';

const pageSize = 6;

function delay(signal: AbortSignal, milliseconds = 140): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Request cancelled', 'AbortError'));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Request cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    signal.addEventListener('abort', abort, { once: true });
  });
}

function content(
  bytes: Uint8Array | undefined,
  mimeType: string | undefined,
  revision: string,
  limit: number,
): FileContent {
  if (!bytes) throw new Error('Content unavailable for this entry');
  const binary = mimeType === 'application/octet-stream';
  const bounded = bytes.subarray(0, limit);
  return {
    kind: binary ? 'binary' : 'text',
    text: binary ? undefined : new TextDecoder().decode(bounded),
    mimeType,
    revision,
    truncated: bounded.byteLength < bytes.byteLength,
    totalBytes: bytes.byteLength,
  };
}

function download(bytes: Uint8Array, name: string, mimeType = 'application/octet-stream'): void {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const url = URL.createObjectURL(new Blob([buffer], { type: mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export class FixtureFileProvider implements FileProvider<FixtureMetadata> {
  readonly source: FileSource;
  readonly actions: readonly FileProviderAction<FixtureMetadata>[];
  private readonly entries: Map<string, FixtureEntry>;
  private readonly options: FixtureOptions;
  private readonly listeners = new Set<{
    readonly onBatch: (batch: FileChangeBatch<FixtureMetadata>) => void;
    readonly onGap: () => void;
  }>();
  private revision = 0;
  private event = 0;
  private interrupted = false;
  private disconnected: boolean;

  constructor(options: FixtureOptions) {
    this.options = options;
    this.entries = new Map(createEntries(options).map((entry) => [entry.node.id, entry]));
    this.disconnected = options.scenario === 'States' && options.state === 'offline';
    this.source = {
      id: `fixture:${options.scenario}:${options.state}:${options.layer}:${options.cumulative}`,
      revision: 'fixture-0',
      rootId: null,
      pathStyle: 'posix',
      label: options.scenario === 'Image layers' ? imageEndpoint : runtimeEndpoint,
    };
    this.actions = [
      {
        id: 'download',
        label: 'Download file',
        capability: { status: 'available' },
        run: async ({ node, signal, onProgress }) => {
          if (!node || node.kind !== 'file' || node.change === 'deleted')
            throw new Error('Select a current regular file to download');
          await delay(signal);
          const entry = this.entries.get(node.id);
          if (!entry?.bytes) throw new Error('File content unavailable');
          onProgress({
            completed: entry.bytes.byteLength,
            total: entry.bytes.byteLength,
            label: node.name,
          });
          download(entry.bytes, node.name, entry.mimeType);
        },
      },
      {
        id: 'export',
        label: 'Export snapshot',
        capability: { status: 'available' },
        run: async ({ signal, onProgress }) => {
          const files: {
            readonly path: string;
            readonly kind: string;
            readonly presence: string;
            readonly change: string;
            readonly encoding: string;
            readonly content: string | readonly number[] | null;
          }[] = [];
          for (const entry of this.entries.values()) {
            await delay(signal, 12);
            files.push({
              path: entry.node.path,
              kind: entry.node.kind,
              presence: entry.node.metadata.current,
              change: entry.node.change ?? 'unchanged',
              encoding: entry.mimeType === 'application/octet-stream' ? 'bytes' : 'utf-8',
              content: !entry.bytes
                ? null
                : entry.mimeType === 'application/octet-stream'
                  ? Array.from(entry.bytes)
                  : new TextDecoder().decode(entry.bytes),
            });
            onProgress({
              completed: files.length,
              total: this.entries.size,
              label: 'Exporting snapshot',
            });
          }
          signal.throwIfAborted();
          download(
            new TextEncoder().encode(
              JSON.stringify(
                { source: this.source, revision: `fixture-${this.revision}`, files },
                null,
                2,
              ),
            ),
            'filesystem-snapshot.json',
            'application/json',
          );
        },
      },
      {
        id: 'archive',
        label: 'Export archive',
        capability: {
          status: 'unavailable',
          reason:
            options.state === 'missing-tar'
              ? 'tar is not installed in this source'
              : 'Archive creation is unavailable for this in-memory source',
        },
        run: async () => {
          throw new Error('Archive creation is unavailable');
        },
      },
    ];
  }

  async listChildren({
    parentId,
    cursor,
    signal,
  }: Parameters<FileProvider<FixtureMetadata>['listChildren']>[0]) {
    await delay(
      signal,
      this.options.scenario === 'States' && this.options.state === 'loading' ? 2200 : 140,
    );
    if (this.disconnected) throw new Error('Filesystem disconnected');
    if (parentId === 'root') throw new Error('Permission denied: /root (uid 101)');
    const children = Array.from(this.entries.values(), (entry) => entry.node)
      .filter((node) => node.parentId === parentId)
      .sort(
        (left, right) =>
          Number(right.kind === 'directory') - Number(left.kind === 'directory') ||
          left.name.localeCompare(right.name),
      );
    const offset = Number(cursor ?? 0);
    const nodes = children.slice(offset, offset + (parentId === null ? 12 : pageSize));
    const complete = offset + nodes.length >= children.length;
    return {
      nodes,
      revision: `fixture-${this.revision}`,
      complete,
      nextCursor: complete ? undefined : String(offset + nodes.length),
    };
  }

  async readFile({
    node,
    limit,
    signal,
  }: Parameters<NonNullable<FileProvider<FixtureMetadata>['readFile']>>[0]) {
    await delay(signal, 180);
    if (this.disconnected) throw new Error('Filesystem disconnected');
    if (node.kind !== 'file') throw new Error('Only regular files can be read');
    const entry = this.entries.get(node.id);
    return content(entry?.bytes, entry?.mimeType, `fixture-${this.revision}`, limit);
  }

  async readBaseline(node: FileNode<FixtureMetadata>, signal: AbortSignal): Promise<FileContent> {
    await delay(signal, 180);
    const entry = this.entries.get(node.id);
    if (node.metadata.baseline !== 'present') throw new Error('Baseline content unavailable');
    return content(entry?.baselineBytes, entry?.baselineMimeType, 'image-layer-2', 8192);
  }

  async search({
    query,
    cursor,
    signal,
  }: Parameters<NonNullable<FileProvider<FixtureMetadata>['search']>>[0]) {
    await delay(signal, 220);
    if (this.disconnected) throw new Error('Filesystem disconnected');
    const matches = Array.from(this.entries.values(), (entry) => entry.node).filter(
      (node) =>
        node.path.toLocaleLowerCase().includes(query.toLocaleLowerCase()) && node.id !== 'root',
    );
    const offset = Number(cursor ?? 0);
    const nodes = matches.slice(offset, offset + pageSize);
    const ancestors = new Map<string, FileNode<FixtureMetadata>>();
    for (const node of nodes) {
      let parentId = node.parentId;
      while (parentId) {
        const parent = this.entries.get(parentId)?.node;
        if (!parent) break;
        ancestors.set(parent.id, parent);
        parentId = parent.parentId;
      }
    }
    const complete = offset + nodes.length >= matches.length;
    return {
      nodes,
      ancestors: Array.from(ancestors.values()),
      revision: `fixture-${this.revision}`,
      complete,
      nextCursor: complete ? undefined : String(offset + nodes.length),
      coverage: 'partial' as const,
    };
  }

  watch({
    signal,
    onBatch,
    onGap,
  }: Parameters<NonNullable<FileProvider<FixtureMetadata>['watch']>>[0]) {
    const listener = { onBatch, onGap };
    if (signal.aborted) return;
    this.listeners.add(listener);
    this.interrupted = false;
    const dispose = () => {
      this.listeners.delete(listener);
    };
    signal.addEventListener('abort', dispose, { once: true });
    return () => {
      signal.removeEventListener('abort', dispose);
      dispose();
    };
  }

  inject(kind: 'modify' | 'add' | 'remove' | 'move'): string {
    this.event += 1;
    const mutations: FileMutation<FixtureMetadata>[] = [];
    const target = this.entries.get('nginx-conf');
    if (kind === 'modify' && target) {
      const bytes = new TextEncoder().encode(
        `${new TextDecoder().decode(target.bytes)}\n# update ${this.event}\n`,
      );
      const node = {
        ...target.node,
        size: bytes.byteLength,
        change: 'modified' as const,
        modifiedAt: Date.UTC(2026, 10, 1, 10, 42, 8 + this.event),
      };
      this.entries.set(node.id, { ...target, node, bytes });
      mutations.push({ type: 'upsert', node });
    } else if (kind === 'add') {
      const id = `request-${this.event}`;
      const bytes = new TextEncoder().encode(
        `2026-11-01T10:42:08Z request=${this.event} status=200\n`,
      );
      const node: FileNode<FixtureMetadata> = {
        id,
        parentId: 'log',
        name: `${id}.log`,
        path: `/var/log/${id}.log`,
        kind: 'file',
        size: bytes.byteLength,
        change: 'added',
        metadata: { layer: 3, baseline: 'absent', current: 'present', readFrom: 'current' },
      };
      this.entries.set(id, { node, bytes, mimeType: 'text/plain' });
      mutations.push({ type: 'upsert', node });
    } else if (kind === 'remove') {
      const entry =
        Array.from(this.entries.values()).find((candidate) =>
          candidate.node.id.startsWith('request-'),
        ) ?? this.entries.get('health');
      if (!entry) return 'No removable event file';
      this.entries.delete(entry.node.id);
      mutations.push({ type: 'remove', id: entry.node.id });
    } else if (kind === 'move') {
      const entry = this.entries.get('server');
      if (!entry) return 'File unavailable';
      const moved = entry.node.parentId === 'config';
      const node = {
        ...entry.node,
        parentId: moved ? 'app' : 'config',
        name: 'server.js',
        path: moved ? '/app/server.js' : '/app/config/server.js',
      };
      this.entries.set(node.id, { ...entry, node });
      mutations.push({
        type: 'move',
        id: node.id,
        parentId: node.parentId,
        name: node.name,
        path: node.path,
      });
    }
    const change = mutations[0];
    if (!change) return 'No change';
    const previousCursor = this.revision === 0 ? undefined : String(this.revision);
    this.revision += 1;
    const batch: FileChangeBatch<FixtureMetadata> = {
      sourceId: this.source.id,
      revision: `fixture-${this.revision}`,
      cursor: String(this.revision),
      previousCursor,
      changes: mutations,
    };
    if (!this.interrupted) for (const listener of this.listeners) listener.onBatch(batch);
    return `${kind === 'move' ? 'Confirmed move' : kind}: ${change.type === 'upsert' ? change.node.path : change.type === 'move' ? change.path : change.type === 'remove' ? change.id : '/'}`;
  }

  interrupt(): void {
    this.interrupted = true;
    for (const listener of this.listeners) listener.onGap();
  }

  reconnect(): void {
    this.disconnected = false;
  }
}
