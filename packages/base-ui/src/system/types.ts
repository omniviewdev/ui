export type ComponentVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type ComponentColor = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
export type ComponentSize = 'sm' | 'md' | 'lg';

export interface StyledComponentProps {
  variant?: ComponentVariant;
  color?: ComponentColor;
  size?: ComponentSize;
}

export const DEFAULT_VARIANT: ComponentVariant = 'soft';
export const DEFAULT_COLOR: ComponentColor = 'neutral';
export const DEFAULT_SIZE: ComponentSize = 'md';
