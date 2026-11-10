import { useEffect } from 'react';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test/render';
import { MetricCell } from './MetricCell';
import { MetricPanel } from './MetricPanel';


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

  it('starts the loading pulse only once the cell has waited long enough to notice', () => {
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
