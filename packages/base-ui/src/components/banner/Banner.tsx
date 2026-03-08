import { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { LuX } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Banner.module.css';

export interface BannerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, StyledComponentProps {}

export type BannerIconProps = HTMLAttributes<HTMLSpanElement>;
export type BannerTitleProps = HTMLAttributes<HTMLParagraphElement>;
export type BannerContentProps = HTMLAttributes<HTMLDivElement>;
export type BannerActionsProps = HTMLAttributes<HTMLDivElement>;

export interface BannerCloseProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  'aria-label'?: string;
}

const BannerRoot = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { className, variant, color, size, role = 'alert', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role={role}
      className={cn(styles.Root, className)}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    />
  );
});

const BannerIcon = forwardRef<HTMLSpanElement, BannerIconProps>(function BannerIcon(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn(styles.Icon, className)} aria-hidden="true" {...props} />;
});

const BannerTitle = forwardRef<HTMLParagraphElement, BannerTitleProps>(function BannerTitle(
  { className, ...props },
  ref,
) {
  return <p ref={ref} className={cn(styles.Title, className)} {...props} />;
});

const BannerContent = forwardRef<HTMLDivElement, BannerContentProps>(function BannerContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Content, className)} {...props} />;
});

const BannerActions = forwardRef<HTMLDivElement, BannerActionsProps>(function BannerActions(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Actions, className)} {...props} />;
});

const BannerClose = forwardRef<HTMLButtonElement, BannerCloseProps>(function BannerClose(
  { className, 'aria-label': ariaLabel = 'Close', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className={cn(styles.Close, className)}
      {...props}
    >
      <LuX aria-hidden="true" />
    </button>
  );
});

BannerRoot.displayName = 'Banner';
BannerIcon.displayName = 'Banner.Icon';
BannerTitle.displayName = 'Banner.Title';
BannerContent.displayName = 'Banner.Content';
BannerActions.displayName = 'Banner.Actions';
BannerClose.displayName = 'Banner.Close';

type BannerCompound = typeof BannerRoot & {
  Icon: typeof BannerIcon;
  Title: typeof BannerTitle;
  Content: typeof BannerContent;
  Actions: typeof BannerActions;
  Close: typeof BannerClose;
};

export const Banner = Object.assign(BannerRoot, {
  Icon: BannerIcon,
  Title: BannerTitle,
  Content: BannerContent,
  Actions: BannerActions,
  Close: BannerClose,
}) as BannerCompound;
