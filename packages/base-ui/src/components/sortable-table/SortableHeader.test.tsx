import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { SortableHeader } from './SortableHeader';

describe('SortableHeader', () => {
  it('renders children text', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="name"
                sort={{ key: 'name', direction: 'asc' }}
                onSort={() => {}}
              >
                Name
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByText('Name')).toBeVisible();
  });

  it('shows ascending indicator when column is active ascending', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="name"
                sort={{ key: 'name', direction: 'asc' }}
                onSort={() => {}}
              >
                Name
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByLabelText('Sorted ascending')).toBeInTheDocument();
  });

  it('shows descending indicator when column is active descending', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="name"
                sort={{ key: 'name', direction: 'desc' }}
                onSort={() => {}}
              >
                Name
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByLabelText('Sorted descending')).toBeInTheDocument();
  });

  it('does not show indicator for inactive column', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="size"
                sort={{ key: 'name', direction: 'asc' }}
                onSort={() => {}}
              >
                Size
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.queryByLabelText(/Sorted/)).not.toBeInTheDocument();
  });

  it('calls onSort when clicked', () => {
    const onSort = vi.fn();
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="name"
                sort={{ key: 'size', direction: 'asc' }}
                onSort={onSort}
              >
                Name
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('renders non-interactive span when sortable is false', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="icon"
                sort={{ key: 'name', direction: 'asc' }}
                onSort={() => {}}
                sortable={false}
              >
                Icon
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeVisible();
  });
});
