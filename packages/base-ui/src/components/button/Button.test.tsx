import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Button } from './Button';

describe('Button', () => {
  it('renders with style data attributes', () => {
    renderWithTheme(
      <Button variant="outline" color="warning" size="lg">
        Start
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Start' });
    expect(button).toHaveAttribute('data-ov-variant', 'outline');
    expect(button).toHaveAttribute('data-ov-color', 'warning');
    expect(button).toHaveAttribute('data-ov-size', 'lg');
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    renderWithTheme(<Button onClick={onClick}>Run</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders decorator slots', () => {
    renderWithTheme(
      <Button startDecorator={<span>+</span>} endDecorator="⌘R">
        Run
      </Button>,
    );

    const button = screen.getByRole('button', { name: /Run/ });
    expect(button.querySelector('[data-ov-slot="start-decorator"]')).toBeInTheDocument();
    expect(button.querySelector('[data-ov-slot="end-decorator"]')).toBeInTheDocument();
  });

  it('renders with xs size', () => {
    renderWithTheme(<Button size="xs">Tiny</Button>);
    const button = screen.getByRole('button', { name: 'Tiny' });
    expect(button).toHaveAttribute('data-ov-size', 'xs');
  });

  it('renders with xl size', () => {
    renderWithTheme(<Button size="xl">Hero</Button>);
    const button = screen.getByRole('button', { name: 'Hero' });
    expect(button).toHaveAttribute('data-ov-size', 'xl');
  });

  it('renders with discovery color', () => {
    renderWithTheme(<Button color="discovery">New</Button>);
    const button = screen.getByRole('button', { name: 'New' });
    expect(button).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('renders with secondary color', () => {
    renderWithTheme(<Button color="secondary">Meta</Button>);
    const button = screen.getByRole('button', { name: 'Meta' });
    expect(button).toHaveAttribute('data-ov-color', 'secondary');
  });
});
