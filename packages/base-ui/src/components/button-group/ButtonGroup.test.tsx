import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ButtonGroup } from './ButtonGroup';

describe('ButtonGroup', () => {
  it('inherits variant/color/size to group items', () => {
    renderWithTheme(
      <ButtonGroup variant="outline" color="warning" size="sm">
        <ButtonGroup.Button>One</ButtonGroup.Button>
        <ButtonGroup.Button>Two</ButtonGroup.Button>
      </ButtonGroup>,
    );

    const first = screen.getByRole('button', { name: 'One' });
    const second = screen.getByRole('button', { name: 'Two' });

    expect(first).toHaveAttribute('data-ov-variant', 'outline');
    expect(first).toHaveAttribute('data-ov-color', 'warning');
    expect(first).toHaveAttribute('data-ov-size', 'sm');
    expect(second).toHaveAttribute('data-ov-size', 'sm');
  });

  it('supports icon buttons', () => {
    renderWithTheme(
      <ButtonGroup>
        <ButtonGroup.IconButton aria-label="More">
          <svg aria-hidden viewBox="0 0 16 16">
            <path d="M1 8h14" />
          </svg>
        </ButtonGroup.IconButton>
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', { name: 'More' })).toBeVisible();
  });
});
