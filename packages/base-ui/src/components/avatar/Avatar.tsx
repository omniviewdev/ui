import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import { getAvatarInitials, getAvatarPaletteIndex } from './avatarUtils';
import styles from './Avatar.module.css';

export type AvatarShape = 'circle' | 'rounded';

type ResolvedStyleProps = Required<StyledComponentProps>;

interface AvatarContextValue extends ResolvedStyleProps {
  shape: AvatarShape;
  deterministic: boolean;
  paletteIndex?: number;
}

const AvatarStyleContext = createContext<AvatarContextValue>({
  variant: DEFAULT_VARIANT,
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
  shape: 'circle',
  deterministic: true,
  paletteIndex: undefined,
});

function useResolvedStyleProps(overrides?: StyledComponentProps): ResolvedStyleProps {
  const inherited = useContext(AvatarStyleContext);
  return {
    variant: overrides?.variant ?? inherited.variant,
    color: overrides?.color ?? inherited.color,
    size: overrides?.size ?? inherited.size,
  };
}

export interface AvatarRootProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseAvatar.Root>, 'color'>, StyledComponentProps {
  shape?: AvatarShape;
  deterministic?: boolean;
  paletteIndex?: number;
}

export interface AvatarImageProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseAvatar.Image>, 'color'>, StyledComponentProps {}

export interface AvatarFallbackProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseAvatar.Fallback>, 'color'>,
    StyledComponentProps {}

export interface AvatarProps extends AvatarRootProps {
  src?: string;
  alt?: string;
  name?: string;
  seed?: string;
  fallback?: ReactNode;
  fallbackIcon?: ReactNode;
  imageProps?: Omit<AvatarImageProps, 'src' | 'alt'>;
  fallbackProps?: Omit<AvatarFallbackProps, 'children'>;
  children?: ReactNode;
}

const AvatarRoot = forwardRef<ElementRef<typeof BaseAvatar.Root>, AvatarRootProps>(
  function AvatarRoot(
    {
      className,
      variant = DEFAULT_VARIANT,
      color = DEFAULT_COLOR,
      size = DEFAULT_SIZE,
      shape = 'circle',
      deterministic = true,
      paletteIndex,
      ...props
    },
    ref,
  ) {
    return (
      <AvatarStyleContext.Provider
        value={{ variant, color, size, shape, deterministic, paletteIndex }}
      >
        <BaseAvatar.Root
          ref={ref}
          className={withBaseClassName(styles.Root, className)}
          data-ov-avatar-root="true"
          data-ov-shape={shape}
          data-ov-deterministic={deterministic ? 'true' : 'false'}
          data-ov-palette={paletteIndex}
          {...styleDataAttributes({ variant, color, size })}
          {...props}
        />
      </AvatarStyleContext.Provider>
    );
  },
);

const AvatarImage = forwardRef<ElementRef<typeof BaseAvatar.Image>, AvatarImageProps>(
  function AvatarImage({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });

    return (
      <BaseAvatar.Image
        ref={ref}
        className={withBaseClassName(styles.Image, className)}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const AvatarFallback = forwardRef<ElementRef<typeof BaseAvatar.Fallback>, AvatarFallbackProps>(
  function AvatarFallback({ className, variant, color, size, ...props }, ref) {
    const resolved = useResolvedStyleProps({ variant, color, size });
    const inherited = useContext(AvatarStyleContext);

    return (
      <BaseAvatar.Fallback
        ref={ref}
        className={withBaseClassName(styles.Fallback, className)}
        data-ov-shape={inherited.shape}
        data-ov-deterministic={inherited.deterministic ? 'true' : 'false'}
        data-ov-palette={inherited.paletteIndex}
        {...styleDataAttributes(resolved)}
        {...props}
      />
    );
  },
);

const AvatarBase = forwardRef<ElementRef<typeof BaseAvatar.Root>, AvatarProps>(function AvatarBase(
  {
    src,
    alt,
    name,
    seed,
    fallback,
    fallbackIcon,
    imageProps,
    fallbackProps,
    children,
    shape = 'circle',
    deterministic = true,
    paletteIndex,
    ...props
  },
  ref,
) {
  const resolvedSeed = seed ?? name ?? alt ?? '';
  const resolvedPaletteIndex =
    paletteIndex ?? (deterministic ? getAvatarPaletteIndex(resolvedSeed) : undefined);
  const fallbackContent = fallback ?? fallbackIcon ?? (name ? getAvatarInitials(name) : '?');
  const resolvedAlt = alt ?? name ?? 'Avatar';

  return (
    <AvatarRoot
      ref={ref}
      shape={shape}
      deterministic={deterministic}
      paletteIndex={resolvedPaletteIndex}
      {...props}
    >
      {children ?? (
        <>
          {src ? <AvatarImage src={src} alt={resolvedAlt} {...imageProps} /> : null}
          <AvatarFallback aria-label={resolvedAlt} {...fallbackProps}>
            {fallbackContent}
          </AvatarFallback>
        </>
      )}
    </AvatarRoot>
  );
});

AvatarBase.displayName = 'Avatar';
AvatarRoot.displayName = 'Avatar.Root';
AvatarImage.displayName = 'Avatar.Image';
AvatarFallback.displayName = 'Avatar.Fallback';

type AvatarCompound = typeof AvatarBase & {
  Root: typeof AvatarRoot;
  Image: typeof AvatarImage;
  Fallback: typeof AvatarFallback;
};

export const Avatar = Object.assign(AvatarBase, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
}) as AvatarCompound;
