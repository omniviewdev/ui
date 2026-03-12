import { useState, useCallback } from 'react';
import { ResizableSplitPane } from '@omniview/base-ui';
import { TreePane } from './components/TreePane';
import { localFiles, remoteFiles } from './data';
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

  // Suppress unused warning — searchQuery will be wired to toolbar in Task 3
  void setSearchQuery;

  return (
    <div className={styles.explorer}>
      {/* Toolbar placeholder for Task 3 */}
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
          <div className={styles.detailPlaceholder}>
            {selected ? <p>Selected: {selected.node.name}</p> : <p>Select a file</p>}
          </div>
        </ResizableSplitPane>
      </div>
      {/* StatusBar placeholder for Task 3 */}
    </div>
  );
}
