import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { FileTree } from './FileTree';
import { FileExplorer } from './FileExplorer';
import { FilePreview } from './FilePreview';
import type { FileChildrenState, FileNode } from './types';

const nodes: readonly FileNode<{ visible: boolean }>[] = [
  {
    id: 'root',
    parentId: null,
    name: 'src',
    path: '/src',
    kind: 'directory',
    metadata: { visible: false },
  },
  {
    id: 'yes',
    parentId: 'root',
    name: 'match.ts',
    path: '/src/match.ts',
    kind: 'file',
    metadata: { visible: true },
  },
  {
    id: 'no',
    parentId: 'root',
    name: 'match.secret',
    path: '/src/match.secret',
    kind: 'file',
    metadata: { visible: false },
  },
  {
    id: 'hidden',
    parentId: null,
    name: '.env',
    path: '/.env',
    kind: 'file',
    hidden: true,
    metadata: { visible: true },
  },
];

describe('FileTree', () => {
  it('reports unknown sibling totals until a paged listing becomes complete', () => {
    const listed: FileNode[] = ['first', 'second'].map((name) => ({
      id: name,
      parentId: null,
      name,
      path: '/' + name,
      kind: 'file',
      metadata: null,
    }));
    const { rerender } = renderWithTheme(
      <FileTree
        nodes={listed}
        virtualized={false}
        childrenState={
          new Map<string | null, FileChildrenState>([
            [null, { status: 'loaded', complete: false, nextCursor: 'next' }],
          ])
        }
      />,
    );
    expect(screen.getByRole('treeitem', { name: 'second' })).toHaveAttribute('aria-posinset', '2');
    expect(screen.getByRole('treeitem', { name: 'second' })).toHaveAttribute('aria-setsize', '-1');
    rerender(
      <FileTree
        nodes={listed}
        virtualized={false}
        childrenState={
          new Map<string | null, FileChildrenState>([[null, { status: 'loaded', complete: true }]])
        }
      />,
    );
    expect(screen.getByRole('treeitem', { name: 'second' })).toHaveAttribute('aria-setsize', '2');
  });

  it('keeps ancestors without allowing text search to reveal metadata-hidden files', () => {
    renderWithTheme(
      <FileTree
        nodes={nodes}
        virtualized={false}
        filter={(node) => node.metadata.visible}
        filterText="match"
      />,
    );
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('match.ts')).toBeInTheDocument();
    expect(screen.queryByText('match.secret')).not.toBeInTheDocument();
  });

  it('applies metadata filtering independently of text', () => {
    renderWithTheme(
      <FileTree
        nodes={nodes}
        virtualized={false}
        defaultExpandedKeys={['root']}
        filter={(node) => node.metadata.visible}
      />,
    );
    expect(screen.getByText('match.ts')).toBeInTheDocument();
    expect(screen.queryByText('match.secret')).not.toBeInTheDocument();
  });

  it('matches display names without assuming opaque paths contain filenames', () => {
    const entry: FileNode = {
      id: 'opaque',
      parentId: null,
      name: 'Config.yaml',
      path: 'entry:730',
      kind: 'file',
      metadata: null,
    };
    renderWithTheme(<FileTree nodes={[entry]} filterText="config" virtualized={false} />);
    expect(screen.getByRole('treeitem', { name: 'Config.yaml' })).toBeInTheDocument();
  });

  it('loads a partial branch without selecting the branch', () => {
    function PagedTree() {
      const [complete, setComplete] = useState(false);
      const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
      return (
        <>
          <FileTree
            nodes={complete ? nodes : nodes.slice(0, 1)}
            virtualized={false}
            defaultExpandedKeys={['root']}
            childrenState={new Map([['root', { status: 'loaded', complete }]])}
            onLoadMore={() => setComplete(true)}
            selectedKeys={selection}
            onSelectedKeysChange={setSelection}
          />
          <output>Selection: {selection.size ? Array.from(selection).join(',') : 'none'}</output>
        </>
      );
    }
    renderWithTheme(<PagedTree />);
    expect(screen.queryByText('match.ts')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(screen.getByText('match.ts')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    expect(screen.getByText('Selection: none')).toBeInTheDocument();
  });

  it('retries a failed root and replaces the failure with loaded entries', () => {
    function RetryingTree() {
      const [ready, setReady] = useState(false);
      const state: FileChildrenState = ready
        ? { status: 'loaded', complete: true }
        : { status: 'error', error: new Error('Access denied') };
      return (
        <FileTree
          nodes={ready ? nodes : []}
          virtualized={false}
          childrenState={new Map([[null, state]])}
          onLoadMore={() => setReady(true)}
        />
      );
    }
    renderWithTheme(<RetryingTree />);
    const retry = screen.getByRole('button', { name: 'Retry' });
    expect(retry.closest('[role="tree"]')).toBeNull();
    fireEvent.click(retry);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
  });
  it('withholds empty-directory actions until expanded branch loading finishes', () => {
    const folder: FileNode = {
      id: 'pending',
      parentId: null,
      name: 'pending',
      path: '/pending',
      kind: 'directory',
      metadata: null,
    };
    const props = {
      nodes: [folder],
      defaultExpandedKeys: ['pending'],
      filter: () => false,
      virtualized: false,
      empty: <a href="/new">Create file</a>,
    };
    const { rerender } = renderWithTheme(
      <FileTree
        {...props}
        childrenState={new Map<string, FileChildrenState>([['pending', { status: 'loading' }]])}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Create file' })).not.toBeInTheDocument();
    rerender(
      <FileTree
        {...props}
        childrenState={
          new Map<string, FileChildrenState>([['pending', { status: 'loaded', complete: true }]])
        }
      />,
    );
    expect(screen.getByRole('link', { name: 'Create file' })).toBeInTheDocument();
  });
});

describe('FileExplorer', () => {
  it('drains pending changes by refreshing while live sync remains off', () => {
    function ManualExplorer() {
      const [pending, setPending] = useState(true);
      const [enabled, setEnabled] = useState(false);
      return (
        <FileExplorer
          nodes={pending ? [] : nodes}
          virtualized={false}
          sync={{
            enabled,
            status: 'idle',
            pendingChanges: pending ? 3 : 0,
            onEnabledChange: setEnabled,
            onRefresh: () => setPending(false),
          }}
        />
      );
    }
    renderWithTheme(<ManualExplorer />);
    expect(screen.getByText('3 updates available')).toBeInTheDocument();
    expect(screen.queryByText('src')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(screen.queryByText('3 updates available')).not.toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Live sync' })).not.toBeChecked();
  });

  it('removes preview and separator when closed', () => {
    renderWithTheme(
      <FileExplorer
        nodes={nodes}
        virtualized={false}
        defaultSelectedKeys={['yes']}
        preview={(node) => <FilePreview node={node}>File body</FilePreview>}
      />,
    );
    expect(screen.getByText('File body')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.queryByText('File body')).not.toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('keeps controlled filtering and hidden visibility authoritative', () => {
    renderWithTheme(
      <FileExplorer
        nodes={nodes}
        virtualized={false}
        filterText=""
        showHidden={false}
        defaultExpandedKeys={['root']}
      />,
    );
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } });
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByText('match.ts')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hidden' }));
    expect(screen.getByRole('button', { name: 'Hidden' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText('.env')).not.toBeInTheDocument();
  });

  it('uses selection order rather than source order for the preview target', () => {
    renderWithTheme(
      <FileExplorer
        nodes={nodes}
        virtualized={false}
        selectedKeys={new Set(['yes', 'root'])}
        preview={(node) => <span>Preview target: {node.id}</span>}
      />,
    );
    expect(screen.getByText('Preview target: yes')).toBeInTheDocument();
  });

  it('disables unavailable live sync while retaining manual recovery', () => {
    function UnavailableExplorer() {
      const [stale, setStale] = useState(true);
      const [enabled, setEnabled] = useState(false);
      return (
        <FileExplorer
          nodes={nodes}
          virtualized={false}
          sync={{
            available: false,
            enabled,
            status: stale ? 'stale' : 'idle',
            pendingChanges: 0,
            onEnabledChange: setEnabled,
            onRefresh: () => setStale(false),
          }}
        />
      );
    }
    renderWithTheme(<UnavailableExplorer />);
    expect(screen.getByRole('checkbox', { name: 'Live sync unavailable' })).toBeDisabled();
    expect(screen.getByText('Refresh needed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(screen.queryByText('Refresh needed')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Live sync unavailable' })).not.toBeChecked();
  });
});

describe('FilePreview', () => {
  it('displays Windows parent paths without normalizing their separators', () => {
    const node: FileNode = { ...nodes[1]!, path: 'C:\\work\\match.ts' };
    renderWithTheme(<FilePreview node={node}>Supplied content</FilePreview>);
    expect(screen.getByText('C:\\work')).toHaveAttribute('title', node.path);
    expect(screen.getByText('match.ts')).toHaveAttribute('title', node.path);
    expect(screen.getByLabelText('Read only')).toBeInTheDocument();
  });

  it('accepts a caller path label for opaque source paths', () => {
    renderWithTheme(<FilePreview node={nodes[1]!} parentPath="Workspace" readOnly={false} />);
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.queryByLabelText('Read only')).not.toBeInTheDocument();
  });
});
