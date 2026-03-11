import { forwardRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { Card, Skeleton } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuImage } from '../../system/icons';
import styles from './AIImageGeneration.module.css';

export interface AIImageGenerationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Generated image URL */
  src?: string;
  /** Alt text */
  alt: string;
  /** Whether image is still generating */
  loading?: boolean;
  /** Image prompt used */
  prompt?: string;
  /** Expected aspect ratio (width / height). Default: 1 (square). */
  aspectRatio?: number;
}

export const AIImageGeneration = forwardRef<HTMLDivElement, AIImageGenerationProps>(
  function AIImageGeneration(
    { src, alt, loading = false, prompt, aspectRatio = 1, className, ...rest },
    ref,
  ) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const showSkeleton = loading || (src != null && !imageLoaded);

    return (
      <Card ref={ref} className={cn(styles.Root, className)} size="sm" {...rest}>
        <div
          className={styles.Frame}
          style={{ '--_image-aspect-ratio': aspectRatio } as CSSProperties}
        >
          {showSkeleton && (
            <div className={styles.Placeholder}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height="100%"
                animation="wave"
              />
              <div className={styles.PlaceholderIcon}>
                <LuImage size={32} />
                {loading && <span className={styles.PlaceholderLabel}>Generating…</span>}
              </div>
            </div>
          )}
          {src != null && (
            <img
              src={src}
              alt={alt}
              className={cn(styles.Image, imageLoaded && styles.ImageLoaded)}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>
        {prompt && (
          <Card.Body>
            <p className={styles.Prompt}>{prompt}</p>
          </Card.Body>
        )}
      </Card>
    );
  },
);
