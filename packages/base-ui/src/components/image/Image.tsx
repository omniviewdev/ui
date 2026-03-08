import { forwardRef, useState, useCallback, type ImgHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import styles from './Image.module.css';

export type ImageObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
export type ImageBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  fallback?: ReactNode;
  objectFit?: ImageObjectFit;
  borderRadius?: ImageBorderRadius;
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
    ...props
  },
  ref,
) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');

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
      {...props}
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
        />
      ) : fallback ? (
        <div className={styles.Fallback}>{fallback}</div>
      ) : null}
    </div>
  );
});

ImageRoot.displayName = 'Image';

export const Image = ImageRoot;
