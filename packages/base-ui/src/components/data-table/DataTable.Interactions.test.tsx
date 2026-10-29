import { Subscribe } from '@tanstack/react-table';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { flushSync } from 'react-dom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { DataTableColumnDef as ColumnDef } from './types';
import type { ExpandedState } from '@tanstack/react-table';
import { renderWithTheme } from '../../test/render';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';

type Item = { id: string; name: string };
const data: Item[] = [
  { id: 'cloud:1', name: 'Cloud instance' },
  { id: 'vm:2', name: 'Virtual machine' },
];
const columns: ColumnDef<Item, unknown>[] = [
  {
    id: 'controls',
    header: 'Controls',
    cell: ({ row, table }) => (<Subscribe source={table.store} selector={(state) => ({ selection: state.rowSelection, expanded: state.expanded })}>{(snapshot) => ((
      <>
        <button aria-haspopup="menu" aria-expanded="false">
          Actions {row.original.name}
        </button>
        <button
          data-ov-expansion-toggle=""
          aria-expanded={(snapshot.expanded === true || !!snapshot.expanded[row.id])}
          onClick={() => row.toggleExpanded()}
        >
          Details {row.original.name}
        </button>
        <button onClick={() => row.toggleSelected()}>Select {row.original.name}</button>
        <a href="#fixture">Link {row.original.name}</a>
        <label>
          <input type="checkbox" /> Check {row.original.name}
        </label>
        <span role="button" tabIndex={0}>
          Custom {row.original.name}
        </span>
        <table>
          <tbody>
            <tr>
              <td>Nested {row.original.name}</td>
            </tr>
          </tbody>
        </table>
      </>
    ))}</Subscribe>),
  },
  { accessorKey: 'name', header: 'Name' },
];
const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
const clientHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');
const clientWidth = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => 400,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => 800,
  });
  Object.defineProperty(Element.prototype, 'clientHeight', {
    configurable: true,
    get: () => 400,
  });
  Object.defineProperty(Element.prototype, 'clientWidth', {
    configurable: true,
    get: () => 800,
  });
});
afterAll(() => {
  if (height) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', height);
  if (width) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', width);
  if (clientHeight) Object.defineProperty(Element.prototype, 'clientHeight', clientHeight);
  if (clientWidth) Object.defineProperty(Element.prototype, 'clientWidth', clientWidth);
});

function Harness({
  virtual = false,
  items = data,
  expanded,
  onExpandedChange,
  onRowClick,
  onExtraClick,
}: {
  virtual?: boolean;
  items?: Item[];
  expanded?: ExpandedState;
  onExpandedChange?: (next: ExpandedState) => void;
  onRowClick?: () => void;
  onExtraClick?: () => void;
}) {
  const table = useDataTable({
    data: items,
    columns,
    getRowId: (row) => row.id,
    features: { rowExpansion: true, rowSelection: 'multi' },
    getRowCanExpand: () => true,
    state: expanded === undefined ? undefined : { expanded },
    onExpandedChange,
    manualSorting: true,
    manualGrouping: true,
  });
  const renderDetail = (original: unknown) => (
    <div>
      <input aria-label={`Detail ${(original as Item).name}`} defaultValue="independent state" />
      <button onClick={() => table.getRow((original as Item).id).toggleExpanded(false)}>
        Close detail
      </button>
    </div>
  );
  return (
    <>
      <button>Outside table</button>
      <DataTable.Root table={table} features={{ rowExpansion: true }}>
        <DataTable.Container aria-label="Fixture table viewport" height={400}>
          <DataTable.Header />
          {virtual ? (
            <DataTable.VirtualBody<Item>
              fixedRowHeight
              estimateRowSize={36}
              onRowClick={onRowClick}
              getRowProps={() => ({ onClick: onExtraClick })}
              renderExpandedRow={renderDetail}
            />
          ) : (
            <DataTable.Body renderExpandedRow={renderDetail} />
          )}
        </DataTable.Container>
      </DataTable.Root>
    </>
  );
}

