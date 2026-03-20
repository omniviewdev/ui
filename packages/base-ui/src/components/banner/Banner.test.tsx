import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '../../test/render';
import { Banner } from './Banner';

describe('Banner', () => {
  it('renders compound slots', () => {
    renderWithTheme(
      <Banner variant="soft" color="success" size="md">
        <Banner.Icon>!</Banner.Icon>
        <Banner.Content>
          <Banner.Title>Success</Banner.Title>
          Operation completed.
        </Banner.Content>
        <Banner.Close />
      </Banner>,
    );

    expect(screen.getByText('Success')).toBeVisible();
    expect(screen.getByText('Operation completed.')).toBeVisible();

    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('data-ov-variant', 'soft');
    expect(el).toHaveAttribute('data-ov-color', 'success');
    expect(el).toHaveAttribute('data-ov-size', 'md');
  });

  it('fires close handler', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(
      <Banner color="danger">
        <Banner.Content>
          <Banner.Title>Error</Banner.Title>
        </Banner.Content>
        <Banner.Close onClick={onClose} />
      </Banner>,
    );

    await user.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders with info color', () => {
    renderWithTheme(
      <Banner color="info">
        <Banner.Content>
          <Banner.Title>Info</Banner.Title>
        </Banner.Content>
      </Banner>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('data-ov-color', 'info');
  });

  it('applies xs and xl size data attributes', () => {
    const { rerender } = renderWithTheme(
      <Banner size="xs">
        <Banner.Content>
          <Banner.Title>Title</Banner.Title>
        </Banner.Content>
      </Banner>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('data-ov-size', 'xs');

    rerender(
      <Banner size="xl">
        <Banner.Content>
          <Banner.Title>Title</Banner.Title>
        </Banner.Content>
      </Banner>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery and secondary color data attributes', () => {
    const { rerender } = renderWithTheme(
      <Banner color="discovery">
        <Banner.Content>
          <Banner.Title>Discovery</Banner.Title>
        </Banner.Content>
      </Banner>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('data-ov-color', 'discovery');

    rerender(
      <Banner color="secondary">
        <Banner.Content>
          <Banner.Title>Secondary</Banner.Title>
        </Banner.Content>
      </Banner>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('data-ov-color', 'secondary');
  });
});
