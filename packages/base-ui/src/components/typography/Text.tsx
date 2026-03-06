import { createElement, forwardRef, type ReactElement } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { TruncationProps, TypographyBaseProps, TypographyWeight } from './types';
import {
  truncationData,
  truncationStyle,
  typographyData,
  type PolymorphicComponentProps,
  type PolymorphicRef,
} from './utils';

type TextElement = 'span' | 'p' | 'div' | 'label';

interface TextOwnProps extends TypographyBaseProps, TruncationProps {
  weight?: TypographyWeight;
  mono?: boolean;
}

export type TextProps<C extends TextElement = TextElement> = PolymorphicComponentProps<
  C,
  TextOwnProps
>;

type TextComponent = <C extends TextElement = 'span'>(
  props: TextProps<C> & { ref?: PolymorphicRef<C> },
) => ReactElement | null;

export const Text = forwardRef(function Text(
  {
    as,
    className,
    size = DEFAULT_SIZE,
    tone = 'default',
    weight = 'regular',
    mono = false,
    truncate = false,
    style,
    ...props
  }: TextProps<TextElement>,
  ref: PolymorphicRef<TextElement>,
) {
  return createElement(as ?? 'span', {
    ref,
    className: cn(styles.Text, className),
    'data-ov-weight': weight,
    'data-ov-mono': mono ? 'true' : 'false',
    style: truncationStyle(style, truncate),
    ...typographyData({ size, tone }),
    ...truncationData(truncate),
    ...props,
  });
}) as unknown as TextComponent;

(Text as { displayName?: string }).displayName = 'Text';
