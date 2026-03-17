import { useState, useEffect } from 'react';
import type { Key } from '@omniview/base-ui';
import { TreeList } from '@omniview/base-ui';
import { LuFolder, LuFolderOpen, LuFile } from 'react-icons/lu';
import type { ContainerDetail, FileSystemNode } from '../../types';

export interface FilesTabProps {
  container: ContainerDetail;
}

function formatSize(bytes?: number): string {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesTab({ container }: FilesTabProps) {
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<Key>>(
    new Set(container.filesystem.map((n) => n.id)),
  );
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<Key>>(new Set());

  useEffect(() => {
    setExpandedKeys(new Set(container.filesystem.map((n) => n.id)));
    setSelectedKeys(new Set());
  }, [container.id]);

  return (
    <TreeList.Root
      items={container.filesystem}
      itemKey={(item) => item.id}
      getChildren={(item) => item.children}
      isBranch={(item) => item.type === 'directory'}
      getTextValue={(item) => item.name}
      selectionMode="single"
      selectedKeys={selectedKeys}
      onSelectedKeysChange={setSelectedKeys}
      expandedKeys={expandedKeys}
      onExpandedKeysChange={setExpandedKeys}
      showBranchConnectors
      renderItem={(item: FileSystemNode, node) => (
        <TreeList.Item itemKey={node.key} textValue={item.name}>
          <TreeList.ItemIndent
            depth={node.depth}
            ancestorIsLast={node.ancestorIsLast}
            isLastChild={node.isLastChild}
          />
          <TreeList.ItemToggle itemKey={node.key} />
          <TreeList.ItemIcon>
            {item.type === 'directory'
              ? node.isExpanded
                ? <LuFolderOpen aria-hidden />
                : <LuFolder aria-hidden />
              : <LuFile aria-hidden />}
          </TreeList.ItemIcon>
          <TreeList.ItemLabel>{item.name}</TreeList.ItemLabel>
          {item.size !== undefined && (
            <TreeList.ItemMeta>{formatSize(item.size)}</TreeList.ItemMeta>
          )}
        </TreeList.Item>
      )}
    >
      <TreeList.Viewport />
    </TreeList.Root>
  );
}
