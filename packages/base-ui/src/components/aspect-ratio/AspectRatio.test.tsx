import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { AspectRatio } from './AspectRatio';

describe('AspectRatio', () => {
  it('renders children with default 16/9 ratio', () => {
    renderWithTheme(
      <AspectRatio data-testid="aspect">
        <div>Content</div>
      </AspectRatio>,
    );
    const el = screen.getByTestId('aspect');
    expect(el).toBeVisible();
    expect(el.style.getPropertyValue('--_aspect-ratio')).toBe(String(16 / 9));
  });

  it('accepts a custom ratio', () => {
    renderWithTheme(
      <AspectRatio ratio={4 / 3} data-testid="aspect">
        <div>Content</div>
      </AspectRatio>,
    );
    const el = screen.getByTestId('aspect');
    expect(el.style.getPropertyValue('--_aspect-ratio')).toBe(String(4 / 3));
  });
});
