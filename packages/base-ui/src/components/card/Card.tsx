import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps, SurfaceElevation, SurfaceType } from '../../system/types';
import styles from './Card.module.css';

/* ─── Prop types ─── */

export interface CardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, StyledComponentProps {
  as?: 'section' | 'article' | 'div';
  elevation?: SurfaceElevation;
  surface?: SurfaceType;
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type CardBodyProps = HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = HTMLAttributes<HTMLDivElement>;
export type CardActionProps = HTMLAttributes<HTMLDivElement>;
export type CardSeparatorProps = HTMLAttributes<HTMLDivElement>;
export interface CardToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the toolbar; provide via aria-label or aria-labelledby */
  'aria-label'?: string;
}
export type CardCoverProps = HTMLAttributes<HTMLDivElement>;

export interface CardEyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  mono?: boolean;
}

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

export interface CardRowProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 'sm' | 'md' | 'lg';
}

export interface CardKeyValueProps extends HTMLAttributes<HTMLDListElement> {
  label: ReactNode;
  mono?: boolean;
}

export interface CardStatProps extends HTMLAttributes<HTMLDivElement> {
  mono?: boolean;
}

export interface CardIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  status?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  pulse?: boolean;
}

export interface CardActionAreaProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

export interface CardGroupProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number | 'auto';
  gap?: 'sm' | 'md' | 'lg';
}

/* ─── Components ─── */

const CardRoot = forwardRef<HTMLElement, CardProps>(function Card(
  {
    as: Element = 'section',
    className,
    variant,
    color,
    size,
    elevation = 0,
    surface = 'default',
    ...props
  },
  ref,
) {
  return (
    <Element
      ref={ref as never}
      className={cn(styles.Root, className)}
      data-ov-elevation={elevation}
      data-ov-surface={surface}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    />
  );
});

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Header, className)} {...props} />;
});

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, ...props },
  ref,
) {
  return <h3 ref={ref} className={cn(styles.Title, className)} {...props} />;
});

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn(styles.Description, className)} {...props} />;
  },
);

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Body, className)} {...props} />;
});

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Footer, className)} {...props} />;
});

const CardAction = forwardRef<HTMLDivElement, CardActionProps>(function CardAction(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Action, className)} {...props} />;
});

const CardEyebrow = forwardRef<HTMLSpanElement, CardEyebrowProps>(function CardEyebrow(
  { className, mono, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(styles.Eyebrow, className)}
      {...(mono != null && { 'data-ov-mono': String(mono) })}
      {...props}
    />
  );
});

const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(function CardMedia(
  { className, ratio, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Media, className)}
      style={ratio != null ? { ...style, aspectRatio: ratio } : style}
      {...props}
    />
  );
});

const CardCover = forwardRef<HTMLDivElement, CardCoverProps>(function CardCover(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(styles.Cover, className)} {...props} />;
});

const CardRow = forwardRef<HTMLDivElement, CardRowProps>(function CardRow(
  { className, align, gap, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Row, className)}
      {...(align != null && { 'data-ov-align': align })}
      {...(gap != null && { 'data-ov-gap': gap })}
      {...props}
    />
  );
});

const CardSeparator = forwardRef<HTMLDivElement, CardSeparatorProps>(function CardSeparator(
  { className, ...props },
  ref,
) {
  return <div ref={ref} role="separator" className={cn(styles.Separator, className)} {...props} />;
});

const CardKeyValue = forwardRef<HTMLDListElement, CardKeyValueProps>(function CardKeyValue(
  { className, label, mono, children, ...props },
  ref,
) {
  return (
    <dl
      ref={ref}
      className={cn(styles.KeyValue, className)}
      {...(mono != null && { 'data-ov-mono': String(mono) })}
      {...props}
    >
      <dt className={styles.KeyValueLabel}>{label}</dt>
      <dd className={styles.KeyValueValue}>{children}</dd>
    </dl>
  );
});

