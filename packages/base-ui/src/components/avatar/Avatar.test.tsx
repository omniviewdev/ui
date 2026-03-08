import { screen } from '@testing-library/react';
import { LuBot } from 'react-icons/lu';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Avatar } from './Avatar';
import { getAvatarPaletteIndex } from './avatarUtils';

describe('Avatar', () => {
  it('renders deterministic initials fallback from name', () => {
    renderWithTheme(<Avatar name="Joshua Pare" />);

    const initials = screen.getByText('JP');
    const root = initials.closest('[data-ov-avatar-root="true"]');
    expect(root).toHaveAttribute('data-ov-palette', String(getAvatarPaletteIndex('Joshua Pare')));
  });

  it('applies styled props and shape to the root element', () => {
    renderWithTheme(
      <Avatar name="Mina Park" variant="outline" color="warning" size="lg" shape="rounded" />,
    );

    const root = screen.getByText('MP').closest('[data-ov-avatar-root="true"]');
    expect(root).toHaveAttribute('data-ov-variant', 'outline');
    expect(root).toHaveAttribute('data-ov-color', 'warning');
    expect(root).toHaveAttribute('data-ov-size', 'lg');
    expect(root).toHaveAttribute('data-ov-shape', 'rounded');
  });

  it('renders fallback icon content when provided', () => {
    renderWithTheme(
      <Avatar
        deterministic
        fallbackIcon={<LuBot data-testid="avatar-icon" aria-hidden />}
        aria-label="Bot avatar"
      />,
    );

    expect(screen.getByTestId('avatar-icon')).toBeInTheDocument();
  });

  it('supports non-deterministic fallback mode', () => {
    renderWithTheme(<Avatar name="Riley Brooks" deterministic={false} />);

    const root = screen.getByText('RB').closest('[data-ov-avatar-root="true"]');
    expect(root).toHaveAttribute('data-ov-deterministic', 'false');
    expect(root).not.toHaveAttribute('data-ov-palette');
  });
});
