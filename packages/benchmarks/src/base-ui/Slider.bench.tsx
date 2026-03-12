import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Slider } from '@omniview/base-ui';

describe('Slider', () => {
  benchRender('mount', () => (
    <Slider defaultValue={50}>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          <Slider.Thumb />
        </Slider.Track>
      </Slider.Control>
    </Slider>
  ), TIER_2_OPTIONS);

  benchRerender(
    'value change',
    { initialProps: { value: 25 }, updatedProps: { value: 75 } },
    (props) => (
      <Slider {...props}>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider>
    ),
    TIER_2_OPTIONS,
  );
});
