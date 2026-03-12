import { useState, useCallback } from 'react';
import { ResizableSplitPane, StatusBar } from '@omniview/base-ui';
import { TreePane } from './components/TreePane';
import { DetailPanel } from './components/DetailPanel';
import { ExplorerToolbar } from './components/ExplorerToolbar';
import { localFiles, remoteFiles, countNodes, formatBytes } from './data';
import type { FileNode, FileSelection } from './types';
import styles from './index.module.css';

export default function FileExplorer() {
  const [selected, setSelected] = useState<FileSelection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectFile = useCallback(
    (pane: 'local' | 'remote') =>
      (node: FileNode, path: string[]) => {
        setSelected({ pane, node, path });
      },
    [],
  );

  // Compute status bar counts from both roots combined
  const localCounts = countNodes(localFiles);
  const remoteCounts = countNodes(remoteFiles);
  const totalItems = localCounts.files + localCounts.folders + remoteCounts.files + remoteCounts.folders;
  const totalFolders = localCounts.folders + remoteCounts.folders;
  const totalFiles = localCounts.files + remoteCounts.files;
  const totalSize = localCounts.totalSize + remoteCounts.totalSize;

  return (
    <div className={styles.explorer}>
      <ExplorerToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hasSelection={selected != null}
      />
      <div className={styles.content}>
        <ResizableSplitPane direction="horizontal" defaultSize={600} minSize={200}>
          <ResizableSplitPane direction="horizontal" defaultSize={300} minSize={120}>
            <TreePane
              label="Local"
              root={localFiles}
              onSelectFile={handleSelectFile('local')}
              searchQuery={searchQuery}
            />
            <TreePane
              label="Remote (S3)"
              root={remoteFiles}
              onSelectFile={handleSelectFile('remote')}
              searchQuery={searchQuery}
            />
          </ResizableSplitPane>
          <DetailPanel node={selected?.node ?? null} />
        </ResizableSplitPane>
      </div>
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Item>
            {totalItems} items • {totalFolders} folders, {totalFiles} files • {formatBytes(totalSize)}
          </StatusBar.Item>
        </StatusBar.Section>
        {selected && (
          <StatusBar.Section align="end">
            <StatusBar.Item>
              {selected.pane === 'local' ? 'Local' : 'Remote'}: {selected.node.name}
            </StatusBar.Item>
          </StatusBar.Section>
        )}
      </StatusBar>
    </div>
  );
}
