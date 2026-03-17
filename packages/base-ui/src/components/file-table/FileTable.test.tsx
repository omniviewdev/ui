import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { FileTable } from './FileTable';
import type { FileTableItem } from './FileTableContext';

const items: FileTableItem[] = [
  { id: 'f1', name: 'src', type: 'folder', modified: '2026-03-10T14:00:00Z' },
  { id: 'f2', name: 'package.json', type: 'file', size: 862, modified: '2026-03-10T12:00:00Z', extension: 'json' },
  { id: 'f3', name: 'README.md', type: 'file', size: 510, modified: '2026-03-09T10:00:00Z', extension: 'md' },
  { id: 'f4', name: 'public', type: 'folder', modified: '2026-03-01T09:00:00Z' },
];

function renderTable(props?: Partial<React.ComponentProps<typeof FileTable.Root>>) {
  return renderWithTheme(
    <FileTable.Root items={items} {...props}>
      <FileTable.Header />
      <FileTable.Body />
      <FileTable.Status />
    </FileTable.Root>,
  );
}

describe('FileTable', () => {
  it('renders all items', () => {
    renderTable();
    expect(screen.getByText('src')).toBeVisible();
    expect(screen.getByText('package.json')).toBeVisible();
    expect(screen.getByText('README.md')).toBeVisible();
    expect(screen.getByText('public')).toBeVisible();
  });

  it('sorts folders before files', () => {
    renderTable();
    const rows = screen.getAllByRole('row');
    // row 0 = header, row 1 & 2 = folders, row 3 & 4 = files
    expect(rows[1]).toHaveTextContent('public');
    expect(rows[2]).toHaveTextContent('src');
  });

  it('renders status with correct counts', () => {
    renderTable();
    expect(screen.getByText('Files: 2')).toBeVisible();
    expect(screen.getByText('Folders: 2')).toBeVisible();
  });

  it('calls onSelect when row is clicked', () => {
    const onSelect = vi.fn();
    renderTable({ onSelect });
    fireEvent.click(screen.getByText('package.json'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'f2' }));
  });

  it('calls onNavigate when folder is double-clicked', () => {
    const onNavigate = vi.fn();
    renderTable({ onNavigate });
    fireEvent.doubleClick(screen.getByText('src'));
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' }));
  });

  it('does not call onNavigate when file is double-clicked', () => {
    const onNavigate = vi.fn();
    renderTable({ onNavigate });
    fireEvent.doubleClick(screen.getByText('package.json'));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('renders ".." row when showParent is true', () => {
    const onNavigateUp = vi.fn();
    renderTable({ showParent: true, onNavigateUp });
    expect(screen.getByText('..')).toBeVisible();
    fireEvent.doubleClick(screen.getByText('..'));
    expect(onNavigateUp).toHaveBeenCalled();
  });

  it('does not render ".." row when showParent is false', () => {
    renderTable({ showParent: false });
    expect(screen.queryByText('..')).not.toBeInTheDocument();
  });

  it('renders extra columns', () => {
    renderWithTheme(
      <FileTable.Root items={items}>
        <FileTable.Header>
          <FileTable.Column id="custom" header="Custom" accessor={(i) => i.id} />
        </FileTable.Header>
        <FileTable.Body />
      </FileTable.Root>,
    );

    expect(screen.getByText('Custom')).toBeVisible();
    expect(screen.getByText('f1')).toBeVisible();
  });

  it('highlights selected row via data attribute', () => {
    renderTable({ selectedId: 'f2' });
    const row = screen.getByText('package.json').closest('tr');
    expect(row).toHaveAttribute('data-ov-selected', 'true');
  });

  it('toggles sort direction on header click', () => {
    renderTable();
    const nameHeader = screen.getByRole('button', { name: /Filename/ });

    // Default ascending — folders first, then alphabetical
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('public');

    // Click to toggle descending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    // Folders still first, but reversed within groups
    expect(rows[1]).toHaveTextContent('src');
  });
});
