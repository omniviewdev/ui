import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { IconButton } from '../icon-button';
import { Popover } from './Popover';

describe('Popover', () => {
  it('preserves an explicitly styled rendered trigger over inherited popover styles', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Popover.Root size="lg" color="brand" variant="solid">
        <Popover.Trigger
          render={
            <IconButton aria-label="Filter columns" size="sm" color="neutral" variant="outline">
              <span aria-hidden>Filter</span>
            </IconButton>
          }
        />
      </Popover.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Filter columns' });
    expect(trigger).toHaveAttribute('data-ov-size', 'sm');
    expect(trigger).toHaveAttribute('data-ov-color', 'neutral');
    expect(trigger).toHaveAttribute('data-ov-variant', 'outline');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('prioritizes explicit trigger styles and inherits missing rendered styles independently', () => {
    renderWithTheme(
      <Popover.Root size="lg" color="brand" variant="solid">
        <Popover.Trigger
          size="xs"
          render={
            <IconButton aria-label="Filter columns" size="sm" variant="outline">
              <span aria-hidden>Filter</span>
            </IconButton>
          }
        />
      </Popover.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Filter columns' });
    expect(trigger).toHaveAttribute('data-ov-size', 'xs');
    expect(trigger).toHaveAttribute('data-ov-color', 'brand');
    expect(trigger).toHaveAttribute('data-ov-variant', 'outline');
  });

  it('inherits styles instead of inferring unrelated native input props', () => {
    renderWithTheme(
      <Popover.Root size="lg" color="brand" variant="solid">
        <Popover.Trigger
          nativeButton={false}
          render={<input aria-label="Filter columns" size={12} color="#123456" />}
        />
      </Popover.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Filter columns' });
    expect(trigger).toHaveAttribute('size', '12');
    expect(trigger).toHaveAttribute('data-ov-size', 'lg');
    expect(trigger).toHaveAttribute('data-ov-color', 'brand');
    expect(trigger).toHaveAttribute('data-ov-variant', 'solid');
  });

  it.each([
    { color: '#123456', variant: 'compact', expectedColor: 'brand', expectedVariant: 'solid' },
    { color: 'neutral', variant: 'compact', expectedColor: 'neutral', expectedVariant: 'solid' },
    { color: '#123456', variant: 'outline', expectedColor: 'brand', expectedVariant: 'outline' },
  ])(
    'infers generic rendered styles independently for color=$color and variant=$variant',
    ({ color, variant, expectedColor, expectedVariant }) => {
      const GenericInput = forwardRef<
        HTMLInputElement,
        ComponentPropsWithoutRef<'input'> & { variant: string }
      >(function GenericInput({ variant: _variant, ...props }, ref) {
        void _variant;
        return <input ref={ref} {...props} />;
      });

      renderWithTheme(
        <Popover.Root size="lg" color="brand" variant="solid">
          <Popover.Trigger
            nativeButton={false}
            render={
              <GenericInput aria-label="Filter columns" size={12} color={color} variant={variant} />
            }
          />
        </Popover.Root>,
      );

      const trigger = screen.getByRole('button', { name: 'Filter columns' });
      expect(trigger).toHaveAttribute('size', '12');
      expect(trigger).toHaveAttribute('data-ov-size', 'lg');
      expect(trigger).toHaveAttribute('data-ov-color', expectedColor);
      expect(trigger).toHaveAttribute('data-ov-variant', expectedVariant);
    },
  );

  it('preserves trigger interaction and state through a render function', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Popover.Root size="lg" color="brand" variant="solid">
        <Popover.Trigger
          size="sm"
          render={(props, state) => (
            <button {...props}>{state.open ? 'Close filters' : 'Open filters'}</button>
          )}
        />
      </Popover.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Open filters' });
    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Close filters' })).toBe(trigger);
  });

  it('renders discovery and secondary colors on popup', () => {
    renderWithTheme(
      <Popover.Root defaultOpen color="discovery">
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Title</Popover.Title>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>,
    );
    const popup = screen.getByText('Title').closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('renders secondary color on popup', () => {
    renderWithTheme(
      <Popover.Root defaultOpen color="secondary">
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Title</Popover.Title>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>,
    );
    const popup = screen.getByText('Title').closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('renders themed popup and close action when opened', () => {
    renderWithTheme(
      <Popover.Root defaultOpen color="brand" size="lg" variant="solid">
        <Popover.Trigger>Workspace Details</Popover.Trigger>
        <Popover.Portal>
          <Popover.Backdrop />
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup>
              <Popover.Arrow />
              <Popover.Title>Workspace Diagnostics</Popover.Title>
              <Popover.Description>No active failures in the queue.</Popover.Description>
              <Popover.Close>Done</Popover.Close>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>,
    );

    const title = screen.getByText('Workspace Diagnostics');
    expect(title).toBeInTheDocument();

    const popup = title.closest('[data-ov-color]');
    expect(popup).toHaveAttribute('data-ov-color', 'brand');
    expect(popup).toHaveAttribute('data-ov-size', 'lg');
    expect(popup).toHaveAttribute('data-ov-variant', 'solid');

    const closeButton = screen.getByRole('button', { name: 'Done' });
    expect(closeButton).toHaveAttribute('data-ov-color', 'brand');
    expect(closeButton).toHaveAttribute('data-ov-size', 'lg');
    expect(closeButton).toHaveAttribute('data-ov-variant', 'solid');
  });
});
