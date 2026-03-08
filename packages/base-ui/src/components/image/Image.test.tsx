import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Image } from './Image';

describe('Image', () => {
  it('renders img with src and alt', () => {
    renderWithTheme(<Image src="https://example.com/photo.jpg" alt="A photo" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'A photo');
  });

  it('applies default data attributes', () => {
    renderWithTheme(<Image data-testid="wrapper" src="https://example.com/photo.jpg" alt="test" />);
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toHaveAttribute('data-ov-object-fit', 'cover');
    expect(wrapper).toHaveAttribute('data-ov-radius', 'none');
    expect(wrapper).toHaveAttribute('data-ov-status', 'loading');
  });

  it('shows fallback on error', () => {
    renderWithTheme(<Image src="broken.jpg" alt="broken" fallback={<span>No image</span>} />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('No image')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies custom objectFit and borderRadius', () => {
    renderWithTheme(
      <Image
        data-testid="wrapper"
        src="https://example.com/photo.jpg"
        alt="test"
        objectFit="contain"
        borderRadius="lg"
      />,
    );
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toHaveAttribute('data-ov-object-fit', 'contain');
    expect(wrapper).toHaveAttribute('data-ov-radius', 'lg');
  });

  it('does not render img when src is falsy', () => {
    renderWithTheme(<Image data-testid="wrapper" alt="empty" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('wrapper')).toHaveAttribute('data-ov-status', 'error');
  });

  it('transitions to loaded on successful load', () => {
    renderWithTheme(<Image data-testid="wrapper" src="https://example.com/photo.jpg" alt="test" />);
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toHaveAttribute('data-ov-status', 'loading');
    fireEvent.load(screen.getByRole('img'));
    expect(wrapper).toHaveAttribute('data-ov-status', 'loaded');
  });

  it('merges className on wrapper', () => {
    renderWithTheme(
      <Image
        data-testid="wrapper"
        src="https://example.com/photo.jpg"
        alt="test"
        className="custom"
      />,
    );
    expect(screen.getByTestId('wrapper').className).toContain('custom');
  });
});
