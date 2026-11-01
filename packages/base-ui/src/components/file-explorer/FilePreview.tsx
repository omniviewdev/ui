import { LuLock } from 'react-icons/lu';
import type { FilePreviewProps } from './types';
import styles from './FileExplorer.module.css';

export function FilePreview<TMetadata = unknown>({
  node,
  actions,
  readOnly = true,
  parentPath,
  showMetadata = false,
  children,
  className,
  ...props
}: FilePreviewProps<TMetadata>) {
  const separator = Math.max(node.path.lastIndexOf('/'), node.path.lastIndexOf('\\'));
  const displayedParent =
    parentPath ??
    (separator < 0
      ? ''
      : separator === 0
        ? node.path[0]
        : separator === 2 && node.path[1] === ':'
          ? node.path.slice(0, 3)
          : node.path.slice(0, separator));
  return (
    <section
      {...props}
      className={[styles.preview, className].filter(Boolean).join(' ')}
      aria-label={props['aria-label'] ?? `Preview ${node.name}`}
    >
      <header className={styles.previewHeader}>
        <strong className={styles.filename} title={node.path}>
          {node.name}
        </strong>
        <span className={styles.parentPath} title={node.path}>
          {displayedParent}
        </span>
        {node.change && node.change !== 'unchanged' && (
          <span className={styles.change} data-change={node.change} aria-label={node.change}>
            {node.change === 'added'
              ? 'A'
              : node.change === 'modified'
                ? 'M'
                : node.change === 'deleted'
                  ? 'D'
                  : '?'}
          </span>
        )}
        {readOnly && (
          <span className={styles.lock} title="Read only" aria-label="Read only">
            <LuLock />
          </span>
        )}
        {actions && <div className={styles.previewActions}>{actions}</div>}
      </header>
      {showMetadata && (
        <dl className={styles.details}>
          <dt>Kind</dt>
          <dd>{node.kind}</dd>
          {node.size !== undefined && (
            <>
              <dt>Size</dt>
              <dd>{node.size.toLocaleString()} bytes</dd>
            </>
          )}
          {node.mode !== undefined && (
            <>
              <dt>Mode</dt>
              <dd>{node.mode.toString(8)}</dd>
            </>
          )}
          {node.modifiedAt !== undefined && (
            <>
              <dt>Modified</dt>
              <dd>
                <time dateTime={new Date(node.modifiedAt).toISOString()}>
                  {new Date(node.modifiedAt).toLocaleString()}
                </time>
              </dd>
            </>
          )}
          {node.linkTarget && (
            <>
              <dt>Link target</dt>
              <dd>{node.linkTarget}</dd>
            </>
          )}
        </dl>
      )}
      <div className={styles.previewContent}>{children}</div>
    </section>
  );
}
