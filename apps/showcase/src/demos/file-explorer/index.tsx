import { useState } from 'react';
import { ResizableSplitPane } from '@omniview/base-ui';
import { FilePane } from './components/FilePane';
import { TransferPanel } from './components/TransferPanel';
import { CommandLog } from './components/CommandLog';
import { localFiles, remoteFiles, mockTransfers, mockLogEntries } from './data';
import styles from './index.module.css';

export default function FileExplorer() {
  const [searchQuery] = useState('');

  return (
    <div className={styles.explorer}>
      {/* Command log */}
      <CommandLog entries={mockLogEntries} />

      {/* Main area: dual panes + transfer panel */}
      <div className={styles.mainArea}>
        <ResizableSplitPane direction="vertical" defaultSize={500} minSize={200}>
          {/* Dual file panes */}
          <ResizableSplitPane direction="horizontal" defaultSize={500} minSize={250}>
            <FilePane
              title="Local Filesystem"
              root={localFiles}
              side="local"
              searchQuery={searchQuery}
            />
            <FilePane
              title="Remote (S3)"
              subtitle="s3://my-bucket"
              root={remoteFiles}
              side="remote"
              searchQuery={searchQuery}
            />
          </ResizableSplitPane>

          {/* Transfer panel */}
          <TransferPanel transfers={mockTransfers} />
        </ResizableSplitPane>
      </div>
    </div>
  );
}
