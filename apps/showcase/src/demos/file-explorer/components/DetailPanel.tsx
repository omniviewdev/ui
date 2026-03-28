import { CodeBlock, DescriptionList, Typography } from '@omniviewdev/base-ui';
import { formatBytes, timeAgo } from '../data';
import type { FileNode } from '../types';
import styles from './DetailPanel.module.css';

export interface DetailPanelProps {
  node: FileNode | null;
}

function getLanguage(extension: string | undefined): string | undefined {
  if (!extension) return undefined;
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    css: 'css',
    html: 'html',
    md: 'markdown',
    txt: 'text',
    sh: 'bash',
    cjs: 'javascript',
  };
  return map[extension] ?? extension;
}

export function DetailPanel({ node }: DetailPanelProps) {
  if (!node) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyText}>Select a file to view details</span>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Typography.Heading level={3} size="sm">
          {node.name}
        </Typography.Heading>
      </div>

      <div className={styles.meta}>
        <DescriptionList layout="vertical" size="sm">
          <DescriptionList.Item label="Type">
            {node.type === 'folder' ? 'Folder' : (node.extension ? `.${node.extension}` : 'File')}
          </DescriptionList.Item>
          {node.size != null && (
            <DescriptionList.Item label="Size">{formatBytes(node.size)}</DescriptionList.Item>
          )}
          {node.modified && (
            <DescriptionList.Item label="Modified">{timeAgo(node.modified)}</DescriptionList.Item>
          )}
          {node.permissions && (
            <DescriptionList.Item label="Permissions" copyable>
              {node.permissions}
            </DescriptionList.Item>
          )}
        </DescriptionList>
      </div>

      {node.content && (
        <div className={styles.preview}>
          <CodeBlock
            language={getLanguage(node.extension)}
            maxHeight={300}
            copyable
          >
            {node.content}
          </CodeBlock>
        </div>
      )}
    </div>
  );
}
