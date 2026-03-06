import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Separator } from './Separator';

describe('Separator', () => {
  it('renders themed root attributes', () => {
    renderWithTheme(
      <Separator variant="outline" color="brand" size="lg" data-testid="separator-root" />,
    );

    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('data-ov-variant', 'outline');
    expect(separator).toHaveAttribute('data-ov-color', 'brand');
    expect(separator).toHaveAttribute('data-ov-size', 'lg');
  });

  it('renders accessibility attributes for orientation', () => {
    renderWithTheme(<Separator orientation="vertical" data-testid="separator-root" />);

    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('supports decorative and labeled usage', () => {
    renderWithTheme(
      <>
        <Separator decorative data-testid="decorative" />
        <Separator label="Runtime" labelAlign="end" inset="middle" data-testid="labeled" />
      </>,
    );

    const decorative = screen.getByTestId('decorative');
    const labeled = screen.getByTestId('labeled');
    const label = screen.getByText('Runtime');

    expect(decorative).toHaveAttribute('aria-hidden', 'true');
    expect(decorative).toHaveAttribute('role', 'presentation');
    expect(labeled).toHaveAttribute('data-ov-has-label', 'true');
    expect(labeled).toHaveAttribute('data-ov-label-align', 'end');
    expect(labeled).toHaveAttribute('data-ov-inset', 'middle');
    expect(label).toBeInTheDocument();
  });
});
