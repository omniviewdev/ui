import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { RowList } from './RowList';
import type { ColumnDef, SortState } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const columns: ColumnDef[] = [
  { id: 'severity', header: 'Severity', width: '80px', sortable: true },
  { id: 'message', header: 'Message', width: '1fr' },
  { id: 'source', header: 'Source', width: '120px', align: 'end' },
];

function ThreeRowList(props: Record<string, unknown> = {}) {
  return (
    <RowList columns={columns} {...props}>
      <RowList.Header />
      <RowList.Viewport>
        <RowList.Item itemKey="err-1" textValue="Error in parser">
          <RowList.Cell column="severity">Error</RowList.Cell>
          <RowList.Cell column="message">Unexpected token</RowList.Cell>
          <RowList.Cell column="source">parser.ts</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="err-2" textValue="Warning in linter">
          <RowList.Cell column="severity">Warning</RowList.Cell>
          <RowList.Cell column="message">Unused variable</RowList.Cell>
          <RowList.Cell column="source">index.ts</RowList.Cell>
        </RowList.Item>
        <RowList.Item itemKey="err-3" textValue="Info message">
          <RowList.Cell column="severity">Info</RowList.Cell>
          <RowList.Cell column="message">Build complete</RowList.Cell>
          <RowList.Cell column="source">build.ts</RowList.Cell>
        </RowList.Item>
      </RowList.Viewport>
    </RowList>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RowList', () => {
  it('renders header cells from column definitions', () => {
    renderWithTheme(<ThreeRowList />);
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
  });

  it('renders items with cells in correct grid positions', () => {
    renderWithTheme(<ThreeRowList />);
    const items = screen.getAllByRole('option');
    expect(items).toHaveLength(3);

    // Each item should have the grid display via the Item class
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Unexpected token')).toBeInTheDocument();
    expect(screen.getByText('parser.ts')).toBeInTheDocument();
  });

  it('shows sort indicator on sorted column with correct aria-sort', () => {
    const sortState: SortState = {
      columnId: 'severity',
      direction: 'ascending',
    };
    renderWithTheme(<ThreeRowList sortState={sortState} />);

    const severityHeader = screen.getByText('Severity').closest(
      '[role="columnheader"]',
    )!;
    expect(severityHeader).toHaveAttribute('aria-sort', 'ascending');

    // Other headers should not have aria-sort
    const messageHeader = screen.getByText('Message').closest(
      '[role="columnheader"]',
    )!;
    expect(messageHeader).not.toHaveAttribute('aria-sort');
  });

  it('calls onSortChange with ascending when clicking unsorted sortable header', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    renderWithTheme(
      <ThreeRowList onSortChange={onSortChange} />,
    );

    const severityHeader = screen.getByText('Severity').closest(
      '[role="columnheader"]',
    )!;
    await user.click(severityHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      columnId: 'severity',
      direction: 'ascending',
    });
  });

  it('toggles to descending when clicking already-ascending header', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    renderWithTheme(
      <ThreeRowList
        sortState={{ columnId: 'severity', direction: 'ascending' }}
        onSortChange={onSortChange}
      />,
    );

    const severityHeader = screen.getByText('Severity').closest(
      '[role="columnheader"]',
    )!;
    await user.click(severityHeader);

    expect(onSortChange).toHaveBeenCalledWith({
      columnId: 'severity',
      direction: 'descending',
    });
  });

  it('non-sortable headers do not respond to click', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    renderWithTheme(
      <ThreeRowList onSortChange={onSortChange} />,
    );

    const messageHeader = screen.getByText('Message').closest(
      '[role="columnheader"]',
    )!;
    await user.click(messageHeader);

    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('cell alignment applies correct style', () => {
    renderWithTheme(<ThreeRowList />);

    // "Source" column has align: 'end' — cells in that column should have justifyContent: 'end'
    const sourceCell = screen.getByText('parser.ts');
    expect(sourceCell.style.justifyContent).toBe('end');
  });

  it('row selection works with selectionMode="single"', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThreeRowList selectionMode="single" />);

    const item = screen.getByText('Error').closest('[role="option"]')!;
    await user.click(item);

    expect(item).toHaveAttribute('aria-selected', 'true');
  });

  it('keyboard navigation works (ArrowDown/Up moves active row)', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <ThreeRowList selectionMode="single" />,
    );

    const listbox = screen.getByRole('listbox');
    listbox.focus();

    await user.keyboard('{ArrowDown}');
    const firstItem = screen.getAllByRole('option')[0];
    expect(firstItem).toHaveAttribute('data-ov-active', 'true');

    await user.keyboard('{ArrowDown}');
    const secondItem = screen.getAllByRole('option')[1];
    expect(secondItem).toHaveAttribute('data-ov-active', 'true');
  });

  it('disabled rows show disabled state', () => {
    renderWithTheme(
      <ThreeRowList disabledKeys={['err-2']} />,
    );

    const items = screen.getAllByRole('option');
    expect(items[1]).toHaveAttribute('data-ov-disabled', 'true');
  });

  it('density variants affect row height via data attribute', () => {
    renderWithTheme(<ThreeRowList density="compact" />);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('data-ov-density', 'compact');
  });

  it('column widths set grid template via CSS variable', () => {
    renderWithTheme(<ThreeRowList />);
    const listbox = screen.getByRole('listbox');
    const styleValue = listbox.style.getPropertyValue(
      '--_ov-row-grid-columns',
    );
    expect(styleValue).toBe('80px 1fr 120px');
  });

  it('header has sticky positioning', () => {
    renderWithTheme(<ThreeRowList />);
    const header = screen.getByRole('row');
    // Sticky is applied via CSS class, verify the class is present
    expect(header.className).toContain('Header');
  });
});
