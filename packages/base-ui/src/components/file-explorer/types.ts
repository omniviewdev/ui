import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';

export type FileKind = 'directory' | 'file' | 'symlink' | 'device' | 'socket' | 'fifo' | 'unknown';
export type FileChangeKind = 'added' | 'modified' | 'deleted' | 'unchanged' | 'unknown';

/** Identity is stable across confirmed renames and scoped to a source. */
export interface FileNode<TMetadata = unknown> {
  readonly id: string;
  readonly parentId: string | null;
  readonly name: string;
  readonly path: string;
  readonly kind: FileKind;
  readonly hidden?: boolean;
  readonly size?: number;
  readonly modifiedAt?: number;
  readonly mode?: number;
  readonly owner?: {
    readonly uid?: number;
    readonly gid?: number;
    readonly user?: string;
    readonly group?: string;
  };
  readonly linkTarget?: string;
  readonly change?: FileChangeKind;
  readonly metadata: TMetadata;
}

export interface FileSource {
  readonly id: string;
  readonly revision: string;
  readonly rootId: string | null;
  readonly pathStyle: 'posix' | 'windows' | 'opaque';
  readonly label?: string;
}

export type FileCapability =
  | { readonly status: 'available' }
  | { readonly status: 'unavailable'; readonly reason: string }
  | { readonly status: 'unknown' };

export interface FileChildPage<TMetadata = unknown> {
  readonly nodes: readonly FileNode<TMetadata>[];
  readonly revision: string;
  readonly complete: boolean;
  readonly nextCursor?: string;
}

export type FileChildrenState =
  | { readonly status: 'unloaded' }
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly complete: boolean; readonly nextCursor?: string }
  | { readonly status: 'error'; readonly error: Error };

export interface FileContent {
  readonly kind: 'text' | 'binary';
  readonly text?: string;
  readonly mimeType?: string;
  readonly revision: string;
  readonly truncated: boolean;
  readonly totalBytes?: number;
}

export type FileContentState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading'; readonly nodeId: string }
  | { readonly status: 'ready'; readonly nodeId: string; readonly content: FileContent }
  | { readonly status: 'error'; readonly nodeId: string; readonly error: Error };

export interface FileSearchPage<TMetadata = unknown> extends FileChildPage<TMetadata> {
  /** Include loaded or resolved ancestors so results retain hierarchy. */
  readonly ancestors?: readonly FileNode<TMetadata>[];
  readonly coverage: 'complete' | 'partial';
}

export type FileMutation<TMetadata = unknown> =
  | { readonly type: 'upsert'; readonly node: FileNode<TMetadata> }
  | { readonly type: 'remove'; readonly id: string }
  | {
      readonly type: 'move';
      readonly id: string;
      readonly parentId: string | null;
      readonly name: string;
      readonly path: string;
    }
  | { readonly type: 'invalidate'; readonly parentId: string | null };

export interface FileChangeBatch<TMetadata = unknown> {
  readonly sourceId: string;
  readonly revision: string;
  readonly cursor?: string;
  readonly previousCursor?: string;
  readonly changes: readonly FileMutation<TMetadata>[];
}

export interface FileActionProgress {
  readonly completed: number;
  readonly total?: number;
  readonly label?: string;
}

export interface FileProviderAction<TMetadata = unknown> {
  readonly id: string;
  readonly label: string;
  readonly capability: FileCapability;
  run(request: {
    readonly source: FileSource;
    readonly node: FileNode<TMetadata> | null;
    readonly signal: AbortSignal;
    readonly onProgress: (progress: FileActionProgress) => void;
  }): Promise<void>;
}

/** All I/O and authorization stay in the adapter, never in virtualized rows. */
export interface FileProvider<TMetadata = unknown> {
  listChildren(request: {
    readonly source: FileSource;
    readonly parentId: string | null;
    readonly cursor?: string;
    readonly signal: AbortSignal;
  }): Promise<FileChildPage<TMetadata>>;
  readFile?(request: {
    readonly source: FileSource;
    readonly node: FileNode<TMetadata>;
    readonly limit: number;
    readonly signal: AbortSignal;
  }): Promise<FileContent>;
  search?(request: {
    readonly source: FileSource;
    readonly query: string;
    readonly cursor?: string;
    readonly signal: AbortSignal;
  }): Promise<FileSearchPage<TMetadata>>;
  /** Resume from source.revision, or call onGap when that revision cannot be bridged. */
  watch?(request: {
    readonly source: FileSource;
    readonly signal: AbortSignal;
    readonly onBatch: (batch: FileChangeBatch<TMetadata>) => void;
    readonly onGap: () => void;
  }): (() => void) | void;
  readonly actions?: readonly FileProviderAction<TMetadata>[];
}

export type FileSyncStatus = 'idle' | 'live' | 'stale' | 'offline' | 'refreshing';

export interface FileExplorerSync {
  /** False when the adapter cannot supply change notifications. */
  readonly available?: boolean;
  readonly enabled: boolean;
  readonly status: FileSyncStatus;
  readonly pendingChanges: number;
  readonly onEnabledChange: (enabled: boolean) => void;
  readonly onRefresh: () => void | Promise<void>;
}

