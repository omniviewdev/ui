import { useState, useCallback, useMemo } from 'react';
import {
  LuFolder,
  LuFolderOpen,
  LuTextCursor,
  LuDownload,
  LuUpload,
  LuPencil,
  LuTrash2,
  LuFolderPlus,
  LuRefreshCw,
  LuCopy,
  LuClipboardPaste,
  LuHardDrive,
  LuCloud,
} from 'react-icons/lu';
import { TreeList, Breadcrumbs, IconButton, useToast, FileTable } from '@omniview/base-ui';
import type { Key } from '@omniview/base-ui';
import type { FileNode } from '../types';
import styles from './FilePane.module.css';

// ---------------------------------------------------------------------------
// Path map for tree navigation
// ---------------------------------------------------------------------------

interface PathEntry {
  node: FileNode;
  path: string[];
}

function buildPathMap(root: FileNode): Map<string, PathEntry> {
  const map = new Map<string, PathEntry>();
  function walk(node: FileNode, path: string[]) {
    const nodePath = [...path, node.name];
    map.set(node.id, { node, path: nodePath });
    for (const child of node.children ?? []) {
      walk(child, nodePath);
    }
  }
  walk(root, []);
  return map;
}

// ---------------------------------------------------------------------------
// FilePane
// ---------------------------------------------------------------------------

export interface FilePaneProps {
  title: string;
  subtitle?: string;
  root: FileNode;
  side: 'local' | 'remote';
  searchQuery: string;
}

