import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test/render';
import { TimeRangeControl } from './TimeRangeControl';

const domain = {
  startMs: new Date(2026, 10, 5, 13, 0, 0, 123).getTime(),
  endMs: new Date(2026, 10, 5, 14, 0, 0, 456).getTime(),
};

describe('TimeRangeControl absolute drafts', () => {
  it.each(['Start', 'End'])(
    'blocks stale timestamps after clearing a %s section',
    async (label) => {
      const user = userEvent.setup();
      const change = vi.fn();
      renderWithTheme(<TimeRangeControl value={{ mode: 'absolute', domain }} onChange={change} />);
      await user.click(screen.getByRole('button', { name: 'Time range' }));
      const field = screen.getByRole('group', { name: `${label} (local date and time)` });
      await user.click(within(field).getByRole('spinbutton', { name: 'Hour' }));
      await user.keyboard('{Backspace}');
      expect(field).toHaveAttribute('aria-invalid', 'true');
      await user.click(screen.getByRole('button', { name: 'Apply range' }));
      expect(change).not.toHaveBeenCalled();
      expect(screen.getByRole('alert')).toHaveTextContent('Complete a valid local date and time');
      await user.click(within(field).getByRole('spinbutton', { name: 'Hour' }));
      await user.keyboard(label === 'Start' ? '13' : '14');
      await user.click(screen.getByRole('button', { name: 'Apply range' }));
      expect(change).toHaveBeenCalledOnce();
    },
  );

  it('preserves exact timestamps when opening and applying without edits', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderWithTheme(<TimeRangeControl value={{ mode: 'absolute', domain }} onChange={change} />);
    await user.click(screen.getByRole('button', { name: 'Time range' }));
    await user.click(screen.getByRole('button', { name: 'Apply range' }));
    expect(change).toHaveBeenCalledWith({ mode: 'absolute', domain });
  });

  it('edits calendar and time without applying, cancels, then restores controlled values', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderWithTheme(<TimeRangeControl value={{ mode: 'absolute', domain }} onChange={change} />);
    await user.click(screen.getByRole('button', { name: 'Time range' }));
    await user.click(
      screen.getByRole('button', { name: 'Open calendar for Start (local date and time)' }),
    );
    await user.click(screen.getByRole('gridcell', { name: '4' }));
    await user.click(
      within(screen.getByRole('listbox', { name: /hours/i })).getByRole('option', { name: '12' }),
    );
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('button', { name: 'Apply range' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(change).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Time range' }));
    await user.click(screen.getByRole('button', { name: 'Apply range' }));
    expect(change).toHaveBeenCalledWith({ mode: 'absolute', domain });
  });

  it('dismisses only the nested popup on Escape before dismissing the range', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderWithTheme(<TimeRangeControl value={{ mode: 'absolute', domain }} onChange={change} />);
    const trigger = screen.getByRole('button', { name: 'Time range' });
    await user.click(trigger);
    await user.click(
      screen.getByRole('button', { name: 'Open calendar for Start (local date and time)' }),
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply range' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: 'Apply range' })).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });
});
