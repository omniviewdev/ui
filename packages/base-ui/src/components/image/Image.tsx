import {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import styles from './Image.module.css';

export type ImageObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
export type ImageBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  fallback?: ReactNode;
  objectFit?: ImageObjectFit;
  borderRadius?: ImageBorderRadius;
}

/** Attributes that belong on the <img> element, not the wrapper <div>. */
const IMG_ATTRS = new Set([
  'crossOrigin',
  'decoding',
  'fetchPriority',
  'referrerPolicy',
  'sizes',
  'srcSet',
  'useMap',
]);

function splitProps(
  props: Record<string, unknown>,
): [Record<string, unknown>, Record<string, unknown>] {
  const imgProps: Record<string, unknown> = {};
  const wrapperProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (IMG_ATTRS.has(key)) {
      imgProps[key] = value;
    } else {
      wrapperProps[key] = value;
    }
  }
  return [wrapperProps, imgProps];
}

const ImageRoot = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    className,
    src,
    alt,
    loading,
    width,
    height,
    fallback,
    objectFit = 'cover',
    borderRadius = 'none',
    onLoad,
    onError,
    style,
    ...rest
  },
  ref,
) {
  const [wrapperProps, imgProps] = splitProps(rest);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');

  useEffect(() => {
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setStatus('loaded');
      onLoad?.(e);
    },
    [onLoad],
  );

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setStatus('error');
      onError?.(e);
    },
    [onError],
  );

  return (
    <div
      className={cn(styles.Root, className)}
      data-ov-status={status}
      data-ov-object-fit={objectFit}
      data-ov-radius={borderRadius}
      style={{ width, height, ...style }}
      {...wrapperProps}
    >
      {status !== 'error' ? (
        <img
          ref={ref}
          className={styles.Img}
          src={src}
          alt={alt}
          loading={loading}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          {...imgProps}
        />
      ) : fallback ? (
        <div className={styles.Fallback}>{fallback}</div>
      ) : null}
    </div>
  );
});

ImageRoot.displayName = 'Image';

export const Image = ImageRoot;
