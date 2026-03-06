import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders themed root attributes', () => {
    renderWithTheme(
      <Slider.Root
        variant="outline"
        color="success"
        size="sm"
        defaultValue={30}
        data-testid="slider-root"
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>,
    );

    const root = screen.getByTestId('slider-root');
    expect(root).toHaveAttribute('data-ov-variant', 'outline');
    expect(root).toHaveAttribute('data-ov-color', 'success');
    expect(root).toHaveAttribute('data-ov-size', 'sm');
  });

  it('supports keyboard stepping and emits onValueChange', () => {
    const onValueChange = vi.fn();

    renderWithTheme(
      <Slider.Root
        defaultValue={10}
        step={5}
        onValueChange={onValueChange}
        aria-label="Execution priority"
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>,
    );

    const sliderThumbInput = screen.getByRole('slider');

    fireEvent.focus(sliderThumbInput);
    fireEvent.keyDown(sliderThumbInput, { key: 'ArrowRight' });

    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith(15, expect.anything());
  });

  it('renders two thumbs for a range slider', () => {
    renderWithTheme(
      <Slider.Root defaultValue={[20, 70]} min={0} max={100} aria-label="Range slider">
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb index={0} />
            <Slider.Thumb index={1} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>,
    );

    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);
  });
});
