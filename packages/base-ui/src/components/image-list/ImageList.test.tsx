import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ImageList } from './ImageList';

describe('ImageList', () => {
  it('renders with default variant, cols, and gap', () => {
    renderWithTheme(
      <ImageList data-testid="list">
        <ImageList.Item>A</ImageList.Item>
      </ImageList>,
    );
    const el = screen.getByTestId('list');
    expect(el).toHaveAttribute('data-ov-variant', 'standard');
    expect(el).toHaveAttribute('data-ov-cols', '3');
    expect(el).toHaveAttribute('data-ov-gap', '2');
  });

  it('applies custom cols and gap', () => {
    renderWithTheme(
      <ImageList data-testid="list" cols={4} gap={3}>
        <ImageList.Item>A</ImageList.Item>
      </ImageList>,
    );
    const el = screen.getByTestId('list');
    expect(el).toHaveAttribute('data-ov-cols', '4');
    expect(el).toHaveAttribute('data-ov-gap', '3');
  });

  it('renders Item with colSpan and rowSpan data attributes', () => {
    renderWithTheme(
      <ImageList>
        <ImageList.Item data-testid="item" colSpan={2} rowSpan={3}>
          Content
        </ImageList.Item>
      </ImageList>,
    );
    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('data-ov-col-span', '2');
    expect(item).toHaveAttribute('data-ov-row-span', '3');
  });

  it('sets masonry variant', () => {
    renderWithTheme(
      <ImageList data-testid="list" variant="masonry">
        <ImageList.Item>A</ImageList.Item>
      </ImageList>,
    );
    expect(screen.getByTestId('list')).toHaveAttribute('data-ov-variant', 'masonry');
  });

  it('forwards ref on root', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <ImageList ref={ref}>
        <ImageList.Item>A</ImageList.Item>
      </ImageList>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className on root', () => {
    renderWithTheme(
      <ImageList data-testid="list" className="custom-root">
        <ImageList.Item>A</ImageList.Item>
      </ImageList>,
    );
    expect(screen.getByTestId('list').className).toContain('custom-root');
  });

  it('merges className on item', () => {
    renderWithTheme(
      <ImageList>
        <ImageList.Item data-testid="item" className="custom-item">
          A
        </ImageList.Item>
      </ImageList>,
    );
    expect(screen.getByTestId('item').className).toContain('custom-item');
  });

  it('does not render span attributes when not provided', () => {
    renderWithTheme(
      <ImageList>
        <ImageList.Item data-testid="item">A</ImageList.Item>
      </ImageList>,
    );
    const item = screen.getByTestId('item');
    expect(item).not.toHaveAttribute('data-ov-col-span');
    expect(item).not.toHaveAttribute('data-ov-row-span');
  });
});
