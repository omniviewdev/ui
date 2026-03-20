import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children and badge content', () => {
    renderWithTheme(
      <Badge content={5}>
        <span data-testid="child">Inbox</span>
      </Badge>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('dot variant renders without text', () => {
    renderWithTheme(
      <Badge variant="dot" content={5}>
        <span>Mail</span>
      </Badge>,
    );

    const badge = document.querySelector('[data-ov-variant="dot"]');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('');
  });

  it('position variants place badge correctly via data attributes', () => {
    const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const;

    for (const position of positions) {
      const { unmount } = renderWithTheme(
        <Badge content={1} position={position}>
          <span>Icon</span>
        </Badge>,
      );

      const badge = document.querySelector(`[data-ov-position="${position}"]`);
      expect(badge).toBeInTheDocument();
      unmount();
    }
  });

  it('max prop caps display (100 with max=99 shows "99+")', () => {
    renderWithTheme(
      <Badge content={100} max={99}>
        <span>Inbox</span>
      </Badge>,
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('does not cap when content is at or below max', () => {
    renderWithTheme(
      <Badge content={99} max={99}>
        <span>Inbox</span>
      </Badge>,
    );

    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('invisible prop hides badge', () => {
    renderWithTheme(
      <Badge content={3} invisible>
        <span>Inbox</span>
      </Badge>,
    );

    const badge = document.querySelector('[data-ov-invisible="true"]');
    expect(badge).toBeInTheDocument();
  });

  it('color variants apply correct data attributes', () => {
    const colors = ['neutral', 'brand', 'success', 'warning', 'danger'] as const;

    for (const color of colors) {
      const { unmount } = renderWithTheme(
        <Badge content={1} color={color}>
          <span>Icon</span>
        </Badge>,
      );

      const badge = document.querySelector(`[data-ov-color="${color}"]`);
      expect(badge).toBeInTheDocument();
      unmount();
    }
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();

    renderWithTheme(
      <Badge content={1} ref={ref}>
        <span>Inbox</span>
      </Badge>,
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.getAttribute('data-ov-component')).toBe('badge');
  });

  it('className merge works', () => {
    renderWithTheme(
      <Badge content={1} className="custom-class">
        <span>Inbox</span>
      </Badge>,
    );

    const root = document.querySelector('[data-ov-component="badge"]');
    expect(root?.className).toContain('custom-class');
  });

  it('renders string content', () => {
    renderWithTheme(
      <Badge content="new">
        <span>Inbox</span>
      </Badge>,
    );

    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('pulse prop applies data attribute', () => {
    renderWithTheme(
      <Badge content={1} pulse>
        <span>Icon</span>
      </Badge>,
    );

    const badge = document.querySelector('[data-ov-pulse="true"]');
    expect(badge).toBeInTheDocument();
  });

  it('size prop applies data attribute', () => {
    renderWithTheme(
      <Badge content={1} size="lg">
        <span>Icon</span>
      </Badge>,
    );

    const badge = document.querySelector('[data-ov-size="lg"]');
    expect(badge).toBeInTheDocument();
  });

  it('xs size prop applies data attribute', () => {
    renderWithTheme(
      <Badge content={1} size="xs">
        <span>Icon</span>
      </Badge>,
    );
    expect(document.querySelector('[data-ov-size="xs"]')).toBeInTheDocument();
  });

  it('xl size prop applies data attribute', () => {
    renderWithTheme(
      <Badge content={1} size="xl">
        <span>Icon</span>
      </Badge>,
    );
    expect(document.querySelector('[data-ov-size="xl"]')).toBeInTheDocument();
  });

  it('discovery and secondary color variants apply data attributes', () => {
    const { unmount } = renderWithTheme(
      <Badge content={1} color="discovery">
        <span>Icon</span>
      </Badge>,
    );
    expect(document.querySelector('[data-ov-color="discovery"]')).toBeInTheDocument();
    unmount();

    renderWithTheme(
      <Badge content={1} color="secondary">
        <span>Icon</span>
      </Badge>,
    );
    expect(document.querySelector('[data-ov-color="secondary"]')).toBeInTheDocument();
  });

  it('overlap prop applies data attribute for circular', () => {
    renderWithTheme(
      <Badge content={1} overlap="circular">
        <span>Avatar</span>
      </Badge>,
    );

    const badge = document.querySelector('[data-ov-overlap="circular"]');
    expect(badge).toBeInTheDocument();
  });
});
