import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ContextMenu } from './ContextMenu';

describe('ContextMenu', () => {
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
