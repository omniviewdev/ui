import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test/render';
import { MetricDisplayPicker } from './MetricDisplayPicker';
import { TimeRangeControl } from './TimeRangeControl';
import { MetricDetails } from './MetricDetails';

describe('Metric controls', () => {
  it('offers only caller displays and blocks unavailable shapes', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderWithTheme(
      <MetricDisplayPicker
        value="line"
        presentation="menu"
        options={[
          { value: 'line', label: 'Lines' },
          { value: 'area', label: 'Area' },
          {
            value: 'stacked',
            label: 'Stacked',
            disabled: true,
            reason: 'Aligned samples required',
          },
        ]}
        onChange={change}
      />,
    );
    screen.getByRole('button', { name: 'Display: Lines' }).focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    expect(screen.getByRole('menuitem', { name: /Stacked/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.keyboard('{End}{Enter}');
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole('menuitem', { name: 'Area' }));
    expect(change).toHaveBeenCalledWith('area');
  });
  it('supports relative selection and Escape without changing selection', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderWithTheme(
      <TimeRangeControl value={{ mode: 'relative', durationMs: 3600000 }} onChange={change} />,
    );
    await user.click(screen.getByRole('button', { name: 'Time range' }));
    await user.keyboard('{Escape}');
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Time range' }));
    await user.click(screen.getByRole('button', { name: '15 minutes' }));
    expect(change).toHaveBeenCalledWith({ mode: 'relative', durationMs: 900000 });
  });
  it('rejects reversed absolute ranges and applies valid epoch timestamps', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderWithTheme(
      <TimeRangeControl
        value={{ mode: 'absolute', domain: { startMs: 1000, endMs: 2000 } }}
        onChange={change}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Time range' }));
    const start = screen.getByLabelText('Start (local time)');
    const end = screen.getByLabelText('End (local time)');
    fireEvent.change(start, { target: { value: '2026-11-05T13:00' } });
    fireEvent.change(end, { target: { value: '2026-11-05T12:00' } });
    await user.click(screen.getByRole('button', { name: 'Apply range' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid start before the end.');
    expect(change).not.toHaveBeenCalled();
    fireEvent.change(end, { target: { value: '2026-11-05T14:00' } });
    await user.click(screen.getByRole('button', { name: 'Apply range' }));
    expect(change).toHaveBeenCalledWith({
      mode: 'absolute',
      domain: {
        startMs: new Date('2026-11-05T13:00').getTime(),
        endMs: new Date('2026-11-05T14:00').getTime(),
      },
    });
  });
  it('disables refresh while retaining controlled range', async () => {
    const user = userEvent.setup();
    const refresh = vi.fn();
    renderWithTheme(
      <TimeRangeControl
        value={{ mode: 'relative', durationMs: 3600000 }}
        onChange={vi.fn()}
        onRefresh={refresh}
        refreshing
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Refreshing metrics' }));
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Time range' })).toHaveTextContent('Last 1 hour');
  });
  it('keeps source visible and identifiers behind disclosure', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <MetricDetails
        items={[
          { id: 'source', label: 'Source', value: 'Fixture' },
          { id: 'observed', label: 'Observed', value: '13:00' },
          { id: 'identity', label: 'Identity', value: 'opaque-series-id', advanced: true },
        ]}
      />,
    );
    expect(screen.getByText('Fixture')).toBeVisible();
    expect(screen.getByText('13:00')).toBeVisible();
    expect(screen.getByText('opaque-series-id')).not.toBeVisible();
    await user.click(screen.getByText('Diagnostics'));
    await waitFor(() => expect(screen.getByText('opaque-series-id')).toBeVisible());
  });
  it('anchors absolute editing to the displayed relative window', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const end = Date.UTC(2026, 10, 5, 14, 30);
    renderWithTheme(
      <TimeRangeControl
        value={{ mode: 'relative', durationMs: 3600000 }}
        referenceTimeMs={end}
        onChange={change}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Time range' }));
    await user.click(screen.getByRole('button', { name: 'Apply range' }));
    expect(change).toHaveBeenCalledWith({
      mode: 'absolute',
      domain: { startMs: end - 3600000, endMs: end },
    });
  });
});
