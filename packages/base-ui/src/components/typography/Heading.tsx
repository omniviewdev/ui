import { createElement, forwardRef, type ReactElement } from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import styles from './Typography.module.css';
import type { HeadingLevel, TruncationProps, TypographyBaseProps } from './types';
import {
  truncationData,
  truncationStyle,
  typographyData,
  type PolymorphicComponentProps,
  type PolymorphicRef,
} from './utils';

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';

interface HeadingOwnProps extends TypographyBaseProps, TruncationProps {
  level?: HeadingLevel;
}

export type HeadingProps<C extends HeadingElement = HeadingElement> = PolymorphicComponentProps<
  C,
  HeadingOwnProps
>;

type HeadingComponent = <C extends HeadingElement = 'h2'>(
  props: HeadingProps<C> & { ref?: PolymorphicRef<C> },
) => ReactElement | null;

function isSemanticHeadingTag(tag: string): tag is 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' {
  return /^h[1-6]$/.test(tag);
}

export const Heading = forwardRef(function Heading(
  {
    as,
    className,
    level = 2,
    size = DEFAULT_SIZE,
    tone = 'default',
    truncate = false,
    style,
    role,
    ...props
  }: HeadingProps<HeadingElement>,
  ref: PolymorphicRef<HeadingElement>,
) {
  const resolvedTag = as ?? (`h${level}` as const);
  const semanticHeading = isSemanticHeadingTag(String(resolvedTag));

  return createElement(resolvedTag, {
    ref,
    className: cn(styles.Heading, className),
    'data-ov-level': String(level),
    style: truncationStyle(style, truncate),
    role: semanticHeading ? role : 'heading',
    'aria-level': semanticHeading ? undefined : level,
    ...typographyData({ size, tone }),
    ...truncationData(truncate),
    ...props,
  });
}) as unknown as HeadingComponent;

(Heading as { displayName?: string }).displayName = 'Heading';
