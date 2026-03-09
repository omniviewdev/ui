import { forwardRef, type FieldsetHTMLAttributes, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import type { ComponentSize } from '../../system/types';
import styles from './FormField.module.css';

// ---------------------------------------------------------------------------
// FormField
// ---------------------------------------------------------------------------

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Text label rendered as a `<label>` element. */
  label: string;
  /** Helper text shown between the label and children. */
  description?: string;
  /** Error message shown below children in danger color. */
  error?: string;
  /** Renders a required asterisk after the label. */
  required?: boolean;
  /** Associates the label with a form control via `htmlFor`. */
  htmlFor: string;
  /** Controls density/font sizing. @default 'md' */
  size?: ComponentSize;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { className, label, description, error, required, htmlFor, size = 'md', children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Root, className)}
      data-ov-size={size}
      data-ov-error={error ? 'true' : undefined}
      {...props}
    >
      <label className={styles.Label} htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className={styles.Required} aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      {description ? <p className={styles.Description}>{description}</p> : null}
      <div className={styles.Control}>{children}</div>
      {error ? (
        <p className={styles.Error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

FormField.displayName = 'FormField';

// ---------------------------------------------------------------------------
// FormSection
// ---------------------------------------------------------------------------

export interface FormSectionProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Section heading rendered as a `<legend>`. */
  title: string;
  /** Optional description below the legend. */
  description?: string;
}

export const FormSection = forwardRef<HTMLFieldSetElement, FormSectionProps>(function FormSection(
  { className, title, description, children, ...props },
  ref,
) {
  return (
    <fieldset ref={ref} className={cn(styles.Section, className)} {...props}>
      <legend className={styles.SectionTitle}>{title}</legend>
      {description ? (
        <div className={styles.SectionHeader}>
          <p className={styles.SectionDescription}>{description}</p>
        </div>
      ) : null}
      <div className={styles.SectionContent}>{children}</div>
    </fieldset>
  );
});

FormSection.displayName = 'FormSection';
