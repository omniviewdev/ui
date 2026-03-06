import { Radio as BaseRadio } from '@base-ui/react/radio';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn, withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Radio.module.css';

export interface RadioRootProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseRadio.Root<string>>, 'color' | 'value'>,
    StyledComponentProps {
  value: string;
}

export interface RadioIndicatorProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseRadio.Indicator>, 'color'>,
    StyledComponentProps {}

export type RadioControlProps = HTMLAttributes<HTMLSpanElement>;
export type RadioLabelProps = HTMLAttributes<HTMLSpanElement>;
export type RadioDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export interface RadioItemProps extends Omit<RadioRootProps, 'children'> {
  children?: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
  keepIndicatorMounted?: boolean;
}

const RadioRoot = forwardRef<ElementRef<typeof BaseRadio.Root<string>>, RadioRootProps>(
  function RadioRoot({ className, variant, color, size, ...props }, ref) {
    return (
      <BaseRadio.Root
        ref={ref}
        className={withBaseClassName<BaseRadio.Root.State>(styles.Root, className)}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      />
    );
  },
);

const RadioControl = forwardRef<HTMLSpanElement, RadioControlProps>(function RadioControl(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn(styles.Control, className)} {...props} />;
});

const RadioIndicator = forwardRef<ElementRef<typeof BaseRadio.Indicator>, RadioIndicatorProps>(
  function RadioIndicator({ className, variant, color, size, ...props }, ref) {
    return (
      <BaseRadio.Indicator
        ref={ref}
        className={withBaseClassName<BaseRadio.Indicator.State>(styles.Indicator, className)}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      />
    );
  },
);

const RadioLabel = forwardRef<HTMLSpanElement, RadioLabelProps>(function RadioLabel(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn(styles.Label, className)} {...props} />;
});

const RadioDescription = forwardRef<HTMLSpanElement, RadioDescriptionProps>(function RadioDescription(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn(styles.Description, className)} {...props} />;
});

const RadioItem = forwardRef<ElementRef<typeof BaseRadio.Root<string>>, RadioItemProps>(
  function RadioItem(
    {
      className,
      children,
      description,
      indicator,
      keepIndicatorMounted = true,
      variant,
      color,
      size,
      ...props
    },
    ref,
  ) {
    const hasContent = Boolean(children) || Boolean(description);

    return (
      <RadioRoot
        ref={ref}
        className={withBaseClassName<BaseRadio.Root.State>(styles.Item, className)}
        variant={variant}
        color={color}
        size={size}
        {...props}
      >
        <RadioControl>
          <RadioIndicator keepMounted={keepIndicatorMounted}>
            {indicator ?? <span className={styles.DefaultDot} aria-hidden />}
          </RadioIndicator>
        </RadioControl>
        {hasContent ? (
          <span className={styles.Content}>
            {children ? <RadioLabel>{children}</RadioLabel> : null}
            {description ? <RadioDescription>{description}</RadioDescription> : null}
          </span>
        ) : null}
      </RadioRoot>
    );
  },
);

RadioRoot.displayName = 'Radio.Root';
RadioControl.displayName = 'Radio.Control';
RadioIndicator.displayName = 'Radio.Indicator';
RadioLabel.displayName = 'Radio.Label';
RadioDescription.displayName = 'Radio.Description';
RadioItem.displayName = 'Radio.Item';

type RadioCompound = typeof RadioItem & {
  Root: typeof RadioRoot;
  Control: typeof RadioControl;
  Indicator: typeof RadioIndicator;
  Label: typeof RadioLabel;
  Description: typeof RadioDescription;
  Item: typeof RadioItem;
};

export const Radio = Object.assign(RadioItem, {
  Root: RadioRoot,
  Control: RadioControl,
  Indicator: RadioIndicator,
  Label: RadioLabel,
  Description: RadioDescription,
  Item: RadioItem,
}) as RadioCompound;
