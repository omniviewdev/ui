import { Field as BaseField } from '@base-ui/react/field';
import { forwardRef } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './TextField.module.css';

export interface TextFieldRootProps extends BaseField.Root.Props, StyledComponentProps {}

export type TextFieldLabelProps = BaseField.Label.Props;

export type TextFieldControlProps = BaseField.Control.Props;

export type TextFieldDescriptionProps = BaseField.Description.Props;

export type TextFieldErrorProps = BaseField.Error.Props;

const TextFieldRoot = forwardRef<HTMLDivElement, TextFieldRootProps>(function TextFieldRoot(
  { className, variant, color, size, ...props },
  ref,
) {
  return (
    <BaseField.Root
      ref={ref}
      className={withBaseClassName<BaseField.Root.State>(styles.Root, className)}
      {...styleDataAttributes({ variant, color, size })}
      {...props}
    />
  );
});

const TextFieldLabel = forwardRef<HTMLLabelElement, TextFieldLabelProps>(function TextFieldLabel(
  { className, ...props },
  ref,
) {
  return (
    <BaseField.Label
      ref={ref}
      className={withBaseClassName<BaseField.Root.State>(styles.Label, className)}
      {...props}
    />
  );
});

const TextFieldControl = forwardRef<HTMLInputElement, TextFieldControlProps>(
  function TextFieldControl({ className, ...props }, ref) {
    return (
      <BaseField.Control
        ref={ref}
        className={withBaseClassName<BaseField.Root.State>(styles.Control, className)}
        {...props}
      />
    );
  },
);

const TextFieldDescription = forwardRef<HTMLDivElement, TextFieldDescriptionProps>(
  function TextFieldDescription({ className, ...props }, ref) {
    return (
      <BaseField.Description
        ref={ref}
        className={withBaseClassName<BaseField.Root.State>(styles.Description, className)}
        {...props}
      />
    );
  },
);

const TextFieldError = forwardRef<HTMLDivElement, TextFieldErrorProps>(function TextFieldError(
  { className, ...props },
  ref,
) {
  return (
    <BaseField.Error
      ref={ref}
      className={withBaseClassName<BaseField.Error.State>(styles.Error, className)}
      {...props}
    />
  );
});

type TextFieldCompound = typeof TextFieldRoot & {
  Root: typeof TextFieldRoot;
  Label: typeof TextFieldLabel;
  Control: typeof TextFieldControl;
  Description: typeof TextFieldDescription;
  Error: typeof TextFieldError;
};

export const TextField = Object.assign(TextFieldRoot, {
  Root: TextFieldRoot,
  Label: TextFieldLabel,
  Control: TextFieldControl,
  Description: TextFieldDescription,
  Error: TextFieldError,
}) as TextFieldCompound;
