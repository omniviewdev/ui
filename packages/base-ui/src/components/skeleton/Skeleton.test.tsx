import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders text variant with pulse by default', () => {
    renderWithTheme(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toBeVisible();
    expect(el).toHaveAttribute('data-ov-variant', 'text');
    expect(el).toHaveAttribute('data-ov-animation', 'pulse');
  });

  it('renders circular variant', () => {
    renderWithTheme(<Skeleton variant="circular" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('data-ov-variant', 'circular');
  });

  it('renders rectangular variant', () => {
    renderWithTheme(<Skeleton variant="rectangular" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('data-ov-variant', 'rectangular');
  });

  it('renders rounded variant', () => {
    renderWithTheme(<Skeleton variant="rounded" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('data-ov-variant', 'rounded');
  });

  it('renders multiple skeleton lines when lines > 1', () => {
    renderWithTheme(<Skeleton lines={3} data-testid="skeleton" />);
    const wrapper = screen.getByTestId('skeleton');
    expect(wrapper.children).toHaveLength(3);
  });

  it('last line is 80% width when lines > 1', () => {
    renderWithTheme(<Skeleton lines={2} data-testid="skeleton" />);
    const wrapper = screen.getByTestId('skeleton');
    const lastLine = wrapper.children[1] as HTMLElement;
    expect(lastLine.style.getPropertyValue('--_sk-width')).toBe('80%');
  });

  it('applies animation prop', () => {
    renderWithTheme(<Skeleton animation="wave" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('data-ov-animation', 'wave');
  });

  it('applies animation none', () => {
    renderWithTheme(<Skeleton animation="none" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('data-ov-animation', 'none');
  });

  it('applies custom width and height as inline styles (number)', () => {
    renderWithTheme(<Skeleton width={200} height={40} data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.style.getPropertyValue('--_sk-width')).toBe('200px');
    expect(el.style.getPropertyValue('--_sk-height')).toBe('40px');
  });

  it('applies custom width and height as inline styles (string)', () => {
    renderWithTheme(<Skeleton width="50%" height="2rem" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.style.getPropertyValue('--_sk-width')).toBe('50%');
    expect(el.style.getPropertyValue('--_sk-height')).toBe('2rem');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(<Skeleton className="custom" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.className).toContain('custom');
  });

  it('sets data-ov-component attribute', () => {
    renderWithTheme(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('data-ov-component', 'skeleton');
  });
});
