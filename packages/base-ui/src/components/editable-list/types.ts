import type { ChangeEventHandler, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { ListRootProps, ListItemProps, Key } from '../list';

/** Per-field error message keyed by field name */
export type FieldErrors = Record<string, string | undefined>;

/** Any element that has a string `.value` and can receive focus. */
export interface FieldElement {
  value: string;
  focus: () => void;
  select?: () => void;
}

/** Return value of the `useEditableField` hook. */
export interface UseEditableFieldResult {
  /** Attach to your control's `ref` to register it with the field system. */
  ref: RefCallback<FieldElement>;
  /** Current error message for this field (undefined = no error). */
  error: string | undefined;
  /** Call when the control's value changes to keep the field system in sync. */
  setValue: (value: string) => void;
}

/** Validation function. Return a FieldErrors map (empty or all-undefined = valid). */
export type ValidateItem = (
  key: Key,
  values: Record<string, string>,
) => FieldErrors | Promise<FieldErrors>;

export interface EditableListRootProps extends ListRootProps {
  /** Currently editing item key (controlled) */
  editingKey?: Key | null;
  /** Initial editing key (uncontrolled) */
  defaultEditingKey?: Key | null;
  /** Callback when editing key changes */
  onEditingKeyChange?: (key: Key | null) => void;
  /** Called when user commits an edit (Enter or Save button) */
  onCommit?: (key: Key, values: Record<string, string>) => void;
  /** Called when user cancels editing (Escape or Cancel button) */
  onCancel?: (key: Key) => void;
  /** Validation function, called before onCommit */
  validateItem?: ValidateItem;
  /** Whether editing is allowed (global toggle for read-only mode) */
  editable?: boolean;
}

export type EditableListItemProps = ListItemProps;

export interface EditableListItemViewProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface EditableListItemEditorProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface EditableListItemFieldProps {
  /** Field name, used as key in the values map passed to onCommit */
  name: string;
  /** Default value when entering edit mode */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether this field should auto-focus when edit mode starts */
  autoFocus?: boolean;
  /** Change handler */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /** Additional class name */
  className?: string;
}

export interface EditableListItemSaveProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export interface EditableListItemCancelProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}
