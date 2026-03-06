import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Popover } from './Popover';

describe('Popover', () => {
  it('renders themed popup and close action when opened', () => {
    renderWithTheme(
      <Popover.Root defaultOpen color="brand" size="lg" variant="solid">
        <Popover.Trigger>Workspace Details</Popover.Trigger>
        <Popover.Portal>
          <Popover.Backdrop />
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup>
              <Popover.Arrow />
              <Popover.Title>Workspace Diagnostics</Popover.Title>
              <Popover.Description>No active failures in the queue.</Popover.Description>
              <Popover.Close>Done</Popover.Close>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>,
    );

    const title = screen.getByText('Workspace Diagnostics');
    expect(title).toBeInTheDocument();

    const popup = title.closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'brand');
    expect(popup).toHaveAttribute('data-ov-size', 'lg');
    expect(popup).toHaveAttribute('data-ov-variant', 'solid');

    const closeButton = screen.getByRole('button', { name: 'Done' });
    expect(closeButton).toHaveAttribute('data-ov-color', 'brand');
    expect(closeButton).toHaveAttribute('data-ov-size', 'lg');
    expect(closeButton).toHaveAttribute('data-ov-variant', 'solid');
  });
});
