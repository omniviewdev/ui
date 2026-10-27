import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { SearchTrigger } from './SearchTrigger';

describe('SearchTrigger', () => {
  it('exposes a named button, not a textbox, with a decorative shortcut', () => {
    renderWithTheme(
      <SearchTrigger
        placeholder="Search anything…"
        shortcut={<span>Ctrl K</span>}
        aria-label="Search Omniview"
        aria-keyshortcuts="Control+K"
        size="sm"
        variant="outline"
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Search Omniview' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-keyshortcuts', 'Control+K');
    expect(trigger).toHaveAttribute('data-ov-size', 'sm');
    expect(trigger).toHaveAttribute('data-ov-variant', 'outline');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Ctrl K').closest('[aria-hidden]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('supports tab focus, Enter, Space and a forwarded button ref without submitting forms', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLButtonElement>();
    renderWithTheme(
      <form onSubmit={onSubmit}>
        <SearchTrigger ref={ref} placeholder="Search" onClick={onOpen} />
        <button type="button">Next</button>
      </form>,
    );

    await user.tab();
    expect(ref.current).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(ref.current).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    ref.current?.focus();
    expect(ref.current).toHaveFocus();
  });

  it('keeps disabled triggers out of the tab order and prevents activation', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    renderWithTheme(
      <>
        <SearchTrigger disabled placeholder="Search" onClick={onOpen} />
        <button type="button">Next</button>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Search' });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('data-disabled');
    await user.click(trigger);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    expect(onOpen).not.toHaveBeenCalled();
  });
});
