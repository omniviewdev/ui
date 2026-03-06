import { DEFAULT_COLOR, DEFAULT_SIZE, DEFAULT_VARIANT, type StyledComponentProps } from './types';

export function styleDataAttributes({
  variant = DEFAULT_VARIANT,
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}: StyledComponentProps): Record<'data-ov-variant' | 'data-ov-color' | 'data-ov-size', string> {
  return {
    'data-ov-variant': variant,
    'data-ov-color': color,
    'data-ov-size': size,
  };
}
