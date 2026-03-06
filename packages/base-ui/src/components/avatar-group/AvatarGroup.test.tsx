import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { AvatarGroup } from './AvatarGroup';

describe('AvatarGroup', () => {
  it('inherits styled props and shape through AvatarGroup.Item', () => {
    renderWithTheme(
      <AvatarGroup variant="outline" color="success" size="lg" shape="rounded">
        <AvatarGroup.Item name="Alex Li" />
      </AvatarGroup>,
    );

    const avatar = screen.getByText('AL').closest('[data-ov-avatar-root="true"]');
    expect(avatar).toHaveAttribute('data-ov-variant', 'outline');
    expect(avatar).toHaveAttribute('data-ov-color', 'success');
    expect(avatar).toHaveAttribute('data-ov-size', 'lg');
    expect(avatar).toHaveAttribute('data-ov-shape', 'rounded');
  });

  it('renders overflow avatar when max is reached', () => {
    renderWithTheme(
      <AvatarGroup max={2} total={5}>
        <AvatarGroup.Item name="Joshua Pare" />
        <AvatarGroup.Item name="Olivia Chen" />
        <AvatarGroup.Item name="Sam Patel" />
      </AvatarGroup>,
    );

    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('supports overlap override while preserving size tokens', () => {
    renderWithTheme(
      <AvatarGroup size="sm" overlap="lg">
        <AvatarGroup.Item name="Rina Ito" />
        <AvatarGroup.Item name="Noah Lee" />
      </AvatarGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-ov-size', 'sm');
    expect(group).toHaveAttribute('data-ov-overlap', 'lg');
  });
});
