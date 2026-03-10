import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Banner, Button } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import { LuTriangleAlert, LuShieldCheck } from '../../system/icons';
import styles from './AIActionConfirmation.module.css';

export interface AIActionConfirmationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Action title */
  title: string;
  /** Description of the action */
  description: string;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Optional resource identifier (e.g. "production/web-deploy") */
  resource?: string;
  /** Optional custom icon override */
  icon?: ReactNode;
  /** Confirm button label. Default: "Apply" (or "Confirm" for destructive). */
  confirmLabel?: string;
  /** Cancel button label. Default: "Cancel". */
  cancelLabel?: string;
  /** Confirm callback */
  onConfirm: () => void;
  /** Cancel callback */
  onCancel: () => void;
}

export const AIActionConfirmation = forwardRef<HTMLDivElement, AIActionConfirmationProps>(
  function AIActionConfirmation(
    {
      title,
      description,
      destructive = false,
      resource,
      icon,
      confirmLabel,
      cancelLabel = 'Cancel',
      onConfirm,
      onCancel,
      className,
      ...rest
    },
    ref,
  ) {
    const defaultIcon = destructive
      ? <LuTriangleAlert size={16} />
      : <LuShieldCheck size={16} />;

    const defaultConfirmLabel = destructive ? 'Confirm' : 'Apply';

    return (
      <Banner
        ref={ref}
        color={destructive ? 'danger' : 'brand'}
        variant="outline"
        size="sm"
        className={cn(styles.Root, className)}
        role="alertdialog"
        aria-label={title}
        {...rest}
      >
        <Banner.Icon>{icon ?? defaultIcon}</Banner.Icon>
        <Banner.Content>
          <Banner.Title>{title}</Banner.Title>
          <p className={styles.Description}>{description}</p>
          {resource && (
            <code className={styles.Resource}>{resource}</code>
          )}
        </Banner.Content>
        <Banner.Actions>
          <Button size="sm" variant="ghost" color="neutral" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant="solid"
            color={destructive ? 'danger' : 'brand'}
            onClick={onConfirm}
          >
            {confirmLabel ?? defaultConfirmLabel}
          </Button>
        </Banner.Actions>
      </Banner>
    );
  },
);
