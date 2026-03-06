import { createElement, forwardRef, type ReactElement } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { BlockquoteVariant, TruncationProps, TypographyBaseProps } from './types';
import {
  truncationData,
  truncationStyle,
  typographyData,
  type PolymorphicComponentProps,
  type PolymorphicRef,
} from './utils';

type BlockquoteElement = 'blockquote' | 'div';

interface BlockquoteOwnProps extends TypographyBaseProps, TruncationProps {
  variant?: BlockquoteVariant;
}

export type BlockquoteProps<C extends BlockquoteElement = BlockquoteElement> =
  PolymorphicComponentProps<C, BlockquoteOwnProps>;

type BlockquoteComponent = <C extends BlockquoteElement = 'blockquote'>(
  props: BlockquoteProps<C> & { ref?: PolymorphicRef<C> },
) => ReactElement | null;

export const Blockquote = forwardRef(function Blockquote(
  {
    as,
    className,
    size = DEFAULT_SIZE,
    tone = 'default',
    variant = 'emphasis',
    truncate = false,
    style,
    ...props
  }: BlockquoteProps<BlockquoteElement>,
  ref: PolymorphicRef<BlockquoteElement>,
) {
  return createElement(as ?? 'blockquote', {
    ref,
    className: cn(styles.Blockquote, className),
    'data-ov-variant': variant,
    style: truncationStyle(style, truncate),
    ...typographyData({ size, tone }),
    ...truncationData(truncate),
    ...props,
  });
}) as unknown as BlockquoteComponent;

(Blockquote as { displayName?: string }).displayName = 'Blockquote';
