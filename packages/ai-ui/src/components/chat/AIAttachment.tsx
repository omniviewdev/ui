import { forwardRef, type HTMLAttributes } from 'react';
import { Card, IconButton } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuFile, LuImage, LuX } from '../../system/icons';
import styles from './AIAttachment.module.css';

export interface AIAttachmentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** File name */
  name: string;
  /** File size in bytes */
  size?: number;
  /** File type category */
  type: 'file' | 'image' | 'code' | 'document';
  /** Preview URL (for images) */
  previewUrl?: string;
  /** Remove callback */
  onRemove?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const TYPE_ICONS = {
  file: LuFile,
  image: LuImage,
  code: LuFile,
  document: LuFile,
} as const;

export const AIAttachment = forwardRef<HTMLDivElement, AIAttachmentProps>(
  function AIAttachment(
    { name, size, type, previewUrl, onRemove, className, ...rest },
    ref,
  ) {
    const Icon = TYPE_ICONS[type];

    return (
      <Card ref={ref} className={cn(styles.Root, className)} size="sm" {...rest}>
        {previewUrl && type === 'image' && (
          <img src={previewUrl} alt={name} className={styles.Preview} />
        )}
        <Card.Body>
          <div className={styles.Info}>
            <Icon size={16} />
            <span className={styles.Name}>{name}</span>
            {size != null && <span className={styles.Size}>{formatSize(size)}</span>}
            {onRemove && (
              <IconButton size="sm" variant="ghost" color="neutral" aria-label="Remove attachment" onClick={onRemove}>
                <LuX size={14} />
              </IconButton>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  },
);
