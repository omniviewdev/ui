import { useState, useCallback, useMemo } from 'react';
import { LuFolder, LuFolderOpen, LuFile, LuCopy, LuMove, LuPencil, LuTrash2, LuFolderPlus } from 'react-icons/lu';
import { TreeList, Breadcrumbs, ContextMenu, useToast } from '@omniviewdev/base-ui';
import type { Key } from '@omniviewdev/base-ui';
import type { FileNode } from '../types';
import styles from './TreePane.module.css';

// ---------------------------------------------------------------------------
// Path map helpers
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
// TreePane
// ---------------------------------------------------------------------------

export interface TreePaneProps {
  label: string;
  root: FileNode;
  onSelectFile: (node: FileNode, path: string[]) => void;
  searchQuery: string;
}

export function TreePane({ label, root, onSelectFile, searchQuery }: TreePaneProps) {
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<Key>>(new Set());
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<Key>>(
    new Set([root.id]),
  );
  const { toast } = useToast();

  // Build path map once per root change
  const pathMap = useMemo(() => buildPathMap(root), [root]);

  // Derive breadcrumb path from selected key
  const selectedPath = useMemo<string[]>(() => {
    const selectedId = [...selectedKeys][0];
    if (selectedId == null) return [];
    return pathMap.get(String(selectedId))?.path ?? [];
  }, [selectedKeys, pathMap]);

  const handleSelectedKeysChange = useCallback(
    (keys: ReadonlySet<Key>) => {
      setSelectedKeys(keys);
      const selectedId = [...keys][0];
      if (selectedId == null) return;
      const entry = pathMap.get(String(selectedId));
      if (entry) {
        onSelectFile(entry.node, entry.path);
      }
    },
    [pathMap, onSelectFile],
  );

  const filterFn = useCallback((item: FileNode, text: string): boolean => {
    return item.name.toLowerCase().includes(text.toLowerCase());
  }, []);

  const handleContextAction = useCallback((action: string, item: FileNode) => {
    toast(`${action}: ${item.name}`, { severity: 'success' });
  }, [toast]);

  return (
    <div className={styles.pane} role="region" aria-label={label}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {selectedPath.length > 0 && (
          <Breadcrumbs size="sm">
            {selectedPath.map((segment, index) => (
              <Breadcrumbs.Item key={index} active={index === selectedPath.length - 1}>
                {segment}
              </Breadcrumbs.Item>
            ))}
          </Breadcrumbs>
        )}
      </div>
      <div className={styles.treeContainer}>
        <TreeList.Root
          items={[root]}
          itemKey={(item) => item.id}
          getChildren={(item) => item.children}
          isBranch={(item) => item.type === 'folder'}
          getTextValue={(item) => item.name}
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectedKeysChange={handleSelectedKeysChange}
          expandedKeys={expandedKeys}
          onExpandedKeysChange={setExpandedKeys}
          filterText={searchQuery}
          filterFn={filterFn}
          renderItem={(item, node) => (
            <ContextMenu.Root>
              <ContextMenu.Trigger>
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
                        ? <LuFolderOpen />
                        : <LuFolder />
                      : <LuFile />}
                  </TreeList.ItemIcon>
                  <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
                </TreeList.Item>
              </ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Positioner>
                  <ContextMenu.Popup>
                    <ContextMenu.Item
                      startDecorator={<LuCopy aria-hidden />}
                      onClick={() => handleContextAction('Copy', item)}
                    >
                      Copy
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      startDecorator={<LuMove aria-hidden />}
                      onClick={() => handleContextAction('Move', item)}
                    >
                      Move
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      startDecorator={<LuPencil aria-hidden />}
                      onClick={() => handleContextAction('Rename', item)}
                    >
                      Rename
                    </ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Item
                      color="danger"
                      startDecorator={<LuTrash2 aria-hidden />}
                      onClick={() => handleContextAction('Delete', item)}
                    >
                      Delete
                    </ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Item
                      startDecorator={<LuFolderPlus aria-hidden />}
                      onClick={() => handleContextAction('New Folder', item)}
                    >
                      New Folder
                    </ContextMenu.Item>
                  </ContextMenu.Popup>
                </ContextMenu.Positioner>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          )}
        >
          <TreeList.Viewport />
        </TreeList.Root>
      </div>
    </div>
  );
}