export function FilePane({ title, subtitle, root, side, searchQuery }: FilePaneProps) {
  const [currentDir, setCurrentDir] = useState<FileNode>(root);
  const [currentPath, setCurrentPath] = useState<string[]>([root.name]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<Key>>(new Set([root.id]));
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<ReadonlySet<Key>>(new Set([root.id]));
  const { toast } = useToast();

  const pathMap = useMemo(() => buildPathMap(root), [root]);

  // Navigate to a folder
  const navigateTo = useCallback((node: FileNode, path: string[]) => {
    setCurrentDir(node);
    setCurrentPath(path);
    setSelectedFile(null);
    setSelectedTreeKeys(new Set([node.id]));
    setExpandedKeys((prev) => new Set([...prev, node.id]));
  }, []);

  // Tree selection handler
  const handleTreeSelect = useCallback((keys: ReadonlySet<Key>) => {
    setSelectedTreeKeys(keys);
    const key = [...keys][0];
    if (!key) return;
    const entry = pathMap.get(String(key));
    if (entry && entry.node.type === 'folder') {
      navigateTo(entry.node, entry.path);
    }
  }, [pathMap, navigateTo]);

  // Go up one directory
  const handleGoUp = useCallback(() => {
    if (currentPath.length <= 1) return;
    const parentPath = currentPath.slice(0, -1);
    for (const [, entry] of pathMap) {
      if (entry.path.length === parentPath.length && entry.path.every((s, i) => s === parentPath[i])) {
        navigateTo(entry.node, entry.path);
        break;
      }
    }
  }, [currentPath, pathMap, navigateTo]);

  // Double-click folder in table
  const handleRowDoubleClick = useCallback((node: FileNode) => {
    if (node.type !== 'folder') return;
    const entry = pathMap.get(node.id);
    if (entry) navigateTo(entry.node, entry.path);
  }, [pathMap, navigateTo]);

  // Filtered items
  const filteredItems = useMemo(() => {
    const children = currentDir.children ?? [];
    return searchQuery
      ? children.filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : children;
  }, [currentDir.children, searchQuery]);

  const handleAction = useCallback((action: string) => {
    toast(`${action}`, { severity: 'success' });
  }, [toast]);

  const isRemote = side === 'remote';

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>
          {isRemote ? <LuCloud size={14} /> : <LuHardDrive size={14} />}
        </span>
        <span className={styles.headerTitle}>{title}</span>
        {subtitle && <span className={styles.headerSubtitle}>{subtitle}</span>}
      </div>

      {/* Breadcrumb path */}
      <div className={styles.breadcrumbBar}>
        <Breadcrumbs size="sm">
          {currentPath.map((segment, i) => (
            <Breadcrumbs.Item
              key={i}
              active={i === currentPath.length - 1}
              onClick={i < currentPath.length - 1 ? () => {
                // Navigate to this breadcrumb segment
                const targetPath = currentPath.slice(0, i + 1);
                for (const [, entry] of pathMap) {
                  if (entry.path.length === targetPath.length && entry.path.every((s, j) => s === targetPath[j])) {
                    navigateTo(entry.node, entry.path);
                    break;
                  }
                }
              } : undefined}
              style={i < currentPath.length - 1 ? { cursor: 'pointer' } : undefined}
            >
              {segment}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      </div>

      {/* Compact folder tree */}
      <div className={styles.treeSection}>
        <TreeList.Root
          items={[root]}
          itemKey={(item) => item.id}
          getChildren={(item) => item.children?.filter((c) => c.type === 'folder')}
          isBranch={(item) => item.type === 'folder' && (item.children?.some((c) => c.type === 'folder') ?? false)}
          getTextValue={(item) => item.name}
          selectionMode="single"
          selectedKeys={selectedTreeKeys}
          onSelectedKeysChange={handleTreeSelect}
          expandedKeys={expandedKeys}
          onExpandedKeysChange={setExpandedKeys}
          renderItem={(item, node) => (
            <TreeList.Item itemKey={node.key} textValue={item.name}>
              <TreeList.ItemIndent
                depth={node.depth}
                ancestorIsLast={node.ancestorIsLast}
                isLastChild={node.isLastChild}
              />
              <TreeList.ItemToggle itemKey={node.key} />
              <TreeList.ItemIcon>
                {node.isExpanded ? <LuFolderOpen /> : <LuFolder />}
              </TreeList.ItemIcon>
              <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
            </TreeList.Item>
          )}
        >
          <TreeList.Viewport />
        </TreeList.Root>
      </div>

      <FileTable.Root
        items={filteredItems}
        onNavigate={handleRowDoubleClick}
        onSelect={(item) => setSelectedFile(item.id)}
        selectedId={selectedFile ?? undefined}
        showParent={currentPath.length > 1}
        onNavigateUp={handleGoUp}
        className={styles.tableSection}
      >
        <FileTable.Header>
          {isRemote && (
            <FileTable.Column
              id="owner"
              header="Owner / Group"
              accessor={(item: FileNode) => `${item.owner ?? 'sftpclient'} / ${item.group ?? 'sftp'}`}
              width={100}
            />
          )}
          {isRemote && (
            <FileTable.Column
              id="permissions"
              header="Permissions"
              accessor={(item: FileNode) => item.permissions ?? 'rwxr-xr-x'}
              mono
              width={90}
            />
          )}
        </FileTable.Header>
        <FileTable.Body
          rowActions={(item) => (
            <IconButton
              variant="ghost"
              size="sm"
              dense
              aria-label={isRemote ? 'Download' : 'Upload'}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(`${isRemote ? 'Download' : 'Upload'}: ${item.name}`);
              }}
            >
              {isRemote ? <LuDownload size={12} /> : <LuUpload size={12} />}
            </IconButton>
          )}
        />
        <FileTable.Status />
      </FileTable.Root>

      {/* Action bar */}
      <div className={styles.actionBar}>
        <IconButton variant="ghost" size="sm" dense aria-label={isRemote ? 'Download' : 'Upload'} onClick={() => handleAction(isRemote ? 'Download' : 'Upload')}>
          {isRemote ? <LuDownload size={13} /> : <LuUpload size={13} />}
        </IconButton>
        <IconButton variant="ghost" size="sm" dense aria-label="Edit" onClick={() => handleAction('Edit')}>
          <LuPencil size={13} />
        </IconButton>
        <IconButton variant="ghost" size="sm" dense aria-label="Rename" onClick={() => handleAction('Rename')}>
          <LuTextCursor size={13} />
        </IconButton>
        <IconButton variant="ghost" size="sm" dense aria-label="Delete" onClick={() => handleAction('Delete')}>
          <LuTrash2 size={13} />
        </IconButton>
        <IconButton variant="ghost" size="sm" dense aria-label="Copy" onClick={() => handleAction('Copy')}>
          <LuCopy size={13} />
        </IconButton>
        <IconButton variant="ghost" size="sm" dense aria-label="Paste" onClick={() => handleAction('Paste')}>
          <LuClipboardPaste size={13} />
        </IconButton>
        <IconButton variant="ghost" size="sm" dense aria-label="New Folder" onClick={() => handleAction('New Folder')}>
          <LuFolderPlus size={13} />
        </IconButton>
        <IconButton variant="ghost" size="sm" dense aria-label="Refresh" onClick={() => handleAction('Refresh')}>
          <LuRefreshCw size={13} />
        </IconButton>
      </div>
    </div>
  );
}
