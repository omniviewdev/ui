import { useEffect } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test/render';
import { MetricCell } from './MetricCell';
import { MetricPanel } from './MetricPanel';
import { DataTable } from '../components/data-table/DataTable';
import { useDataTable } from '../components/data-table/hooks/useDataTable';
import type { DataTableColumnDef } from '../components/data-table/types';


const unit = { kind: 'number' } as const;

describe('MetricCell', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('preserves absolute values when bounds disappear or become invalid', () => {
    const { rerender } = renderWithTheme(
      <MetricCell value={150} unit={unit} bound={{ kind: 'limit', value: 100 }} />,
    );
    expect(screen.getByText('150')).toBeVisible();
    expect(screen.getByRole('img')).toHaveAccessibleName('Usage: 150; limit: 100');
    expect(screen.getByRole('img').firstElementChild).toHaveStyle('--_ov-metric-fill-size: 100%');
    rerender(<MetricCell value={150} unit={unit} />);
    expect(screen.getByText('150')).toBeVisible();
    expect(screen.getByRole('img')).toHaveAccessibleName(/bound unknown; absolute usage/);
    expect(screen.getByRole('img').children).toHaveLength(0);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    rerender(<MetricCell value={150} unit={unit} bound={{ kind: 'limit', value: 0 }} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/bound unknown/);
  });

  it('keeps zero distinct from absent and non-finite samples in both orientations', () => {
    const { rerender } = renderWithTheme(
      <MetricCell
        value={0}
        unit={unit}
        bound={{ kind: 'capacity', value: 100 }}
        orientation="vertical"
      />,
    );
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByRole('img').firstElementChild).toHaveStyle('--_ov-metric-fill-size: 0%');
    rerender(<MetricCell value={null} unit={unit} bound={{ kind: 'capacity', value: 100 }} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeVisible();
    expect(screen.getByRole('img').children).toHaveLength(0);
    rerender(<MetricCell value={Infinity} unit={unit} />);
    expect(screen.getByText('—')).toBeVisible();
  });

  it('distinguishes loading from a reported zero and unavailable samples', () => {
    const { rerender } = renderWithTheme(<MetricCell loading label="Memory" />);
    expect(screen.getByRole('group', { name: 'Memory: Loading' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.queryByText('—')).not.toBeInTheDocument();
    rerender(<MetricCell label="Memory" value={0} unit={{ kind: 'bytes', display: 'binary' }} />);
    expect(screen.getByRole('group', { name: 'Memory' })).not.toHaveAttribute('aria-busy');
    expect(screen.getByRole('img')).toHaveAccessibleName(/Memory: 0 B/);
    rerender(
      <MetricCell
        label="Memory"
        value={537 * 1024 ** 2}
        unit={{ kind: 'bytes', display: 'binary' }}
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/Memory: 537 MiB/);
    rerender(<MetricCell loading label="Memory" />);
    expect(screen.queryByText('537')).not.toBeInTheDocument();
    rerender(
      <MetricCell label="Memory" value={null} unit={{ kind: 'bytes', display: 'binary' }} />,
    );
    expect(screen.getByText('—')).toBeVisible();
    expect(screen.getByRole('group', { name: 'Memory' })).not.toHaveAttribute('aria-busy');
  });

  it('starts the loading pulse only once the cell has waited long enough to notice', async () => {
    // Placeholders share one module-level timer. Earlier tests may have left a real one pending,
    // which fake timers would never fire, so let it expire before faking.
    await new Promise((resolve) => setTimeout(resolve, 500));
    vi.useFakeTimers();
    renderWithTheme(<MetricCell loading label="Memory" />);
    const placeholder = () =>
      screen
        .getByRole('group', { name: 'Memory: Loading' })
        .querySelector('[data-ov-component="skeleton"]');
    expect(placeholder()).toHaveAttribute('data-ov-animation', 'none');
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(placeholder()).toHaveAttribute('data-ov-animation', 'pulse');
  });


  it('opens full-value inspection from the keyboard without references', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <MetricCell
        value={537 * 1024 ** 2}
        unit={{ kind: 'bytes', display: 'binary' }}
        label="Memory"
      />,
    );
    await user.tab();
    expect(screen.getByLabelText('537 MiB')).toHaveFocus();
    expect(await screen.findByText('537 MiB')).toBeVisible();
  });

  it('keeps table inspection current across keyboard targets, sample updates and row removal', async () => {
    const user = userEvent.setup();
    const bytes = { kind: 'bytes', display: 'binary' } as const;
    type Sample = { uid: string; value: number };
    const columns: DataTableColumnDef<Sample>[] = [{
      accessorKey: 'value',
      cell: ({ row }) => <MetricCell label={row.original.uid} value={row.original.value} unit={bytes} />,
    }];
    function MetricTable({ data }: { data: Sample[] }) {
      const table = useDataTable({
        data,
        getRowId: (row) => row.uid,
        columns,
      });
      return <DataTable.Root table={table}>
        <DataTable.Container><DataTable.Body /></DataTable.Container>
      </DataTable.Root>;
    }
    const first = { uid: 'first', value: 537 * 1024 ** 2 };
    const second = { uid: 'second', value: 1024 ** 3 };
    const view = renderWithTheme(<MetricTable data={[first, second]} />);
    act(() => screen.getByLabelText('537 MiB').focus());
    await waitFor(() => expect(screen.getByText('537 MiB')).toBeVisible());

    const changed = { ...first, value: 786 * 1024 ** 2 };
    view.rerender(<MetricTable data={[changed, second]} />);
    await waitFor(() => expect(screen.getByText('786 MiB')).toBeVisible());
    expect(screen.queryByText('537 MiB')).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByLabelText('1 GiB')).toHaveFocus();
    await waitFor(() => expect(screen.getByText('1 GiB')).toBeVisible());
    expect(screen.queryByText('786 MiB')).not.toBeInTheDocument();

    view.rerender(<MetricTable data={[changed]} />);
    await waitFor(() => expect(screen.queryByText('1 GiB')).not.toBeInTheDocument());
  });
});

describe('MetricPanel value slot', () => {
  it('retains value and plot mounts during refresh and removes both on denied access', () => {
    const mount = vi.fn();
    function Value() {
      useEffect(() => {
        mount();
      }, []);
      return <span>Private scalar</span>;
    }
    const { rerender } = renderWithTheme(
      <MetricPanel title="CPU" value={<Value />}>
        <span>Private history</span>
      </MetricPanel>,
    );
    const value = screen.getByText('Private scalar');
    rerender(
      <MetricPanel title="CPU" value={<Value />} state={{ kind: 'data', updating: true }}>
        <span>Private history</span>
      </MetricPanel>,
    );
    expect(screen.getByText('Private scalar')).toBe(value);
    expect(mount).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Private history')).toBeVisible();
    rerender(
      <MetricPanel title="CPU" value={<Value />} state={{ kind: 'denied' }}>
        <span>Private history</span>
      </MetricPanel>,
    );
    expect(screen.queryByText('Private scalar')).not.toBeInTheDocument();
    expect(screen.queryByText('Private history')).not.toBeInTheDocument();
  });
});
