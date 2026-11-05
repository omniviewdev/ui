import { createRef, useState } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Dialog } from './Dialog';
import { Popover } from '../popover';

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

  it('dismisses help kept open on focus-out before the dialog', async () => {
    const user = userEvent.setup();
    function CreateDialog() {
      const [open, setOpen] = useState(true);
      const [draft, setDraft] = useState('keep this draft');
      return (
        <Dialog open={open} onClose={() => setOpen(false)}>
          <Dialog.Title>Create resource</Dialog.Title>
          <input
            aria-label="Name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Popover.Root
            onOpenChange={(_open, details) => {
              if (details.reason === 'focus-out') details.cancel();
            }}
          >
            <Popover.Trigger>Help</Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner>
                <Popover.Popup aria-label="Name help" initialFocus={false}>
                  Name semantics
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </Dialog>
      );
    }
    renderWithTheme(<CreateDialog />);
    await user.click(screen.getByRole('button', { name: 'Help' }));
    expect(await screen.findByRole('dialog', { name: 'Name help' })).toBeVisible();
    screen.getByRole('textbox', { name: 'Name' }).focus();
    expect(screen.getByRole('dialog', { name: 'Name help' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Help' })).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Name help' })).toBeNull());
    expect(screen.getByRole('dialog', { name: 'Create resource' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('keep this draft');
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Create resource' })).toBeNull(),
    );
  });

  it('closes normally after help has already dismissed on focus-out', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(
      <Dialog open onClose={onClose}>
        <input aria-label="Name" defaultValue="keep this draft" />
        <Popover.Root>
          <Popover.Trigger>Help</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup aria-label="Name help" initialFocus={false}>
                Name semantics
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Help' }));
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Name help' })).toBeVisible());
    screen.getByRole('textbox', { name: 'Name' }).focus();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Help' })).toHaveAttribute(
        'aria-expanded',
        'false',
      ),
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when a document-level keyboard handler prevents Escape', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Dialog open onClose={onClose}>
        Content
      </Dialog>,
    );
    const preventEscape = (event: KeyboardEvent) => event.preventDefault();
    document.addEventListener('keydown', preventEscape);
    try {
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('keydown', preventEscape);
    }
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
