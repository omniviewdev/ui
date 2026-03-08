import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
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
