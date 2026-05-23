import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ScrollArea } from './ScrollArea';

describe('ScrollArea', () => {
  it('renders with default orientation', () => {
    renderWithTheme(
      <ScrollArea data-testid="scroll">
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    const el = screen.getByTestId('scroll');
    expect(el).toBeVisible();
    expect(el).toHaveAttribute('data-ov-orientation', 'vertical');
    expect(el).toHaveAttribute('data-ov-size', 'md');
    expect(el).toHaveAttribute('tabindex', '0');
  });

  it('accepts xs and xl sizes', () => {
    const { rerender } = renderWithTheme(
      <ScrollArea size="xs" data-testid="scroll"><p>Content</p></ScrollArea>,
    );
    expect(screen.getByTestId('scroll')).toHaveAttribute('data-ov-size', 'xs');

    rerender(<ScrollArea size="xl" data-testid="scroll"><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll')).toHaveAttribute('data-ov-size', 'xl');
  });

  it('accepts custom orientation and size', () => {
    renderWithTheme(
      <ScrollArea orientation="both" size="sm" data-testid="scroll">
        <p>Content</p>
      </ScrollArea>,
    );
    const el = screen.getByTestId('scroll');
    expect(el).toHaveAttribute('data-ov-orientation', 'both');
    expect(el).toHaveAttribute('data-ov-size', 'sm');
  });
});