export interface FileTreeProps<TMetadata = unknown> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect' | 'onError'
> {
  readonly nodes: readonly FileNode<TMetadata>[];
  readonly rootId?: string | null;
  readonly selectedKeys?: ReadonlySet<string>;
  readonly defaultSelectedKeys?: Iterable<string>;
  readonly onSelectedKeysChange?: (keys: ReadonlySet<string>) => void;
  readonly expandedKeys?: ReadonlySet<string>;
  readonly defaultExpandedKeys?: Iterable<string>;
  readonly onExpandedKeysChange?: (keys: ReadonlySet<string>) => void;
  readonly activeKey?: string | null;
  readonly onActiveKeyChange?: (key: string | null) => void;
  readonly selectionMode?: 'none' | 'single' | 'multiple';
  readonly onOpen?: (node: FileNode<TMetadata>) => void;
  readonly onNodeContextMenu?: (
    node: FileNode<TMetadata>,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  readonly childrenState?: ReadonlyMap<string | null, FileChildrenState>;
  readonly onLoadChildren?: (node: FileNode<TMetadata>) => Promise<void>;
  readonly onLoadMore?: (node: FileNode<TMetadata> | null) => void | Promise<void>;
  readonly filterText?: string;
  /** Applied even when filterText is empty. Ancestors of matches are retained. */
  readonly filter?: (node: FileNode<TMetadata>) => boolean;
  readonly showHidden?: boolean;
  readonly density?: 'compact' | 'default' | 'comfortable';
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly virtualized?: boolean;
  readonly overscan?: number;
  readonly estimatedItemSize?: number;
  readonly getIcon?: (node: FileNode<TMetadata>, expanded: boolean) => ReactNode;
  readonly renderMetadata?: (node: FileNode<TMetadata>) => ReactNode;
  readonly loading?: boolean;
  readonly error?: ReactNode;
  readonly empty?: ReactNode;
}

export interface FileExplorerAction<TMetadata = unknown> {
  readonly id: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly capability: FileCapability;
  readonly onSelect: (node: FileNode<TMetadata> | null) => void | Promise<void>;
}

export interface FileExplorerProps<TMetadata = unknown> extends Omit<
  FileTreeProps<TMetadata>,
  'children'
> {
  readonly sourceLabel?: ReactNode;
  readonly contextPanel?: ReactNode;
  readonly toolbarActions?: ReactNode;
  readonly actions?: readonly FileExplorerAction<TMetadata>[];
  readonly preview?: (node: FileNode<TMetadata>) => ReactNode;
  readonly previewVisible?: boolean;
  readonly defaultPreviewVisible?: boolean;
  readonly onPreviewVisibleChange?: (visible: boolean) => void;
  readonly onFilterTextChange?: (value: string) => void;
  readonly onShowHiddenChange?: (show: boolean) => void;
  readonly defaultTreeSize?: number;
  readonly sync?: FileExplorerSync;
  readonly status?: ReactNode;
  /** Optional content when nothing is selected, such as ShortcutSummary. */
  readonly emptyPreview?: ReactNode;
}

export interface FilePreviewProps<TMetadata = unknown> extends HTMLAttributes<HTMLElement> {
  readonly node: FileNode<TMetadata>;
  /** Override display-only parent path for opaque provider resources. */
  readonly parentPath?: string;
  readonly actions?: ReactNode;
  readonly readOnly?: boolean;
  readonly showMetadata?: boolean;
}

export interface UseFileSystemOptions<TMetadata = unknown> {
  readonly provider: FileProvider<TMetadata>;
  readonly source: FileSource;
  readonly defaultLive?: boolean;
  readonly maxPendingChanges?: number;
  readonly previewNodeId?: string | null;
  readonly previewEnabled?: boolean;
  readonly readLimit?: number;
}

export interface FileSearchState<TMetadata = unknown> {
  readonly status: 'idle' | 'loading' | 'ready' | 'error';
  readonly query: string;
  readonly nodes: readonly FileNode<TMetadata>[];
  readonly coverage?: 'complete' | 'partial';
  readonly nextCursor?: string;
  readonly error?: Error;
}

export interface FileActionState {
  readonly status: 'idle' | 'running' | 'complete' | 'cancelled' | 'error';
  readonly actionId?: string;
  readonly progress?: FileActionProgress;
  readonly error?: Error;
}

export interface UseFileSystemResult<TMetadata = unknown> {
  readonly nodes: readonly FileNode<TMetadata>[];
  readonly childrenState: ReadonlyMap<string | null, FileChildrenState>;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly content: FileContentState;
  readonly sync: FileExplorerSync;
  readonly searchState: FileSearchState<TMetadata>;
  readonly actionState: FileActionState;
  loadChildren(node: FileNode<TMetadata>): Promise<void>;
  loadMore(node: FileNode<TMetadata> | null): Promise<void>;
  refresh(): Promise<void>;
  search(query: string, cursor?: string): Promise<void>;
  runAction(actionId: string, node?: FileNode<TMetadata> | null): Promise<void>;
  cancelAction(): void;
}
