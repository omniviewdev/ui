import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders with default data attributes', () => {
    renderWithTheme(<Stack data-testid="stack">Content</Stack>);
    const el = screen.getByTestId('stack');
    expect(el).toHaveAttribute('data-ov-direction', 'column');
    expect(el).toHaveAttribute('data-ov-spacing', '2');
  });

  it('applies custom direction', () => {
    renderWithTheme(
      <Stack data-testid="stack" direction="row">
        Content
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveAttribute('data-ov-direction', 'row');
  });

  it('applies custom spacing', () => {
    renderWithTheme(
      <Stack data-testid="stack" spacing={4}>
        Content
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveAttribute('data-ov-spacing', '4');
  });

  it('applies zero spacing', () => {
    renderWithTheme(
      <Stack data-testid="stack" spacing={0}>
        Content
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveAttribute('data-ov-spacing', '0');
  });

  it('applies align prop', () => {
    renderWithTheme(
      <Stack data-testid="stack" align="center">
        Content
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveAttribute('data-ov-align', 'center');
  });

  it('applies justify prop', () => {
    renderWithTheme(
      <Stack data-testid="stack" justify="between">
        Content
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveAttribute('data-ov-justify', 'between');
  });

  it('applies wrap prop', () => {
    renderWithTheme(
      <Stack data-testid="stack" wrap>
        Content
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveAttribute('data-ov-wrap', 'true');
  });

  it('does not set optional attributes when not provided', () => {
    renderWithTheme(<Stack data-testid="stack">Content</Stack>);
    const el = screen.getByTestId('stack');
    expect(el).not.toHaveAttribute('data-ov-align');
    expect(el).not.toHaveAttribute('data-ov-justify');
    expect(el).not.toHaveAttribute('data-ov-wrap');
    expect(el).not.toHaveAttribute('data-ov-divider');
  });

  it('renders dividers between children when divider=true', () => {
    renderWithTheme(
      <Stack data-testid="stack" divider>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    expect(el).toHaveAttribute('data-ov-divider', 'true');
    // 3 children + 2 separators = 5 child nodes
    expect(el.children).toHaveLength(5);
    // Separators should have role="separator" or "presentation"
    const separators = el.querySelectorAll('[role="presentation"]');
    expect(separators).toHaveLength(2);
  });

  it('renders vertical separators when direction is row', () => {
    renderWithTheme(
      <Stack data-testid="stack" direction="row" divider>
        <div>A</div>
        <div>B</div>
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    const separator = el.querySelector('[role="presentation"]');
    expect(separator).toHaveAttribute('data-ov-orientation', 'vertical');
  });

  it('renders horizontal separators when direction is column', () => {
    renderWithTheme(
      <Stack data-testid="stack" direction="column" divider>
        <div>A</div>
        <div>B</div>
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    const separator = el.querySelector('[role="presentation"]');
    expect(separator).toHaveAttribute('data-ov-orientation', 'horizontal');
  });

  it('supports as prop', () => {
    renderWithTheme(
      <Stack data-testid="stack" as="nav">
        Nav
      </Stack>,
    );
    expect(screen.getByTestId('stack').tagName).toBe('NAV');
  });

  it('renders as div by default', () => {
    renderWithTheme(<Stack data-testid="stack">Content</Stack>);
    expect(screen.getByTestId('stack').tagName).toBe('DIV');
  });

  it('merges className', () => {
    renderWithTheme(
      <Stack data-testid="stack" className="custom">
        Content
      </Stack>,
    );
    expect(screen.getByTestId('stack').className).toContain('custom');
  });
});
