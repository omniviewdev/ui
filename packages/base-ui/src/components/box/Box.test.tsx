import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Box } from './Box';

describe('Box', () => {
  it('renders as div by default', () => {
    renderWithTheme(<Box data-testid="box">Content</Box>);
    const el = screen.getByTestId('box');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveTextContent('Content');
  });

  it('renders custom element via as prop', () => {
    renderWithTheme(
      <Box as="section" data-testid="box">
        Section
      </Box>,
    );
    expect(screen.getByTestId('box').tagName).toBe('SECTION');
  });

  it('renders as span', () => {
    renderWithTheme(
      <Box as="span" data-testid="box">
        Inline
      </Box>,
    );
    expect(screen.getByTestId('box').tagName).toBe('SPAN');
  });

  it('renders as list elements', () => {
    renderWithTheme(
      <Box as="ul" data-testid="list">
        <Box as="li" data-testid="item">
          Item
        </Box>
      </Box>,
    );
    expect(screen.getByTestId('list').tagName).toBe('UL');
    expect(screen.getByTestId('item').tagName).toBe('LI');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLElement>();
    renderWithTheme(<Box ref={ref}>Ref</Box>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.textContent).toBe('Ref');
  });

  it('merges className', () => {
    renderWithTheme(
      <Box className="custom" data-testid="box">
        Styled
      </Box>,
    );
    const el = screen.getByTestId('box');
    expect(el.className).toContain('custom');
  });

  it('passes children', () => {
    renderWithTheme(
      <Box data-testid="box">
        <span>Child 1</span>
        <span>Child 2</span>
      </Box>,
    );
    const el = screen.getByTestId('box');
    expect(el.children).toHaveLength(2);
  });
});
