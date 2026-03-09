import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  it('renders children', () => {
    renderWithTheme(
      <Toolbar aria-label="Actions">
        <button type="button">Save</button>
      </Toolbar>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('applies role="toolbar"', () => {
    renderWithTheme(<Toolbar aria-label="Actions">content</Toolbar>);

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('applies size data attribute', () => {
    renderWithTheme(
      <Toolbar aria-label="Actions" size="sm">
        content
      </Toolbar>,
    );

    expect(screen.getByRole('toolbar')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('defaults size to md', () => {
    renderWithTheme(<Toolbar aria-label="Actions">content</Toolbar>);

    expect(screen.getByRole('toolbar')).toHaveAttribute('data-ov-size', 'md');
  });

  it('merges className', () => {
    renderWithTheme(
      <Toolbar aria-label="Actions" className="custom-class">
        content
      </Toolbar>,
    );

    expect(screen.getByRole('toolbar')).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <Toolbar ref={ref} aria-label="Actions">
        content
      </Toolbar>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  describe('Toolbar.Group', () => {
    it('renders children within a group', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Group>
            <button type="button">Cut</button>
            <button type="button">Copy</button>
          </Toolbar.Group>
        </Toolbar>,
      );

      expect(screen.getByRole('button', { name: 'Cut' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Copy' })).toBeVisible();
    });

    it('renders with separator', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Group>
            <button type="button">Cut</button>
          </Toolbar.Group>
          <Toolbar.Group separator data-testid="sep-group">
            <button type="button">Paste</button>
          </Toolbar.Group>
        </Toolbar>,
      );

      const group = screen.getByTestId('sep-group');
      expect(group).toHaveAttribute('data-ov-separator', 'true');

      // Assert the actual separator element is rendered
      const separator = group.querySelector('[role="separator"]');
      expect(separator).toBeInTheDocument();
    });

    it('does not render separator by default', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Group data-testid="no-sep">
            <button type="button">Cut</button>
          </Toolbar.Group>
        </Toolbar>,
      );

      const group = screen.getByTestId('no-sep');
      expect(group).not.toHaveAttribute('data-ov-separator');
    });

    it('forwards ref on Group', () => {
      const ref = createRef<HTMLDivElement>();
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Group ref={ref}>
            <button type="button">Cut</button>
          </Toolbar.Group>
        </Toolbar>,
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('merges className on Group', () => {
      renderWithTheme(
        <Toolbar aria-label="Actions">
          <Toolbar.Group className="group-custom" data-testid="g">
            <button type="button">Cut</button>
          </Toolbar.Group>
        </Toolbar>,
      );

      expect(screen.getByTestId('g')).toHaveClass('group-custom');
    });
  });
});
