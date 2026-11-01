import { lazy, Suspense, useEffect, useState } from 'react';
import { FilePreview } from '@omniviewdev/base-ui';
import type {
  FileChildrenState,
  FileContent,
  FileContentState,
  FileNode,
} from '@omniviewdev/base-ui';
import type { FixtureMetadata } from './types';
import type { FixtureFileProvider } from './provider';
import styles from './index.module.css';

const DiffViewer = lazy(async () => {
  const [module] = await Promise.all([
    import('@omniviewdev/editors'),
    import('@omniviewdev/editors/styles.css'),
  ]);
  return { default: module.DiffViewer };
});

interface PreviewProps {
  readonly node: FileNode<FixtureMetadata>;
  readonly provider: FixtureFileProvider;
  readonly content: FileContentState;
  readonly compare: boolean;
  readonly branchState?: FileChildrenState;
  readonly onDownload: () => void;
}

export function Preview({
  node,
  provider,
  content,
  compare,
  branchState,
  onDownload,
}: PreviewProps) {
  const [baseline, setBaseline] = useState<{
    readonly nodeId: string;
    readonly content?: FileContent;
    readonly error?: string;
  } | null>(null);
  useEffect(() => {
    if (
      node.kind !== 'file' ||
      node.metadata.baseline !== 'present' ||
      (!compare && node.metadata.readFrom !== 'baseline')
    )
      return;
    const controller = new AbortController();
    void provider.readBaseline(node, controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) setBaseline({ nodeId: node.id, content: value });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setBaseline({
            nodeId: node.id,
            error: error instanceof Error ? error.message : 'Baseline unavailable',
          });
      },
    );
    return () => {
      controller.abort();
    };
  }, [compare, node, provider]);

  const before = baseline?.nodeId === node.id ? baseline : null;
  const ready =
    node.metadata.readFrom === 'baseline'
      ? before?.content
      : content.status === 'ready' && content.nodeId === node.id
        ? content.content
        : null;
  let body;
  if (branchState?.status === 'error') {
    body = (
      <div className={styles.center} role="alert">
        {branchState.error.message}
      </div>
    );
  } else if (node.kind === 'directory') {
    body = (
      <div className={styles.center}>
        {branchState?.status === 'loading'
          ? 'Loading directory…'
          : branchState?.status === 'loaded'
            ? 'Directory'
            : 'Directory not loaded'}
      </div>
    );
  } else if (node.kind === 'symlink') {
    body = (
      <div className={styles.center}>
        <strong>Symbolic link</strong>
        <code>
          {node.path} → {node.linkTarget}
        </code>
      </div>
    );
  } else if (node.kind !== 'file') {
    body = <div className={styles.center}>{node.kind} · content unavailable</div>;
  } else if (content.status === 'error' && content.nodeId === node.id) {
    body = (
      <div className={styles.center} role="alert">
        {content.error.message}
      </div>
    );
  } else if (node.metadata.readFrom === 'baseline' && before?.error) {
    body = (
      <div className={styles.center} role="alert">
        {before.error}
      </div>
    );
  } else if (!ready) {
    body = (
      <div className={styles.center} role="status">
        Loading preview…
      </div>
    );
  } else if (ready.kind === 'binary') {
    body = (
      <div className={styles.center}>
        <strong>Binary file</strong>
        <span>
          {ready.mimeType} · {ready.totalBytes?.toLocaleString()} bytes
        </span>
        <button type="button" onClick={onDownload}>
          Download file
        </button>
      </div>
    );
  } else if (
    compare &&
    node.metadata.baseline === 'present' &&
    node.metadata.current === 'present'
  ) {
    body = before?.error ? (
      <div className={styles.center} role="alert">
        {before.error}
      </div>
    ) : !before?.content ? (
      <div className={styles.center} role="status">
        Loading baseline…
      </div>
    ) : before.content.kind === 'binary' ? (
      <div className={styles.center}>Binary baseline · text comparison unavailable</div>
    ) : (
      <div className={styles.diff}>
        <div className={styles.compareLabels}>
          <span>Image · layer 2</span>
          <span>Runtime snapshot</span>
        </div>
        <Suspense fallback={<div className={styles.center}>Loading comparison…</div>}>
          <DiffViewer
            original={before.content.text ?? ''}
            modified={ready.text ?? ''}
            readOnly
            bordered={false}
            language={
              node.name.endsWith('.yaml')
                ? 'yaml'
                : node.name.endsWith('.js')
                  ? 'javascript'
                  : 'plaintext'
            }
          />
        </Suspense>
      </div>
    );
  } else {
    body = <pre className={styles.code}>{ready.text}</pre>;
  }

  return (
    <FilePreview
      node={node}
      readOnly
      actions={
        node.kind === 'file' && node.change !== 'deleted' ? (
          <button type="button" onClick={onDownload}>
            Download
          </button>
        ) : undefined
      }
    >
      {node.metadata.readFrom === 'baseline' && (
        <div className={styles.notice}>Deleted · previous metadata and content</div>
      )}
      {compare && node.metadata.baseline === 'absent' && (
        <div className={styles.notice}>Added in runtime · absent from image</div>
      )}
      {compare && node.metadata.baseline === 'unknown' && (
        <div className={styles.notice}>
          Comparison unknown · {node.metadata.mount ?? 'baseline unavailable'}
        </div>
      )}
      {ready?.truncated && (
        <div className={styles.notice}>
          Preview limit reached · {ready.totalBytes?.toLocaleString()} bytes total
        </div>
      )}
      {body}
    </FilePreview>
  );
}
