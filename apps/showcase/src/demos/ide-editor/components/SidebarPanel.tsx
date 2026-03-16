import { useState, useCallback } from 'react';
import { LuFile, LuFolder, LuFolderOpen } from 'react-icons/lu';
import { Accordion, TreeList, SearchInput, StatusDot } from '@omniview/base-ui';
import type { Key } from '@omniview/base-ui';
import type { SidebarPanel as SidebarPanelType, SearchResult, GitStatusEntry } from '../types';
import {
  fileTree,
  searchResults,
  gitStatus,
  type FileTreeNode,
} from '../data';
import styles from './SidebarPanel.module.css';

// ─── FileTreePanel ────────────────────────────────────────────────────────────

interface FileTreePanelProps {
  onOpenFile: (fileId: string) => void;
}

function FileTreePanel({ onOpenFile }: FileTreePanelProps) {
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<Key>>(
    new Set(['folder-src', 'folder-components', 'folder-hooks']),
  );

  const handleSelectedKeysChange = useCallback(
    (keys: ReadonlySet<Key>) => {
      const id = [...keys][0];
      if (id != null) {
        onOpenFile(String(id));
      }
    },
    [onOpenFile],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Explorer</div>
      <Accordion variant="flush" defaultExpanded={['project']} animation="fast">
        <Accordion.Item id="open-editors" title="Open Editors" disableContentPadding>
          <div className={styles.placeholderSection}>No open editors</div>
        </Accordion.Item>
        <Accordion.Item id="project" title="My-App" disableContentPadding>
          <TreeList.Root
            size="sm"
            items={fileTree}
            itemKey={(item: FileTreeNode) => item.id}
            getChildren={(item: FileTreeNode) => item.children}
            isBranch={(item: FileTreeNode) => item.type === 'folder'}
            getTextValue={(item: FileTreeNode) => item.name}
            selectionMode="single"
            onSelectedKeysChange={handleSelectedKeysChange}
            expandedKeys={expandedKeys}
            onExpandedKeysChange={setExpandedKeys}
            renderItem={(item: FileTreeNode, node) => (
              <TreeList.Item itemKey={node.key} textValue={item.name}>
                <TreeList.ItemIndent
                  depth={node.depth}
                  ancestorIsLast={node.ancestorIsLast}
                  isLastChild={node.isLastChild}
                />
                <TreeList.ItemToggle itemKey={node.key} />
                <TreeList.ItemIcon>
                  {item.type === 'folder'
                    ? node.isExpanded
                      ? <LuFolderOpen aria-hidden />
                      : <LuFolder aria-hidden />
                    : <LuFile aria-hidden />}
                </TreeList.ItemIcon>
                <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
              </TreeList.Item>
            )}
          >
            <TreeList.Viewport />
          </TreeList.Root>
        </Accordion.Item>
        <Accordion.Item id="outline" title="Outline" disableContentPadding>
          <div className={styles.placeholderSection}>No symbols found</div>
        </Accordion.Item>
        <Accordion.Item id="timeline" title="Timeline" disableContentPadding>
          <div className={styles.placeholderSection}>No timeline entries</div>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

// ─── SearchPanel ──────────────────────────────────────────────────────────────

interface SearchPanelProps {
  onOpenFile: (fileId: string) => void;
}

function SearchPanel({ onOpenFile }: SearchPanelProps) {
  const [query, setQuery] = useState('useState');

  const filtered: SearchResult[] = query
    ? searchResults.filter(
        (r) =>
          r.file.toLowerCase().includes(query.toLowerCase()) ||
          r.match.toLowerCase().includes(query.toLowerCase()) ||
          r.context.toLowerCase().includes(query.toLowerCase()),
      )
    : searchResults;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Search</div>
      <div className={styles.searchBox}>
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search"
          size="sm"
          aria-label="Search files"
        />
      </div>
      <div className={styles.searchResults}>
        {filtered.map((result, i) => (
          <button
            type="button"
            // eslint-disable-next-line react/no-array-index-key
            key={`${result.file}-${result.line}-${i}`}
            className={styles.resultItem}
            onClick={() => onOpenFile(result.file)}
          >
            <span className={styles.resultFile}>{result.file}</span>
            <span className={styles.resultMatch}>{result.context.trim()}</span>
            <span className={styles.resultLocation}>
              Ln {result.line}, Col {result.column}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── GitPanel ─────────────────────────────────────────────────────────────────

function statusToStatusDot(status: GitStatusEntry['status']): 'warning' | 'success' | 'neutral' {
  switch (status) {
    case 'modified': return 'warning';
    case 'staged': return 'success';
    case 'untracked': return 'neutral';
  }
}

function GitPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Source Control</div>
      <div className={styles.gitList}>
        {gitStatus.map((entry) => (
          <div key={entry.file} className={styles.gitItem}>
            <StatusDot status={statusToStatusDot(entry.status)} size="sm" />
            <span className={styles.gitFile}>{entry.file}</span>
            <span className={styles.gitBadge} data-status={entry.status}>
              {entry.status === 'modified' ? 'M' : entry.status === 'staged' ? 'A' : '?'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SidebarPanel ─────────────────────────────────────────────────────────────

export interface SidebarPanelProps {
  panel: SidebarPanelType;
  onOpenFile: (fileId: string) => void;
}

export function SidebarPanel({ panel, onOpenFile }: SidebarPanelProps) {
  switch (panel) {
    case 'files':
      return <FileTreePanel onOpenFile={onOpenFile} />;
    case 'search':
      return <SearchPanel onOpenFile={onOpenFile} />;
    case 'git':
      return <GitPanel />;
  }
}
