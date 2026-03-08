import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { StatusDot } from './StatusDot';

describe('StatusDot', () => {
  it('renders a dot element', () => {
    const { container } = renderWithTheme(<StatusDot />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root.querySelector('[class*="Dot"]')).toBeInTheDocument();
  });

  it('applies correct data attribute for each status', () => {
    const statuses = ['success', 'warning', 'danger', 'info', 'neutral', 'pending'] as const;
    for (const status of statuses) {
      const { container, unmount } = renderWithTheme(<StatusDot status={status} />);
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute('data-ov-status', status);
      unmount();
    }
  });

  it('defaults to neutral status', () => {
    const { container } = renderWithTheme(<StatusDot />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-ov-status', 'neutral');
  });

  it('renders a label beside the dot', () => {
    renderWithTheme(<StatusDot label="Online" />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('does not render a label when label is not provided', () => {
    const { container } = renderWithTheme(<StatusDot />);
    expect(container.querySelector('[class*="Label"]')).not.toBeInTheDocument();
  });

  it('sets data-ov-pulse to true when pulse is enabled', () => {
    const { container } = renderWithTheme(<StatusDot pulse />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-ov-pulse', 'true');
  });

  it('sets data-ov-pulse to false by default', () => {
    const { container } = renderWithTheme(<StatusDot />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-ov-pulse', 'false');
  });

  it('applies correct data attribute for each size', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const { container, unmount } = renderWithTheme(<StatusDot size={size} />);
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute('data-ov-size', size);
      unmount();
    }
  });

  it('defaults to md size', () => {
    const { container } = renderWithTheme(<StatusDot />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-ov-size', 'md');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    renderWithTheme(<StatusDot ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className', () => {
    const { container } = renderWithTheme(<StatusDot className="custom-class" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('custom-class');
  });

  it('passes through additional HTML attributes', () => {
    const { container } = renderWithTheme(<StatusDot data-testid="my-dot" id="dot-1" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-testid', 'my-dot');
    expect(root).toHaveAttribute('id', 'dot-1');
  });
});
