import {
  createElement,
  forwardRef,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react';
import { cn } from '../../system/classnames';
import { DEFAULT_SIZE } from '../../system/types';
import type { TruncationProps, TypographyBaseProps, TypographyTruncate } from './types';

export type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>['ref'];

export type PolymorphicComponentProps<
  C extends ElementType,
  Props = Record<string, never>,
> = Props & {
  as?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof Props | 'as' | 'color'>;

export function typographyData({
  size = DEFAULT_SIZE,
  tone = 'default',
}: TypographyBaseProps): Record<'data-ov-size' | 'data-ov-tone', string> {
  return {
    'data-ov-size': size,
    'data-ov-tone': tone,
  };
}

function normalizeLineClamp(truncate?: TypographyTruncate): number | null {
  if (!(typeof truncate === 'number' && Number.isFinite(truncate))) {
    return null;
  }

  const lines = Math.floor(truncate);
  return lines >= 2 ? lines : null;
}

export function truncationData(truncate?: TypographyTruncate): Record<'data-ov-truncate', string> {
  if (truncate === true || truncate === 1) {
    return { 'data-ov-truncate': 'single' };
  }

  if (normalizeLineClamp(truncate) !== null) {
    return { 'data-ov-truncate': 'multi' };
  }

  return { 'data-ov-truncate': 'none' };
}

export function truncationStyle(
  style: CSSProperties | undefined,
  truncate?: TypographyTruncate,
): CSSProperties | undefined {
  const lines = normalizeLineClamp(truncate);

  if (lines === null) {
    return style;
  }

  return {
    ...style,
    ['--ov-truncate-lines' as string]: lines,
  };
}

type TypographyPrimitiveSharedProps = TypographyBaseProps & TruncationProps;

type TypographyPrimitiveComponent<DefaultAs extends AllowedAs, AllowedAs extends ElementType> = <
  C extends AllowedAs = DefaultAs,
>(
  props: PolymorphicComponentProps<C, TypographyPrimitiveSharedProps> & {
    ref?: PolymorphicRef<C>;
  },
) => ReactElement | null;

interface CreateTypographyPrimitiveOptions<
  DefaultAs extends AllowedAs,
  AllowedAs extends ElementType,
> {
  displayName: string;
  className: string | undefined;
  defaultAs: DefaultAs;
  defaultTone?: TypographyBaseProps['tone'];
}

export function createTypographyPrimitive<
  DefaultAs extends AllowedAs,
  AllowedAs extends ElementType,
>({
  displayName,
  className,
  defaultAs,
  defaultTone = 'default',
}: CreateTypographyPrimitiveOptions<DefaultAs, AllowedAs>): TypographyPrimitiveComponent<
  DefaultAs,
  AllowedAs
> {
  // Intentional: forwardRef cannot express this polymorphic signature directly;
  // the cast below re-establishes the exported generic component type.
  const Primitive = forwardRef<any, any>(function TypographyPrimitive(rawProps, ref) {
    const {
      as,
      className: classNameProp,
      size = DEFAULT_SIZE,
      tone = defaultTone,
      truncate = false,
      style,
      ...props
    } = rawProps as PolymorphicComponentProps<AllowedAs, TypographyPrimitiveSharedProps>;

    return createElement(as ?? defaultAs, {
      ref,
      className: cn(className, classNameProp),
      style: truncationStyle(style, truncate),
      ...typographyData({ size, tone }),
      ...truncationData(truncate),
      ...props,
    });
  }) as unknown as TypographyPrimitiveComponent<DefaultAs, AllowedAs>;

  (Primitive as { displayName?: string }).displayName = displayName;

  return Primitive;
}
