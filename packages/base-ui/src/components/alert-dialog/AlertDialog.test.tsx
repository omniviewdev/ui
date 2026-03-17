import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  it('renders discovery color on popup', () => {
    renderWithTheme(
      <AlertDialog.Root defaultOpen color="discovery">
        <AlertDialog.Trigger>Open</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Popup>
            <AlertDialog.Title>Discovery Dialog</AlertDialog.Title>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );
    const popup = screen.getByText('Discovery Dialog').closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('renders secondary color on popup', () => {
    renderWithTheme(
      <AlertDialog.Root defaultOpen color="secondary">
        <AlertDialog.Trigger>Open</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Popup>
            <AlertDialog.Title>Secondary Dialog</AlertDialog.Title>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );
    const popup = screen.getByText('Secondary Dialog').closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('renders themed popup when opened', () => {
    renderWithTheme(
      <AlertDialog.Root defaultOpen color="brand" size="lg" variant="outline">
        <AlertDialog.Trigger>Delete Workspace</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Popup>
            <AlertDialog.Title>Delete workspace?</AlertDialog.Title>
            <AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );

    const title = screen.getByText('Delete workspace?');
    expect(title).toBeVisible();

    const popup = title.closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'brand');
    expect(popup).toHaveAttribute('data-ov-size', 'lg');
    expect(popup).toHaveAttribute('data-ov-variant', 'outline');
  });
});
