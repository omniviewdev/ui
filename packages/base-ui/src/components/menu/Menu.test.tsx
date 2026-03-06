import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Menu } from './Menu';

describe('Menu', () => {
  it('renders themed popup and items', () => {
    renderWithTheme(
      <Menu.Root defaultOpen color="brand" size="sm" variant="outline">
        <Menu.Trigger>Open Menu</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item>Open Workspace</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>,
    );

    const item = screen.getByText('Open Workspace');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-ov-color', 'brand');
    expect(item).toHaveAttribute('data-ov-size', 'sm');
    expect(item).toHaveAttribute('data-ov-variant', 'outline');
  });
});
