import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '../../test/render';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders open state with default props', () => {
    renderWithTheme(
      <Drawer open data-testid="drawer">
        <Drawer.Content>Panel content</Drawer.Content>
      </Drawer>,
    );
    const el = screen.getByTestId('drawer');
    expect(el).toHaveAttribute('data-ov-state', 'open');
    expect(el).toHaveAttribute('data-ov-anchor', 'bottom');
    expect(el).toHaveAttribute('data-ov-animate', 'true');
    expect(el).toHaveAttribute('role', 'complementary');
    expect(screen.getByText('Panel content')).toBeVisible();
  });

  it('renders closed state', () => {
    renderWithTheme(
      <Drawer open={false} data-testid="drawer">
        <Drawer.Content>Hidden</Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByTestId('drawer')).toHaveAttribute('data-ov-state', 'closed');
  });

  it('renders with modal role when modal prop is set', () => {
    renderWithTheme(
      <Drawer open modal overlay data-testid="drawer">
        <Drawer.Content>Modal panel</Drawer.Content>
      </Drawer>,
    );
    const el = screen.getByTestId('drawer');
    expect(el).toHaveAttribute('role', 'dialog');
    expect(el).toHaveAttribute('aria-modal', 'true');
  });

  it('closes on Escape when modal', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Drawer open modal onOpenChange={onOpenChange}>
        <Drawer.Content>Press Escape</Drawer.Content>
      </Drawer>,
    );
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders resize handle with separator role', () => {
    renderWithTheme(
      <Drawer open resizable>
        <Drawer.Content>Resizable</Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('hides resize handle when resizable is false', () => {
    renderWithTheme(
      <Drawer open resizable={false}>
        <Drawer.Content>No handle</Drawer.Content>
      </Drawer>,
    );
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
});
