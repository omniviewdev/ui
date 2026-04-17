import { forwardRef } from 'react';
import styles from './DateField.module.css';
import { useDateField, type UseDateFieldOptions } from './useDateField';
import type { Section } from './sections';

export interface DateFieldProps {
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  locale?: string;
  hourCycle?: 12 | 24;
  showSeconds?: boolean;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  'aria-label'?: string;
  /** Placeholder shown before any editing — currently rendered per-section. */
  placeholder?: string;
  /**
   * When true, removes the input-shell styling (border, background, padding,
   * min-height, hover, focus-within ring) so the field can be embedded inside
   * an outer shell (e.g. a picker trigger) without doubling the border.
   */
  bare?: boolean;
}

/**
 * `DateField` — a sectioned, guided input for date/time entry. Each section
 * (MM, DD, YYYY, HH, mm, ss, AM/PM) is individually editable and validated.
 *
 * The component is a thin wrapper over `useDateField`; consumers who need
 * custom layouts can reach for the hook directly.
 */
export const DateField = forwardRef<HTMLDivElement, DateFieldProps>(function DateField(
  props,
  ref,
) {
  const {
    value,
    onChange,
    mode = 'date',
    locale,
    hourCycle,
    showSeconds,
    min,
    max,
    disabled,
    readOnly,
    className,
    'aria-label': ariaLabel,
    bare,
  } = props;

  const options: UseDateFieldOptions = {
    value: value ?? null,
    onChange,
    mode,
    locale,
    hourCycle,
    showSeconds,
    min,
    max,
    disabled,
    readOnly,
  };

  const { sections, rootProps, getSectionProps, registerSectionRef } = useDateField(options);

  return (
    <div
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-disabled={disabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
      data-bare={bare ? '' : undefined}
      aria-label={ariaLabel ?? defaultAriaLabel(mode)}
      {...rootProps}
    >
      {sections.map((section, idx) =>
        section.type === 'literal' ? (
          <span
            key={`${idx}-${section.value}`}
            className={styles.literal}
            {...getSectionProps(idx)}
          >
            {section.value}
          </span>
        ) : (
          <span
            key={`${idx}-${section.type}`}
            ref={registerSectionRef(idx)}
            className={styles.section}
            {...getSectionProps(idx)}
          >
            {renderSectionContent(section)}
          </span>
        ),
      )}
    </div>
  );
});

function renderSectionContent(section: Section): string {
  if (section.value !== '') return section.value;
  return section.placeholder;
}

function defaultAriaLabel(mode: 'date' | 'time' | 'datetime'): string {
  switch (mode) {
    case 'time':
      return 'Time';
    case 'datetime':
      return 'Date and time';
    default:
      return 'Date';
  }
}
