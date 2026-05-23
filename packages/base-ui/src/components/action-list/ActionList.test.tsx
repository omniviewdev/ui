import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ActionList } from './ActionList';

describe('ActionList', () => {
  it('renders list items and descriptions', () => {
    renderWithTheme(
      <ActionList size="lg" color="brand">
        <ActionList.Item description="Open the selected workspace">Open Workspace</ActionList.Item>
      </ActionList>,
    );

    const button = screen.getByRole('button', {
      name: 'Open Workspace Open the selected workspace',
    });
    expect(button).toHaveAttribute('data-ov-size', 'lg');
    expect(button).toHaveAttribute('data-ov-color', 'brand');
    expect(screen.getByText('Open the selected workspace')).toBeVisible();
  });

  it('applies xs size data attribute', () => {
    renderWithTheme(
      <ActionList size="xs">
        <ActionList.Item>Item</ActionList.Item>
      </ActionList>,
    );
    const button = screen.getByRole('button', { name: 'Item' });
    expect(button).toHaveAttribute('data-ov-size', 'xs');
  });

  it('applies xl size data attribute', () => {
    renderWithTheme(
      <ActionList size="xl">
        <ActionList.Item>Item</ActionList.Item>
      </ActionList>,
    );
    const button = screen.getByRole('button', { name: 'Item' });
    expect(button).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery and secondary color data attributes', () => {
    const { rerender } = renderWithTheme(
      <ActionList color="discovery">
        <ActionList.Item>Item</ActionList.Item>
      </ActionList>,
    );
    expect(screen.getByRole('button', { name: 'Item' })).toHaveAttribute('data-ov-color', 'discovery');

    rerender(
      <ActionList color="secondary">
        <ActionList.Item>Item</ActionList.Item>
      </ActionList>,
    );
    expect(screen.getByRole('button', { name: 'Item' })).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('renders separator and group label', () => {
    renderWithTheme(
      <ActionList>
        <ActionList.GroupLabel>Group</ActionList.GroupLabel>
        <ActionList.Separator />
      </ActionList>,
    );

    expect(screen.getByText('Group')).toBeVisible();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
