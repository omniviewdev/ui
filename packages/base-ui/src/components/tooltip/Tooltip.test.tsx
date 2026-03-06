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
});
