import type { ComponentSize } from '../../system/types';

export type TypographyTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger';

export type TypographyWeight = 'regular' | 'medium' | 'semibold';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type BlockquoteVariant = 'emphasis' | 'plain';
export type TypographyTruncate = boolean | number;

export interface TypographyBaseProps {
  size?: ComponentSize;
  tone?: TypographyTone;
}

export interface TruncationProps {
  truncate?: TypographyTruncate;
}
