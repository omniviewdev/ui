import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FileExplorer } from './FileExplorer';
import { FileTree } from './FileTree';
import { FilePreview } from './FilePreview';
import type { FileNode } from './types';

const nodes: readonly FileNode[] = [
  { id: 'etc', parentId: null, name: 'etc', path: '/etc', kind: 'directory', metadata: null },
  {
    id: 'config',
    parentId: 'etc',
    name: 'service.conf',
    path: '/etc/service.conf',
    kind: 'file',
    size: 43,
    change: 'modified',
    metadata: null,
  },
  {
    id: 'secret',
    parentId: 'etc',
    name: '.token',
    path: '/etc/.token',
    kind: 'file',
    hidden: true,
    metadata: null,
  },
  {
    id: 'link',
    parentId: null,
    name: 'current',
    path: '/current',
    kind: 'symlink',
    linkTarget: '/releases/latest',
    metadata: null,
  },
];
const meta = {
  title: 'Files/FileExplorer',
  component: FileExplorer,
  args: { nodes },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FileExplorer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Composed: Story = {
  render: () => (
    <div style={{ height: 480 }}>
      <FileExplorer
        nodes={nodes}
        sourceLabel="Filesystem"
        defaultExpandedKeys={['etc']}
        defaultSelectedKeys={['config']}
        status="4 loaded entries"
        preview={(node) => (
          <FilePreview node={node} readOnly showMetadata>
            {node.id === 'config' ? (
              <pre style={{ padding: 16, margin: 0 }}>listen = 8080{'\n'}log_level = info</pre>
            ) : (
              <div style={{ padding: 16 }}>No content supplied</div>
            )}
          </FilePreview>
        )}
      />
    </div>
  ),
};

export const StandaloneTree: Story = {
  render: () => (
    <div style={{ height: 320, width: 360 }}>
      <FileTree
        nodes={nodes}
        defaultExpandedKeys={['etc']}
        showHidden
        renderMetadata={(node) => (node.size !== undefined ? `${node.size} B` : null)}
      />
    </div>
  ),
};

export const PartialAndFailedBranches: Story = {
  render: () => (
    <div style={{ height: 320, width: 420 }}>
      <FileTree
        nodes={nodes}
        defaultExpandedKeys={['etc']}
        childrenState={
          new Map([['etc', { status: 'error', error: new Error('Permission denied') }]])
        }
      />
    </div>
  ),
};

export const ClosedPreview: Story = {
  render: () => (
    <div style={{ height: 320 }}>
      <FileExplorer
        nodes={nodes}
        defaultExpandedKeys={['etc']}
        defaultPreviewVisible={false}
        preview={(node) => <FilePreview node={node} />}
      />
    </div>
  ),
};

export const LargeDirectory: Story = {
  render: function LargeDirectoryStory() {
    const [entries, setEntries] = useState<readonly FileNode[]>(() => [
      {
        id: 'archive',
        parentId: null,
        name: 'archive',
        path: '/archive',
        kind: 'directory',
        metadata: null,
      },
      ...Array.from({ length: 99999 }, (_, index): FileNode => ({
        id: `file-${index}`,
        parentId: index < 50000 ? null : 'archive',
        name: `file-${String(index).padStart(5, '0')}.conf`,
        path: `${index < 50000 ? '' : '/archive'}/file-${String(index).padStart(5, '0')}.conf`,
        kind: 'file',
        size: 1024,
        metadata: null,
      })),
    ]);
    const [query, setQuery] = useState('');
    return (
      <div style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 8, padding: 8 }}>
          <label>
            Filter loaded paths{' '}
            <input value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <button
            type="button"
            onClick={() =>
              setEntries((previous) =>
                previous.map((entry, index) =>
                  index > 0 && index <= 100 ? { ...entry, change: 'modified' } : entry,
                ),
              )
            }
          >
            Apply 100 changes
          </button>
        </div>
        <FileTree nodes={entries} filterText={query} selectionMode="multiple" style={{ flex: 1 }} />
      </div>
    );
  },
};
