import { Switch as BaseSwitch } from '@base-ui/react/switch';
import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn, withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Switch.module.css';

export interface SwitchRootProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSwitch.Root>, 'color'>,
    StyledComponentProps {}

export interface SwitchThumbProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSwitch.Thumb>, 'color'>,
    StyledComponentProps {}

export type SwitchFieldProps = HTMLAttributes<HTMLLabelElement>;
export type SwitchLabelProps = HTMLAttributes<HTMLSpanElement>;
export type SwitchDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export interface SwitchProps extends Omit<SwitchRootProps, 'children'> {
  children?: ReactNode;
  description?: ReactNode;
  thumb?: ReactNode;
  thumbProps?: Omit<SwitchThumbProps, 'children'>;
  labelPosition?: 'start' | 'end';
  layout?: 'inline' | 'spread';
}

const SwitchRoot = forwardRef<ElementRef<typeof BaseSwitch.Root>, SwitchRootProps>(
  function SwitchRoot({ className, variant, color, size, ...props }, ref) {
    return (
      <BaseSwitch.Root
        ref={ref}
        className={withBaseClassName<BaseSwitch.Root.State>(styles.Root, className)}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      />
    );
  },
);

const SwitchThumb = forwardRef<ElementRef<typeof BaseSwitch.Thumb>, SwitchThumbProps>(
  function SwitchThumb({ className, variant, color, size, ...props }, ref) {
    return (
      <BaseSwitch.Thumb
        ref={ref}
        className={withBaseClassName<BaseSwitch.Thumb.State>(styles.Thumb, className)}
        {...styleDataAttributes({ variant, color, size })}
        {...props}
      />
    );
  },
);

const SwitchField = forwardRef<HTMLLabelElement, SwitchFieldProps>(function SwitchField(
  { className, ...props },
  ref,
) {
  return <label ref={ref} className={cn(styles.Field, className)} {...props} />;
});

const SwitchLabel = forwardRef<HTMLSpanElement, SwitchLabelProps>(function SwitchLabel(
  { className, ...props },
  ref,
) {
  return <span ref={ref} className={cn(styles.Label, className)} {...props} />;
});

const SwitchDescription = forwardRef<HTMLSpanElement, SwitchDescriptionProps>(
  function SwitchDescription({ className, ...props }, ref) {
    return <span ref={ref} className={cn(styles.Description, className)} {...props} />;
  },
);

const SwitchBase = forwardRef<ElementRef<typeof BaseSwitch.Root>, SwitchProps>(function SwitchBase(
  {
    children,
    description,
    className,
    thumb,
    thumbProps,
    labelPosition = 'end',
    layout = 'inline',
    variant,
    color,
    size,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const labelId = useId();
  const descriptionId = useId();
  const hasContent = Boolean(children) || Boolean(description);
  const resolvedAriaLabelledBy = ariaLabelledBy ?? (children ? labelId : undefined);
  const resolvedAriaDescribedBy = ariaDescribedBy ?? (description ? descriptionId : undefined);
  const switchControl = (
    <SwitchRoot
      ref={ref}
      className={className}
      variant={variant}
      color={color}
      size={size}
      aria-label={ariaLabel}
      aria-labelledby={resolvedAriaLabelledBy}
      aria-describedby={resolvedAriaDescribedBy}
      {...props}
    >
      {thumb ?? (
        <SwitchThumb variant={variant} color={color} size={size} {...thumbProps} />
      )}
    </SwitchRoot>
  );

  if (!hasContent) {
    return switchControl;
  }

  return (
    <SwitchField
      data-ov-label-position={labelPosition}
      data-ov-layout={layout}
      {...styleDataAttributes({ variant, color, size })}
    >
      {labelPosition === 'start' ? (
        <span className={styles.Content}>
          {children ? <SwitchLabel id={labelId}>{children}</SwitchLabel> : null}
          {description ? <SwitchDescription id={descriptionId}>{description}</SwitchDescription> : null}
        </span>
      ) : null}
      {switchControl}
      {labelPosition === 'end' ? (
        <span className={styles.Content}>
          {children ? <SwitchLabel id={labelId}>{children}</SwitchLabel> : null}
          {description ? <SwitchDescription id={descriptionId}>{description}</SwitchDescription> : null}
        </span>
      ) : null}
    </SwitchField>
  );
});

SwitchBase.displayName = 'Switch';
SwitchRoot.displayName = 'Switch.Root';
SwitchThumb.displayName = 'Switch.Thumb';
SwitchField.displayName = 'Switch.Field';
SwitchLabel.displayName = 'Switch.Label';
SwitchDescription.displayName = 'Switch.Description';

type SwitchCompound = typeof SwitchBase & {
  Root: typeof SwitchRoot;
  Thumb: typeof SwitchThumb;
  Field: typeof SwitchField;
  Label: typeof SwitchLabel;
  Description: typeof SwitchDescription;
};

export const Switch = Object.assign(SwitchBase, {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
  Field: SwitchField,
  Label: SwitchLabel,
  Description: SwitchDescription,
}) as SwitchCompound;
