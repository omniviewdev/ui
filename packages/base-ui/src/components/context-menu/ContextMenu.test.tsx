import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ContextMenu } from './ContextMenu';

describe('ContextMenu', () => {
  it('renders discovery color on menu items', () => {
    renderWithTheme(
      <ContextMenu.Root color="discovery" size="md" variant="solid">
        <ContextMenu.Trigger>Surface</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup>
              <ContextMenu.Item>Action</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );
    fireEvent.contextMenu(screen.getByText('Surface'));
    expect(screen.getByText('Action')).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('renders secondary color on menu items', () => {
    renderWithTheme(
      <ContextMenu.Root color="secondary" size="md" variant="soft">
        <ContextMenu.Trigger>Surface</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup>
              <ContextMenu.Item>Action</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );
    fireEvent.contextMenu(screen.getByText('Surface'));
    expect(screen.getByText('Action')).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('opens on right click and applies themed attributes to menu items', () => {
    renderWithTheme(
      <ContextMenu.Root color="brand" size="lg" variant="soft">
        <ContextMenu.Trigger>Context Surface</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup>
              <ContextMenu.Item>Reload Runtime</ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );

    fireEvent.contextMenu(screen.getByText('Context Surface'));

    const item = screen.getByText('Reload Runtime');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-ov-color', 'brand');
    expect(item).toHaveAttribute('data-ov-size', 'lg');
    expect(item).toHaveAttribute('data-ov-variant', 'soft');
  });
});
