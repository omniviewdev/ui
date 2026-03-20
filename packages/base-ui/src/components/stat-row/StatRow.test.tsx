import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { StatRow } from './StatRow';

describe('StatRow', () => {
  it('renders items with automatic dividers', () => {
    renderWithTheme(
      <StatRow data-testid="row">
        <StatRow.Item>First</StatRow.Item>
        <StatRow.Item>Second</StatRow.Item>
        <StatRow.Item>Third</StatRow.Item>
      </StatRow>,
    );

    expect(screen.getByTestId('row')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
    // Two dividers between three items
    const dividers = screen.getByTestId('row').querySelectorAll('[aria-hidden]');
    expect(dividers).toHaveLength(2);
  });

  it('renders items without dividers when separator is null', () => {
    renderWithTheme(
      <StatRow separator={null} data-testid="row">
        <StatRow.Item>A</StatRow.Item>
        <StatRow.Item>B</StatRow.Item>
      </StatRow>,
    );

    const dividers = screen.getByTestId('row').querySelectorAll('[aria-hidden]');
    expect(dividers).toHaveLength(0);
  });

  it('renders custom separator character', () => {
    renderWithTheme(
      <StatRow separator="|" data-testid="row">
        <StatRow.Item>X</StatRow.Item>
        <StatRow.Item>Y</StatRow.Item>
      </StatRow>,
    );

    expect(screen.getByText('|')).toBeInTheDocument();
  });

  it('renders item with icon', () => {
    renderWithTheme(
      <StatRow>
        <StatRow.Item icon={<svg data-testid="icon" />}>Value</StatRow.Item>
      </StatRow>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('applies size data attribute', () => {
    renderWithTheme(
      <StatRow size="lg" data-testid="row">
        <StatRow.Item>Test</StatRow.Item>
      </StatRow>,
    );

    expect(screen.getByTestId('row')).toHaveAttribute('data-ov-size', 'lg');
  });

  it('applies color data attribute on item', () => {
    renderWithTheme(
      <StatRow>
        <StatRow.Item color="success" data-testid="item">OK</StatRow.Item>
      </StatRow>,
    );

    expect(screen.getByTestId('item')).toHaveAttribute('data-ov-color', 'success');
  });

  it('defaults to sm size', () => {
    renderWithTheme(
      <StatRow data-testid="row">
        <StatRow.Item>Test</StatRow.Item>
      </StatRow>,
    );

    expect(screen.getByTestId('row')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('forwards ref on root', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <StatRow ref={ref}>
        <StatRow.Item>Test</StatRow.Item>
      </StatRow>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref on item', () => {
    const ref = createRef<HTMLSpanElement>();
    renderWithTheme(
      <StatRow>
        <StatRow.Item ref={ref}>Test</StatRow.Item>
      </StatRow>,
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className on root and item', () => {
    renderWithTheme(
      <StatRow className="custom-root" data-testid="row">
        <StatRow.Item className="custom-item" data-testid="item">V</StatRow.Item>
      </StatRow>,
    );

    expect(screen.getByTestId('row')).toHaveClass('custom-root');
    expect(screen.getByTestId('item')).toHaveClass('custom-item');
  });

  it('renders single item without any dividers', () => {
    renderWithTheme(
      <StatRow data-testid="row">
        <StatRow.Item>Solo</StatRow.Item>
      </StatRow>,
    );

    const dividers = screen.getByTestId('row').querySelectorAll('[aria-hidden]');
    expect(dividers).toHaveLength(0);
  });

  it('renders discovery and secondary colors on item', () => {
    const { rerender } = renderWithTheme(
      <StatRow>
        <StatRow.Item color="discovery" data-testid="item">Val</StatRow.Item>
      </StatRow>,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('data-ov-color', 'discovery');

    rerender(
      <StatRow>
        <StatRow.Item color="secondary" data-testid="item">Val</StatRow.Item>
      </StatRow>,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('data-ov-color', 'secondary');
  });
});
