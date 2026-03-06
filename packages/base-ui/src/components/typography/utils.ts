import type { CSSProperties } from 'react';
import { DEFAULT_SIZE } from '../../system/types';
import type { TypographyBaseProps, TypographyTruncate } from './types';

export function typographyData({
  size = DEFAULT_SIZE,
  tone = 'default',
}: TypographyBaseProps): Record<'data-ov-size' | 'data-ov-tone', string> {
  return {
    'data-ov-size': size,
    'data-ov-tone': tone,
  };
}

export function truncationData(truncate?: TypographyTruncate): Record<'data-ov-truncate', string> {
  if (truncate === true || truncate === 1) {
    return { 'data-ov-truncate': 'single' };
  }

  if (typeof truncate === 'number' && Number.isFinite(truncate) && truncate > 1) {
    return { 'data-ov-truncate': 'multi' };
  }

  return { 'data-ov-truncate': 'none' };
}

export function truncationStyle(
  style: CSSProperties | undefined,
  truncate?: TypographyTruncate,
): CSSProperties | undefined {
  if (!(typeof truncate === 'number' && Number.isFinite(truncate) && truncate > 1)) {
    return style;
  }

  return {
    ...style,
    ['--ov-truncate-lines' as string]: Math.floor(truncate),
  };
}
