import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import styles from './ImageList.module.css';

export type ImageListVariant = 'standard' | 'masonry' | 'quilted';

export interface ImageListProps extends HTMLAttributes<HTMLDivElement> {
  cols?: number;
  gap?: 0 | 1 | 2 | 3 | 4;
  variant?: ImageListVariant;
}

export interface ImageListItemProps extends HTMLAttributes<HTMLDivElement> {
  colSpan?: number;
  rowSpan?: number;
}

const ImageListRoot = forwardRef<HTMLDivElement, ImageListProps>(function ImageList(
  { className, cols = 3, gap = 2, variant = 'standard', children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-variant={variant}
      data-ov-cols={cols}
      data-ov-gap={gap}
      {...props}
    >
      {children}
    </div>
  );
});

ImageListRoot.displayName = 'ImageList';

const ImageListItem = forwardRef<HTMLDivElement, ImageListItemProps>(function ImageListItem(
  { className, colSpan, rowSpan, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Item, className)}
      {...(colSpan !== undefined ? { 'data-ov-col-span': colSpan } : undefined)}
      {...(rowSpan !== undefined ? { 'data-ov-row-span': rowSpan } : undefined)}
      {...props}
    >
      {children}
    </div>
  );
});

ImageListItem.displayName = 'ImageListItem';

type ImageListCompound = typeof ImageListRoot & { Item: typeof ImageListItem };

export const ImageList = Object.assign(ImageListRoot, {
  Item: ImageListItem,
}) as ImageListCompound;
