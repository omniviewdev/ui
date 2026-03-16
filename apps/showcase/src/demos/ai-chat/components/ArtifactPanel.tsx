import { useCallback } from 'react';
import {
  AIArtifact,
  AIArtifactHeader,
  AIArtifactTitle,
  AIArtifactClose,
  AIArtifactActions,
  AIArtifactAction,
  AIArtifactContent,
  AICodeBlock,
} from '@omniview/ai-ui';
import { LuCopy } from 'react-icons/lu';
import type { ArtifactData } from '../types';
import styles from './ArtifactPanel.module.css';

interface ArtifactPanelProps {
  artifact: ArtifactData;
  onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(artifact.code).catch(() => {
      // Clipboard API can fail in insecure contexts
    });
  }, [artifact.code]);

  return (
    <AIArtifact variant="panel" open className={styles.Root}>
      <AIArtifactHeader>
        <AIArtifactTitle>{artifact.title}</AIArtifactTitle>
        <AIArtifactActions>
          <AIArtifactAction
            label="Copy code"
            tooltip="Copy code"
            icon={LuCopy}
            onClick={handleCopy}
          />
          <AIArtifactClose onClick={onClose} />
        </AIArtifactActions>
      </AIArtifactHeader>
      <AIArtifactContent>
        <AICodeBlock
          code={artifact.code}
          language={artifact.language}
          filename={artifact.title}
          showLineNumbers
        />
      </AIArtifactContent>
    </AIArtifact>
  );
}