describe('row action boundaries', () => {
  it('keeps interactive cells and nested tables independent of both row callbacks', async () => {
    const onRowClick = vi.fn();
    const onExtraClick = vi.fn();
    renderWithTheme(<Harness virtual onRowClick={onRowClick} onExtraClick={onExtraClick} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Select Cloud instance' }));
    await user.click(screen.getByRole('link', { name: 'Link Cloud instance' }));
    await user.click(screen.getByText('Check Cloud instance'));
    await user.click(screen.getByRole('button', { name: 'Custom Cloud instance' }));
    await user.click(screen.getByText('Nested Cloud instance'));
    expect(screen.getByRole('checkbox', { name: 'Check Cloud instance' })).toBeChecked();
    expect(onRowClick).not.toHaveBeenCalled();
    expect(onExtraClick).not.toHaveBeenCalled();
    await user.click(screen.getByText('Cloud instance', { exact: true }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onExtraClick).toHaveBeenCalledTimes(1);
  });
});

describe.each([false, true])('focus recovery (virtual=%s)', (virtual) => {
  it('returns focus from a self-collapsing detail to its parent control', async () => {
    renderWithTheme(<Harness virtual={virtual} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Details Cloud instance' }));
    await user.click(screen.getByRole('button', { name: 'Close detail' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Details Cloud instance' })).toHaveFocus(),
    );
    expect(screen.queryByLabelText('Detail Cloud instance')).not.toBeInTheDocument();
  });

  it('keeps keyed detail state and focus through host reorder and sparse patches', async () => {
    const { rerender } = renderWithTheme(
      <Harness virtual={virtual} expanded={{ 'cloud:1': true }} />,
    );
    const input = screen.getByLabelText('Detail Cloud instance');
    await userEvent.setup().type(input, '!');
    rerender(
      <Harness
        virtual={virtual}
        items={[data[1]!, { ...data[0]! }]}
        expanded={{ 'cloud:1': true }}
      />,
    );
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue('independent state!');
    expect(screen.getByLabelText('Detail Cloud instance')).toBe(input);
  });

  it('uses the viewport fallback when the focused row is removed, including the last row', async () => {
    const { rerender } = renderWithTheme(
      <Harness virtual={virtual} expanded={{ 'cloud:1': true }} />,
    );
    screen.getByLabelText('Detail Cloud instance').focus();
    rerender(<Harness virtual={virtual} items={[data[1]!]} />);
    await waitFor(() => expect(screen.getByLabelText('Fixture table viewport')).toHaveFocus());
    screen.getByRole('button', { name: 'Details Virtual machine' }).focus();
    rerender(<Harness virtual={virtual} items={[]} />);
    await waitFor(() => expect(screen.getByLabelText('Fixture table viewport')).toHaveFocus());
  });

  it('does not steal focus after the user moves outside the table', async () => {
    const { rerender } = renderWithTheme(
      <Harness virtual={virtual} expanded={{ 'cloud:1': true }} />,
    );
    screen.getByLabelText('Detail Cloud instance').focus();
    const outside = screen.getByRole('button', { name: 'Outside table' });
    outside.focus();
    await act(async () => {
      rerender(<Harness virtual={virtual} items={[]} />);
    });
    expect(outside).toHaveFocus();
  });

  it('recovers on host-driven collapse without stealing another active control', async () => {
    const { rerender } = renderWithTheme(
      <Harness virtual={virtual} expanded={{ 'cloud:1': true }} />,
    );
    screen.getByLabelText('Detail Cloud instance').focus();
    rerender(<Harness virtual={virtual} expanded={{}} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Details Cloud instance' })).toHaveFocus(),
    );
    const other = screen.getByRole('button', { name: 'Select Virtual machine' });
    other.focus();
    await act(async () => {
      rerender(<Harness virtual={virtual} expanded={{ 'cloud:1': true }} />);
    });
    expect(other).toHaveFocus();
  });
});

it('operates the labeled expansion control with Enter/Space and respects controlled state', async () => {
  const onExpandedChange = vi.fn();
  function Fixture({ expanded }: { expanded: ExpandedState }) {
    const table = useDataTable({
      data,
      columns,
      getRowId: (row) => row.id,
      features: { rowExpansion: true },
      getRowCanExpand: (row) => row.original.id === 'cloud:1',
      state: { expanded },
      onExpandedChange,
    });
    return (
      <DataTable.Root table={table}>
        <DataTable.ExpansionToggle row={table.getRow('cloud:1')} label="Cloud instance" />
        <DataTable.ExpansionToggle row={table.getRow('vm:2')} label="Virtual machine" />
      </DataTable.Root>
    );
  }
  const { rerender } = renderWithTheme(<Fixture expanded={{}} />);
  const user = userEvent.setup();
  const toggle = screen.getByRole('button', { name: 'Expand Cloud instance' });
  await user.tab();
  expect(toggle).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(onExpandedChange).toHaveBeenLastCalledWith({ 'cloud:1': true });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  rerender(<Fixture expanded={{ 'cloud:1': true }} />);
  expect(screen.getByRole('button', { name: 'Collapse Cloud instance' })).toBe(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await user.keyboard(' ');
  expect(onExpandedChange.mock.lastCall?.[0]['cloud:1']).toBeFalsy();
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  rerender(<Fixture expanded={{}} />);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', { name: 'Expand Virtual machine' })).toBeDisabled();
});

it('updates a localized disclosure name across keyboard expansion and collapse', async () => {
  function Fixture() {
    const table = useDataTable({
      data,
      columns,
      getRowId: (row) => row.id,
      features: { rowExpansion: true },
      getRowCanExpand: () => true,
    });
    return (
      <DataTable.Root table={table}>
        <DataTable.ExpansionToggle
          row={table.getRow('cloud:1')}
          label="Instancia"
          getAccessibleLabel={(expanded, label) => `${expanded ? 'Contraer' : 'Expandir'} ${label}`}
        />
      </DataTable.Root>
    );
  }
  renderWithTheme(<Fixture />);
  const user = userEvent.setup();
  await user.tab();
  await user.keyboard('{Enter}');
  const toggle = screen.getByRole('button', { name: 'Contraer Instancia' });
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await user.keyboard(' ');
  expect(screen.getByRole('button', { name: 'Expandir Instancia' })).toBe(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

it('does not use a nested table disclosure as the parent row focus fallback', async () => {
  function Fixture({ showAction }: { showAction: boolean }) {
    const table = useDataTable({
      data,
      getRowId: (row) => row.id,
      columns: [
        {
          id: 'content',
          cell: ({ row }) => (
            <>
              {showAction && <button>Action {row.original.name}</button>}
              <table>
                <tbody>
                  <tr>
                    <td>
                      <button data-ov-expansion-toggle="" aria-expanded="false">
                        Nested details {row.original.name}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ),
        },
      ],
    });
    return (
      <DataTable.Root table={table}>
        <DataTable.Container aria-label="Parent viewport">
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  }
  const { rerender } = renderWithTheme(<Fixture showAction />);
  screen.getByRole('button', { name: 'Action Cloud instance' }).focus();
  rerender(<Fixture showAction={false} />);
  await waitFor(() => expect(screen.getByLabelText('Parent viewport')).toHaveFocus());
});

it('honors explicit blur even when a detail DOM mutation is already queued', async () => {
  renderWithTheme(<Harness expanded={{ 'cloud:1': true }} />);
  const input = screen.getByLabelText('Detail Cloud instance');
  input.focus();
  await act(async () => {
    input.parentElement!.append(document.createElement('span'));
    input.blur();
  });
  expect(document.body).toHaveFocus();
});

it('lets the still-mounted nested table recover its own removed row', async () => {
  function Child({ items }: { items: Item[] }) {
    const child = useDataTable({
      data: items,
      getRowId: (row) => row.id,
      columns: [{ id: 'action', cell: () => <button>Nested row action</button> }],
    });
    return (
      <DataTable.Root table={child}>
        <DataTable.Container aria-label="Nested viewport">
          <DataTable.Body />
        </DataTable.Container>
      </DataTable.Root>
    );
  }
  function Fixture({ items }: { items: Item[] }) {
    const parent = useDataTable({
      data,
      columns,
      getRowId: (row) => row.id,
      features: { rowExpansion: true },
      getRowCanExpand: () => true,
      state: { expanded: { 'cloud:1': true } },
    });
    return (
      <DataTable.Root table={parent} features={{ rowExpansion: true }}>
        <DataTable.Container aria-label="Outer viewport">
          <DataTable.Body renderExpandedRow={() => <Child items={items} />} />
        </DataTable.Container>
      </DataTable.Root>
    );
  }
  const { rerender } = renderWithTheme(<Fixture items={[data[0]!]} />);
  screen.getByRole('button', { name: 'Nested row action' }).focus();
  await act(async () => {
    // Queue outer observer first: an unrelated outer status update and an
    // inner row removal can arrive in the same host commit.
    screen.getByLabelText('Outer viewport').append(document.createElement('span'));
    flushSync(() => rerender(<Fixture items={[]} />));
  });
  expect(screen.getByLabelText('Nested viewport')).toHaveFocus();
});
