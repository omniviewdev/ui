import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
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
import styles from './Checkbox.module.css';

export interface CheckboxRootProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseCheckbox.Root>, 'color'>, StyledComponentProps {}

export interface CheckboxIndicatorProps
  extends
    Omit<ComponentPropsWithoutRef<typeof BaseCheckbox.Indicator>, 'color'>,
    StyledComponentProps {}

export type CheckboxControlProps = HTMLAttributes<HTMLSpanElement>;
export type CheckboxLabelProps = HTMLAttributes<HTMLSpanElement>;
export type CheckboxDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export interface CheckboxItemProps extends Omit<CheckboxRootProps, 'children'> {
  children?: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
  keepIndicatorMounted?: boolean;
  labelPosition?: 'start' | 'end';
  layout?: 'inline' | 'spread';
}

const CheckboxRoot = forwardRef<ElementRef<typeof BaseCheckbox.Root>, CheckboxRootProps>(
  function CheckboxRoot({ className, variant, color, size, ...props }, ref) {
    return (
      <BaseCheckbox.Root
        ref={ref}
        className={withBaseClassName<BaseCheckbox.Root.State>(styles.Root, className)}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      />
    );
  },
);

const CheckboxControl = forwardRef<HTMLSpanElement, CheckboxControlProps>(function CheckboxControl(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn(styles.Control, className)} {...props} />;
});

const CheckboxIndicator = forwardRef<
  ElementRef<typeof BaseCheckbox.Indicator>,
  CheckboxIndicatorProps
>(function CheckboxIndicator({ className, variant, color, size, ...props }, ref) {
  return (
    <BaseCheckbox.Indicator
      ref={ref}
      className={withBaseClassName<BaseCheckbox.Indicator.State>(styles.Indicator, className)}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    />
  );
});

const CheckboxLabel = forwardRef<HTMLSpanElement, CheckboxLabelProps>(function CheckboxLabel(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn(styles.Label, className)} {...props} />;
});

const CheckboxDescription = forwardRef<HTMLSpanElement, CheckboxDescriptionProps>(
  function CheckboxDescription({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.Description, className)} {...props} />;
  },
);

const CheckboxItem = forwardRef<ElementRef<typeof BaseCheckbox.Root>, CheckboxItemProps>(
  function CheckboxItem(
    {
      className,
      children,
      description,
      indicator,
      keepIndicatorMounted = true,
      labelPosition = 'end',
      layout = 'inline',
      variant,
      color,
      size,
      ...props
    },
    ref,
  ) {
    const hasContent = Boolean(children) || Boolean(description);
    const useFlattened = indicator === undefined && keepIndicatorMounted;

    return (
      <CheckboxRoot
        ref={ref}
        className={withBaseClassName<BaseCheckbox.Root.State>(styles.Item, className)}
        variant={variant}
        color={color}
        size={size}
        data-ov-label-position={labelPosition}
        data-ov-layout={layout}
        {...props}
      >
        {useFlattened ? (
          <BaseCheckbox.Indicator
            keepMounted
            className={styles.ControlIndicator}
          />
        ) : (
          <CheckboxControl>
            <CheckboxIndicator keepMounted={keepIndicatorMounted}>
              {indicator}
            </CheckboxIndicator>
          </CheckboxControl>
        )}
        {hasContent ? (
          <span className={styles.Content}>
            {children ? <CheckboxLabel>{children}</CheckboxLabel> : null}
            {description ? <CheckboxDescription>{description}</CheckboxDescription> : null}
          </span>
        ) : null}
      </CheckboxRoot>
    );
  },
);

CheckboxRoot.displayName = 'Checkbox.Root';
CheckboxControl.displayName = 'Checkbox.Control';
CheckboxIndicator.displayName = 'Checkbox.Indicator';
CheckboxLabel.displayName = 'Checkbox.Label';
CheckboxDescription.displayName = 'Checkbox.Description';
CheckboxItem.displayName = 'Checkbox.Item';

type CheckboxCompound = typeof CheckboxItem & {
  Root: typeof CheckboxRoot;
  Control: typeof CheckboxControl;
  Indicator: typeof CheckboxIndicator;
  Label: typeof CheckboxLabel;
  Description: typeof CheckboxDescription;
  Item: typeof CheckboxItem;
};

export const Checkbox = Object.assign(CheckboxItem, {
  Root: CheckboxRoot,
  Control: CheckboxControl,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
  Description: CheckboxDescription,
  Item: CheckboxItem,
}) as CheckboxCompound;
