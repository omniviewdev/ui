import { isValidElement } from 'react';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type ComponentColor,
  type ComponentSize,
  type ComponentVariant,
  type StyledComponentProps,
} from './types';

function isComponentVariant(value: unknown): value is ComponentVariant {
  return value === 'solid' || value === 'soft' || value === 'outline' || value === 'ghost';
}

function isComponentColor(value: unknown): value is ComponentColor {
  return (
    value === 'neutral' ||
    value === 'brand' ||
    value === 'success' ||
    value === 'warning' ||
    value === 'danger' ||
    value === 'info' ||
    value === 'discovery' ||
    value === 'secondary'
  );
}

function isComponentSize(value: unknown): value is ComponentSize {
  return value === 'xs' || value === 'sm' || value === 'md' || value === 'lg' || value === 'xl';
}

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

/** Infer only library style values; native and generic render props may share their names. */
export function renderedStyleProps(render: unknown): StyledComponentProps | undefined {
  if (!isValidElement<{ variant?: unknown; color?: unknown; size?: unknown }>(render)) {
    return undefined;
  }

  const { variant, color, size } = render.props;
  return {
    variant: isComponentVariant(variant) ? variant : undefined,
    color: isComponentColor(color) ? color : undefined,
    size: isComponentSize(size) ? size : undefined,
  };
}
