import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders when open=true', () => {
    renderWithTheme(
      <Dialog open onClose={() => {}}>
        <Dialog.Title>Test Dialog</Dialog.Title>
        <Dialog.Body>Body content</Dialog.Body>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeVisible();
    expect(screen.getByText('Body content')).toBeVisible();
  });

  it('renders nothing when open=false', () => {
    renderWithTheme(
      <Dialog open={false} onClose={() => {}}>
        <Dialog.Title>Hidden Dialog</Dialog.Title>
      </Dialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose on backdrop click', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Dialog open onClose={onClose}>
        <Dialog.Body>Content</Dialog.Body>
      </Dialog>,
    );

    const backdrop = document.querySelector('[data-ov-slot="backdrop"]');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Dialog open onClose={onClose}>
        <Dialog.Body>Content</Dialog.Body>
      </Dialog>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders Title with children', () => {
    renderWithTheme(
      <Dialog open onClose={() => {}}>
        <Dialog.Title>My Title</Dialog.Title>
      </Dialog>,
    );

    const title = screen.getByText('My Title');
    expect(title.tagName).toBe('H2');
  });

  it('renders Title with icon', () => {
    renderWithTheme(
      <Dialog open onClose={() => {}}>
        <Dialog.Title icon={<span data-testid="icon">!</span>}>Warning</Dialog.Title>
      </Dialog>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeVisible();
  });

  it('renders Body content', () => {
    renderWithTheme(
      <Dialog open onClose={() => {}}>
        <Dialog.Body>
          <p>Paragraph inside body</p>
        </Dialog.Body>
      </Dialog>,
    );

    expect(screen.getByText('Paragraph inside body')).toBeVisible();
  });

  it('renders Footer content', () => {
    renderWithTheme(
      <Dialog open onClose={() => {}}>
        <Dialog.Footer>
          <button type="button">Save</button>
        </Dialog.Footer>
      </Dialog>,
    );

    expect(screen.getByText('Save')).toBeVisible();
  });

  it('Close button calls onClose', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Dialog open onClose={onClose}>
        <Dialog.Close />
      </Dialog>,
    );

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies size data attribute', () => {
    const { rerender } = renderWithTheme(
      <Dialog open onClose={() => {}} size="sm">
        <Dialog.Body>Small</Dialog.Body>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('data-ov-size', 'sm');

    rerender(
      <Dialog open onClose={() => {}} size="xl">
        <Dialog.Body>XL</Dialog.Body>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('data-ov-size', 'xl');
  });

  it('defaults size to md', () => {
    renderWithTheme(
      <Dialog open onClose={() => {}}>
        <Dialog.Body>Default</Dialog.Body>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('data-ov-size', 'md');
  });

  it('forwards ref to the surface element', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <Dialog ref={ref} open onClose={() => {}}>
        <Dialog.Body>Ref test</Dialog.Body>
      </Dialog>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole('dialog'));
  });

  it('merges className on surface', () => {
    renderWithTheme(
      <Dialog open onClose={() => {}} className="custom-class">
        <Dialog.Body>Class test</Dialog.Body>
      </Dialog>,
    );

    expect(screen.getByRole('dialog').className).toContain('custom-class');
  });
});