const CardStat = forwardRef<HTMLDivElement, CardStatProps>(function CardStat(
  { className, mono, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Stat, className)}
      {...(mono != null && { 'data-ov-mono': String(mono) })}
      {...props}
    />
  );
});

const CardIndicator = forwardRef<HTMLSpanElement, CardIndicatorProps>(function CardIndicator(
  { className, status, pulse, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(styles.Indicator, className)}
      {...(status != null && { 'data-ov-status': status })}
      {...(pulse != null && { 'data-ov-pulse': String(pulse) })}
      {...props}
    />
  );
});

const CardActionArea = forwardRef<HTMLDivElement, CardActionAreaProps>(function CardActionArea(
  { className, disabled, onClick, onKeyDown, ...props },
  ref,
) {
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.currentTarget as HTMLDivElement).click();
    }
    onKeyDown?.(e);
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={cn(styles.ActionArea, className)}
      aria-disabled={disabled || undefined}
      {...(disabled != null && { 'data-ov-disabled': String(disabled) })}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : handleKeyDown}
      {...props}
    />
  );
});

const CardToolbar = forwardRef<HTMLDivElement, CardToolbarProps>(function CardToolbar(
  { className, ...props },
  ref,
) {
  return <div ref={ref} role="toolbar" className={cn(styles.Toolbar, className)} {...props} />;
});

const CardGroup = forwardRef<HTMLDivElement, CardGroupProps>(function CardGroup(
  { className, columns, gap, style, ...props },
  ref,
) {
  const columnStyle =
    columns != null && columns !== 'auto'
      ? ({ ...style, '--_ov-columns': columns } as React.CSSProperties)
      : style;

  return (
    <div
      ref={ref}
      className={cn(styles.Group, className)}
      style={columnStyle}
      {...(columns != null && { 'data-ov-columns': String(columns) })}
      {...(gap != null && { 'data-ov-gap': gap })}
      {...props}
    />
  );
});

/* ─── Display names ─── */

CardRoot.displayName = 'Card';
CardHeader.displayName = 'Card.Header';
CardTitle.displayName = 'Card.Title';
CardDescription.displayName = 'Card.Description';
CardBody.displayName = 'Card.Body';
CardFooter.displayName = 'Card.Footer';
CardAction.displayName = 'Card.Action';
CardEyebrow.displayName = 'Card.Eyebrow';
CardMedia.displayName = 'Card.Media';
CardCover.displayName = 'Card.Cover';
CardRow.displayName = 'Card.Row';
CardSeparator.displayName = 'Card.Separator';
CardKeyValue.displayName = 'Card.KeyValue';
CardStat.displayName = 'Card.Stat';
CardIndicator.displayName = 'Card.Indicator';
CardActionArea.displayName = 'Card.ActionArea';
CardToolbar.displayName = 'Card.Toolbar';
CardGroup.displayName = 'Card.Group';

/* ─── Compound export ─── */

type CardCompound = typeof CardRoot & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Action: typeof CardAction;
  Eyebrow: typeof CardEyebrow;
  Media: typeof CardMedia;
  Cover: typeof CardCover;
  Row: typeof CardRow;
  Separator: typeof CardSeparator;
  KeyValue: typeof CardKeyValue;
  Stat: typeof CardStat;
  Indicator: typeof CardIndicator;
  ActionArea: typeof CardActionArea;
  Toolbar: typeof CardToolbar;
  Group: typeof CardGroup;
};

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
  Action: CardAction,
  Eyebrow: CardEyebrow,
  Media: CardMedia,
  Cover: CardCover,
  Row: CardRow,
  Separator: CardSeparator,
  KeyValue: CardKeyValue,
  Stat: CardStat,
  Indicator: CardIndicator,
  ActionArea: CardActionArea,
  Toolbar: CardToolbar,
  Group: CardGroup,
}) as CardCompound;
