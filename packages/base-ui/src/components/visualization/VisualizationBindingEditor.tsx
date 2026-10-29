import { useId, type HTMLAttributes } from 'react';
import { Select } from '../select/Select';
import { Button } from '../button/Button';
import { FormField } from '../form-field/FormField';
import { cn } from '../../system/classnames';
import styles from './Visualization.module.css';

export interface VisualizationBindingSlot {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}
export interface VisualizationFieldOption {
  id: string;
  label: string;
  type: string;
  description?: string;
  disabledReason?: string;
}
export type VisualizationBindings = Readonly<Record<string, string | undefined>>;
export interface VisualizationBindingDiagnostic {
  slotId?: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}
export interface VisualizationOption {
  id: string;
  label: string;
  description?: string;
  disabledReason?: string;
}
export interface VisualizationBindingEditorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  slots: readonly VisualizationBindingSlot[];
  /** Host-projected choices. IDs are opaque: this component never resolves paths or compatibility. */
  fields: readonly VisualizationFieldOption[];
  value: VisualizationBindings;
  onChange: (bindings: VisualizationBindings) => void;
  diagnostics?: readonly VisualizationBindingDiagnostic[];
  disabled?: boolean;
  visualizationId?: string;
  visualizations?: readonly VisualizationOption[];
  onVisualizationChange?: (id: string) => void;
}

export function VisualizationBindingEditor({
  slots,
  fields,
  value,
  onChange,
  diagnostics = [],
  disabled,
  visualizationId,
  visualizations,
  onVisualizationChange,
  children,
  className,
  ...props
}: VisualizationBindingEditorProps) {
  const prefix = useId();
  return (
    <div {...props} className={cn(styles.Editor, className)}>
      {visualizations && (
        <FormField label="Visualization" htmlFor={`${prefix}-visualization`}>
          <Select.Root
            value={visualizationId ?? null}
            onValueChange={(id) => {
              if (id != null) onVisualizationChange?.(id);
            }}
            disabled={disabled || !onVisualizationChange}
          >
            <Select.Trigger id={`${prefix}-visualization`} aria-label="Visualization">
              <Select.Value placeholder="Choose visualization">
                {visualizations.find((option) => option.id === visualizationId)?.label ??
                  visualizationId}
              </Select.Value>
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    {visualizationId &&
                      !visualizations.some((option) => option.id === visualizationId) && (
                        <Select.Item value={visualizationId} disabled>
                          Unavailable: {visualizationId}
                        </Select.Item>
                      )}
                    {visualizations.map((option) => (
                      <Select.Item
                        key={option.id}
                        value={option.id}
                        disabled={!!option.disabledReason}
                        title={option.disabledReason ?? option.description}
                      >
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </FormField>
      )}
      {slots.map((slot, index) => {
        const selectedId = value[slot.id];
        const selected = fields.find((field) => field.id === selectedId);
        const issues = diagnostics.filter((diagnostic) => diagnostic.slotId === slot.id);
        const id = `${prefix}-slot-${index}`;
        return (
          <FormField
            key={slot.id}
            label={slot.label}
            description={slot.description}
            required={slot.required}
            htmlFor={id}
          >
            <div className={styles.BindingControl}>
              <Select.Root
                value={selectedId ?? null}
                disabled={disabled}
                onValueChange={(fieldId, details) => {
                  // Clearing belongs to the explicit Clear control, not a select transition.
                  if (fieldId == null) {
                    details.cancel();
                    return;
                  }
                  onChange({ ...value, [slot.id]: fieldId });
                }}
              >
                <Select.Trigger
                  id={id}
                  aria-label={slot.label}
                  aria-required={slot.required}
                  aria-invalid={issues.some((issue) => issue.severity === 'error') || undefined}
                  aria-describedby={issues.length ? `${id}-diagnostics` : undefined}
                >
                  <Select.Value placeholder="Choose field">
                    {selected?.label ??
                      (selectedId == null ? undefined : `Unavailable: ${selectedId}`)}
                  </Select.Value>
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner>
                    <Select.Popup>
                      <Select.List>
                        {selectedId != null && !selected && (
                          <Select.Item value={selectedId} disabled>
                            Unavailable: {selectedId}
                          </Select.Item>
                        )}
                        {fields.map((field) => (
                          <Select.Item
                            key={field.id}
                            value={field.id}
                            disabled={!!field.disabledReason}
                            title={field.disabledReason ?? field.description}
                          >
                            {field.label}
                            <span className={styles.Type}>{field.type}</span>
                            {field.disabledReason && (
                              <span className={styles.Muted}>{field.disabledReason}</span>
                            )}
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
              {!slot.required && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled || selectedId == null}
                  aria-label={`Clear ${slot.label}`}
                  onClick={() => onChange({ ...value, [slot.id]: undefined })}
                >
                  Clear
                </Button>
              )}
            </div>
            {issues.length > 0 && (
              <ul id={`${id}-diagnostics`} className={styles.Diagnostics}>
                {issues.map((issue, issueIndex) => (
                  <li
                    key={issueIndex}
                    role={issue.severity === 'error' ? 'alert' : undefined}
                    data-ov-severity={issue.severity}
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </FormField>
        );
      })}
      {diagnostics
        .filter((diagnostic) => !diagnostic.slotId)
        .map((diagnostic, index) => (
          <p key={index} role={diagnostic.severity === 'error' ? 'alert' : 'status'}>
            {diagnostic.message}
          </p>
        ))}
      {children}
    </div>
  );
}
