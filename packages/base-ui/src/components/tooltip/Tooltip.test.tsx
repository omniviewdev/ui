import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { IconButton } from '../icon-button';
import { Tooltip } from './Tooltip';
import { Menu } from '../menu';

describe('Tooltip', () => {
  it('preserves explicitly styled rendered triggers and hover interaction', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tooltip.Provider delay={0} closeDelay={0}>
        <Tooltip.Root size="lg" color="brand" variant="solid">
          <Tooltip.Trigger
            render={
              <IconButton aria-label="Reset widths" size="sm" color="neutral" variant="outline">
                <span aria-hidden>Reset</span>
              </IconButton>
            }
          />
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>Reset column widths</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>,
    );

    const trigger = screen.getByRole('button', { name: 'Reset widths' });
    expect(trigger).toHaveAttribute('data-ov-size', 'sm');
    expect(trigger).toHaveAttribute('data-ov-color', 'neutral');
    expect(trigger).toHaveAttribute('data-ov-variant', 'outline');
    await user.hover(trigger);
    expect(await screen.findByText('Reset column widths')).toBeInTheDocument();
  });

  it('preserves a menu trigger control and its click behavior through a tooltip', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tooltip.Root size="lg" variant="solid" color="brand">
        <Menu.Root>
          <Tooltip.Trigger render={
            <Menu.Trigger render={<IconButton size="sm" variant="ghost" color="neutral" aria-label="Exec"><span aria-hidden>Exec</span></IconButton>} />
          } />
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup><Menu.Item>Open console</Menu.Item></Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </Tooltip.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Exec' });
    expect(trigger).toHaveAttribute('data-ov-size', 'sm');
    expect(trigger).toHaveAttribute('data-ov-variant', 'ghost');
    expect(trigger).toHaveAttribute('data-ov-color', 'neutral');
    await user.click(trigger);
    expect(await screen.findByRole('menuitem', { name: 'Open console' })).toBeVisible();
  });

  it('renders neutral color on popup', () => {
    renderWithTheme(
      <Tooltip.Root defaultOpen color="neutral">
        <Tooltip.Trigger>Hover</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Neutral tip</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>,
    );
    const popup = screen.getByText('Neutral tip').closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'neutral');
  });

  it('renders discovery color on popup', () => {
    renderWithTheme(
      <Tooltip.Root defaultOpen color="discovery">
        <Tooltip.Trigger>Hover</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Discovery tip</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>,
    );
    const popup = screen.getByText('Discovery tip').closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('renders secondary color on popup', () => {
    renderWithTheme(
      <Tooltip.Root defaultOpen color="secondary">
        <Tooltip.Trigger>Hover</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Secondary tip</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>,
    );
    const popup = screen.getByText('Secondary tip').closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('renders themed popup when opened', () => {
    renderWithTheme(
      <Tooltip.Root defaultOpen color="warning" size="sm" variant="outline">
        <Tooltip.Trigger>Status</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={6}>
            <Tooltip.Popup>Runtime is paused.</Tooltip.Popup>
            <Tooltip.Arrow />
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>,
    );

    const popupText = screen.getByText('Runtime is paused.');
    expect(popupText).toBeInTheDocument();

    const popup = popupText.closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'warning');
    expect(popup).toHaveAttribute('data-ov-size', 'sm');
    expect(popup).toHaveAttribute('data-ov-variant', 'outline');
  });

  describe('lazy', () => {
    it('does not render popup content before opening when lazy=true', () => {
      renderWithTheme(
        <Tooltip.Root lazy>
          <Tooltip.Trigger>Hover me</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>Lazy content</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>,
      );

      expect(screen.queryByText('Lazy content')).not.toBeInTheDocument();
    });

    it('renders popup content when lazy tooltip is open', () => {
      renderWithTheme(
        <Tooltip.Root lazy defaultOpen>
          <Tooltip.Trigger>Hover me</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>Lazy content</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>,
      );

      expect(screen.getByText('Lazy content')).toBeInTheDocument();
    });

    it('renders content immediately on subsequent opens (hasOpened persists)', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <Tooltip.Provider delay={0} closeDelay={0}>
          <Tooltip.Root lazy>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner>
                <Tooltip.Popup>Persistent content</Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>,
      );

      // Content not rendered initially
      expect(screen.queryByText('Persistent content')).not.toBeInTheDocument();

      // Hover to open — content appears
      await user.hover(screen.getByRole('button', { name: 'Hover me' }));
      expect(await screen.findByText('Persistent content')).toBeInTheDocument();

      // Unhover to close, then hover again — content should appear immediately
      await user.unhover(screen.getByRole('button', { name: 'Hover me' }));
      await user.hover(screen.getByRole('button', { name: 'Hover me' }));
      expect(await screen.findByText('Persistent content')).toBeInTheDocument();
    });

    it('renders popup content on user hover interaction', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <Tooltip.Provider delay={0} closeDelay={0}>
          <Tooltip.Root lazy>
            <Tooltip.Trigger>Hover target</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner>
                <Tooltip.Popup>Hover content</Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>,
      );

      expect(screen.queryByText('Hover content')).not.toBeInTheDocument();

      await user.hover(screen.getByRole('button', { name: 'Hover target' }));
      expect(await screen.findByText('Hover content')).toBeInTheDocument();
    });

    it('always renders content when lazy=false (default)', () => {
      renderWithTheme(
        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger>Hover me</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>Eager content</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>,
      );

      expect(screen.getByText('Eager content')).toBeInTheDocument();
    });
  });
});
