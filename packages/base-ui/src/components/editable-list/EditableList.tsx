import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { LuCheck, LuX } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import { List } from '../list';
import type { Key } from '../list';
import { useControllableState } from '../list/hooks/useControllableState';
import type {
  EditableListRootProps,
  EditableListItemProps,
  EditableListItemViewProps,
  EditableListItemEditorProps,
  EditableListItemFieldProps,
  EditableListItemSaveProps,
  EditableListItemCancelProps,
  FieldErrors,
  FieldElement,
  UseEditableFieldResult,
} from './types';
import styles from './EditableList.module.css';

// ---------------------------------------------------------------------------
// Internal contexts
// ---------------------------------------------------------------------------

interface EditableListContextValue {
  editingKey: Key | null;
  editable: boolean;
  startEditing: (key: Key) => void;
  commitEditing: () => void;
  cancelEditing: () => void;
  registerField: (name: string, el: FieldElement) => () => void;
  fieldErrors: FieldErrors;
  setFieldValue: (name: string, value: string) => void;
  clearFieldError: (name: string) => void;
}

const EditableListContext = createContext<EditableListContextValue>({
  editingKey: null,
  editable: true,
  startEditing: () => {},
  commitEditing: () => {},
  cancelEditing: () => {},
  registerField: () => () => {},
  fieldErrors: {},
  setFieldValue: () => {},
  clearFieldError: () => {},
});

const EditableItemKeyContext = createContext<Key | null>(null);

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const EditableListRoot = forwardRef<HTMLDivElement, EditableListRootProps>(
  function EditableListRoot(
    {
      className,
      editingKey: editingKeyProp,
      defaultEditingKey,
      onEditingKeyChange,
      onCommit,
      onCancel,
      validateItem,
      editable = true,
      children,
      ...listProps
    },
    ref,
  ) {
    const [editingKey, setEditingKey] = useControllableState<Key | null>(
      editingKeyProp,
      defaultEditingKey ?? null,
      onEditingKeyChange,
    );

    const fieldRefsMap = useRef(new Map<string, FieldElement>());
    const fieldValuesMap = useRef(new Map<string, string>());
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const rootWrapperRef = useRef<HTMLDivElement>(null);
    const commitInFlightRef = useRef(false);
    const editingKeyRef = useRef(editingKey);
    editingKeyRef.current = editingKey;

    const registerField = useCallback(
      (name: string, el: FieldElement) => {
        fieldRefsMap.current.set(name, el);
        return () => {
          fieldRefsMap.current.delete(name);
          fieldValuesMap.current.delete(name);
        };
      },
      [],
    );

    const setFieldValue = useCallback((name: string, value: string) => {
      fieldValuesMap.current.set(name, value);
    }, []);

    const clearFieldError = useCallback((name: string) => {
      setFieldErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }, []);

    const gatherValues = useCallback(() => {
      const values: Record<string, string> = {};
      // Collect all known field names from both maps
      const allNames = new Set([
        ...fieldValuesMap.current.keys(),
        ...fieldRefsMap.current.keys(),
      ]);
      for (const name of allNames) {
        // Prefer the synchronized value from useField().setValue / setFieldValue,
        // fall back to reading the DOM element's .value directly
        const synced = fieldValuesMap.current.get(name);
        if (synced !== undefined) {
          values[name] = synced;
        } else {
          const el = fieldRefsMap.current.get(name);
          if (el) values[name] = el.value;
        }
      }
      return values;
    }, []);

    const commitEditing = useCallback(async () => {
      if (editingKey == null) return;
      if (commitInFlightRef.current) return;
      commitInFlightRef.current = true;
      const key = editingKey;

      try {
        const values = gatherValues();

        if (validateItem) {
          const errors = await validateItem(key, values);
          // After async: bail if the edit session changed (e.g. cancelled/switched)
          if (editingKeyRef.current !== key) return;
          const hasErrors = Object.values(errors).some(Boolean);
          if (hasErrors) {
            setFieldErrors(errors);
            return;
          }
        }

        // Final check before committing
        if (editingKeyRef.current !== key) return;
        onCommit?.(key, values);
        setEditingKey(null);
        setFieldErrors({});
        fieldRefsMap.current.clear();
        fieldValuesMap.current.clear();
      } finally {
        commitInFlightRef.current = false;
      }
    }, [editingKey, gatherValues, validateItem, onCommit, setEditingKey]);

    const cancelEditing = useCallback(() => {
      if (editingKey == null) return;
      const key = editingKey;
      setEditingKey(null);
      setFieldErrors({});
      fieldRefsMap.current.clear();
      fieldValuesMap.current.clear();
      onCancel?.(key);
    }, [editingKey, setEditingKey, onCancel]);

    const startEditing = useCallback(
      (key: Key) => {
        if (!editable) return;
        if (editingKey != null && editingKey !== key) {
          // Cancel current edit before starting new one
          cancelEditing();
        }
        fieldRefsMap.current.clear();
        fieldValuesMap.current.clear();
        setFieldErrors({});
        setEditingKey(key);
      },
      [editable, editingKey, cancelEditing, setEditingKey],
    );

    // Keyboard intercept (capture phase)
    const handleKeyDownCapture = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (editingKey != null) {
          // --- Editing mode ---

          // Detect if focus is on a control that needs
          // Space, Home, End, and arrow keys to work normally.
          const active = document.activeElement as HTMLElement | null;
          const isNativeControl = (() => {
            if (!active) return false;
            if (active instanceof HTMLTextAreaElement) return true;
            if (active instanceof HTMLSelectElement) return true;
            if (active instanceof HTMLInputElement) {
              const nonText = new Set([
                'button', 'checkbox', 'radio', 'submit', 'reset', 'image',
              ]);
              return !nonText.has(active.type);
            }
            if (active.isContentEditable) return true;
            const role = active.getAttribute('role');
            if (role === 'textbox' || role === 'searchbox' || role === 'combobox' || role === 'listbox') return true;
            return false;
          })();

          switch (event.key) {
            case 'Enter':
              // Let textarea handle Enter for newlines
              if (active instanceof HTMLTextAreaElement) return;
              event.preventDefault();
              event.stopPropagation();
              commitEditing();
              return;
            case 'Escape':
              event.preventDefault();
              event.stopPropagation();
              cancelEditing();
              return;
            case 'Tab': {
              // Cycle between fields within the editor
              const fields = Array.from(fieldRefsMap.current.values());
              if (fields.length <= 1) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              // Match the focused element against registered field refs.
              // Compare directly, then check if the field element contains focus
              // (for wrapper-style FieldElements).
              const idx = fields.findIndex((f) => {
                const node = f as unknown as Node;
                if (node === active) return true;
                if (active && typeof node.contains === 'function' && node.contains(active)) return true;
                return false;
              });
              if (idx === -1) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              const nextIdx = event.shiftKey
                ? (idx - 1 + fields.length) % fields.length
                : (idx + 1) % fields.length;
              fields[nextIdx]?.focus();
              return;
            }
            case 'ArrowUp':
            case 'ArrowDown':
            case 'Home':
            case 'End':
            case ' ':
              if (isNativeControl) {
                // Let the text control handle the key, but stop propagation
                // so the list's own keydown handler doesn't interfere
                // (e.g. Space toggling selection, arrows navigating items)
                event.stopPropagation();
                return;
              }
              // Non-text control — suppress list navigation entirely
              event.preventDefault();
              event.stopPropagation();
              return;
          }
        } else {
          // --- Not editing ---
          if (event.key === 'F2' || event.key === 'Enter') {
            if (!editable) return;
            // Find the active item key from the list's active descendant
            const listbox = rootWrapperRef.current?.querySelector(
              '[role="listbox"]',
            );
            if (!listbox) return;
            const activeDescId =
              listbox.getAttribute('aria-activedescendant');
            if (!activeDescId) return;
            const activeEl = document.getElementById(activeDescId);
            if (!activeEl) return;
            // Extract itemKey from id: "{listId}-item-{key}"
            const match = activeDescId.match(/-item-(.+)$/);
            if (!match) return;
            const key = match[1] as string;
            if (!key) return;
            // Check if the item is disabled
            if (activeEl.getAttribute('data-ov-disabled') === 'true') return;
            event.preventDefault();
            event.stopPropagation();
            startEditing(key);
          }
        }
      },
      [editingKey, editable, commitEditing, cancelEditing, startEditing],
    );

    // Return focus to list root when exiting edit mode
    const prevEditingKeyRef = useRef<Key | null>(editingKey);
    useEffect(() => {
      const prev = prevEditingKeyRef.current;
      prevEditingKeyRef.current = editingKey;
      if (prev != null && editingKey == null) {
        // Editing just ended — return focus to list root
        const listbox = rootWrapperRef.current?.querySelector<HTMLElement>(
          '[role="listbox"]',
        );
        listbox?.focus();
      }
    }, [editingKey]);

    const contextValue: EditableListContextValue = {
      editingKey,
      editable,
      startEditing,
      commitEditing,
      cancelEditing,
      registerField,
      fieldErrors,
      setFieldValue,
      clearFieldError,
    };

    return (
      <EditableListContext.Provider value={contextValue}>
        <div
          ref={rootWrapperRef}
          className={cn(styles.Root, className)}
          onKeyDownCapture={handleKeyDownCapture}
        >
          <List.Root ref={ref} {...listProps}>
            {children}
          </List.Root>
        </div>
      </EditableListContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const EditableListItem = forwardRef<HTMLDivElement, EditableListItemProps>(
  function EditableListItem(
    { className, itemKey, disabled, onClick, ...props },
    ref,
  ) {
    const { editingKey, editable, startEditing } =
      useContext(EditableListContext);
    const isEditing = editingKey === itemKey;

    const handleDoubleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        // Check disabled from both the prop and data attribute on the element
        const el = event.currentTarget;
        const isDisabled =
          disabled || el.getAttribute('data-ov-disabled') === 'true';
        if (editable && !isEditing && !isDisabled) {
          startEditing(itemKey);
        }
      },
      [editable, isEditing, disabled, startEditing, itemKey],
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
      },
      [onClick],
    );

    return (
      <EditableItemKeyContext.Provider value={itemKey}>
        <List.Item
          ref={ref}
          className={cn(styles.Item, className)}
          itemKey={itemKey}
          disabled={disabled}
          data-ov-editing={isEditing ? 'true' : undefined}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          {...props}
        />
      </EditableItemKeyContext.Provider>
    );
  },
);

// ---------------------------------------------------------------------------
// ItemView
// ---------------------------------------------------------------------------

const EditableListItemView = forwardRef<HTMLDivElement, EditableListItemViewProps>(
  function EditableListItemView({ className, children, ...props }, ref) {
    const { editingKey } = useContext(EditableListContext);
    const itemKey = useContext(EditableItemKeyContext);

    if (itemKey != null && editingKey === itemKey) {
      return null;
    }

    return (
      <div ref={ref} className={cn(styles.ItemView, className)} {...props}>
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// ItemEditor
// ---------------------------------------------------------------------------

const EditableListItemEditor = forwardRef<HTMLDivElement, EditableListItemEditorProps>(
  function EditableListItemEditor({ className, children, ...props }, ref) {
    const { editingKey } = useContext(EditableListContext);
    const itemKey = useContext(EditableItemKeyContext);

    if (itemKey == null || editingKey !== itemKey) {
      return null;
    }

    return (
      <div ref={ref} className={cn(styles.ItemEditor, className)} {...props}>
        {children}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// useEditableField hook
// ---------------------------------------------------------------------------

/**
 * Hook that registers any control with the EditableList field system.
 * Works with `<input>`, `<select>`, `<textarea>`, or any custom component
 * that exposes `{ value, focus() }`.
 *
 * Usage:
 * ```tsx
 * function MySelect({ name, defaultValue }) {
 *   const { ref, error, setValue } = EditableList.useField(name, defaultValue);
 *   return (
 *     <select ref={ref} defaultValue={defaultValue} onChange={e => setValue(e.target.value)}>
 *       <option value="a">A</option>
 *       <option value="b">B</option>
 *     </select>
 *   );
 * }
 * ```
 */
function useEditableField(
  name: string,
  defaultValue = '',
): UseEditableFieldResult {
  const { registerField, setFieldValue, clearFieldError, fieldErrors } =
    useContext(EditableListContext);
  const elRef = useRef<FieldElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const refCallback = useCallback(
    (el: FieldElement | null) => {
      // Clean up previous registration
      cleanupRef.current?.();
      cleanupRef.current = null;
      elRef.current = el;

      if (el) {
        cleanupRef.current = registerField(name, el);
        // Sync initial value
        setFieldValue(name, el.value || defaultValue);
      }
    },
    [name, registerField, setFieldValue, defaultValue],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const setValue = useCallback(
    (value: string) => {
      setFieldValue(name, value);
      clearFieldError(name);
    },
    [name, setFieldValue, clearFieldError],
  );

  return {
    ref: refCallback,
    error: fieldErrors[name],
    setValue,
  };
}

// ---------------------------------------------------------------------------
// ItemField
// ---------------------------------------------------------------------------

const EditableListItemField = forwardRef<HTMLInputElement, EditableListItemFieldProps>(
  function EditableListItemField(
    {
      className,
      name,
      defaultValue = '',
      placeholder,
      autoFocus,
      onChange,
    },
    forwardedRef,
  ) {
    const { ref: fieldRef, error } = useEditableField(name, defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Bridge: pass the input element to the field registry, local ref, and forwarded ref
    const setRef = useCallback(
      (el: HTMLInputElement | null) => {
        inputRef.current = el;
        fieldRef(el);
        if (typeof forwardedRef === 'function') {
          forwardedRef(el);
        } else if (forwardedRef) {
          forwardedRef.current = el;
        }
      },
      [fieldRef, forwardedRef],
    );

    // Set initial value and auto-focus
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;
      input.value = defaultValue;
      if (autoFocus) {
        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      }
    }, [defaultValue, autoFocus]);

    const { clearFieldError, setFieldValue } = useContext(EditableListContext);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(name, event.target.value);
        clearFieldError(name);
        onChange?.(event);
      },
      [name, setFieldValue, clearFieldError, onChange],
    );

    return (
      <input
        ref={setRef}
        className={cn(styles.ItemField, className)}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        data-ov-invalid={error ? '' : undefined}
        aria-invalid={error ? 'true' : undefined}
        onChange={handleChange}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// ItemSave
// ---------------------------------------------------------------------------

const EditableListItemSave = forwardRef<HTMLButtonElement, EditableListItemSaveProps>(
  function EditableListItemSave(
    { className, children, onClick, ...props },
    ref,
  ) {
    const { commitEditing } = useContext(EditableListContext);

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        commitEditing();
        onClick?.(event);
      },
      [commitEditing, onClick],
    );

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.ActionButton, className)}
        onClick={handleClick}
        aria-label="Save"
        {...props}
      >
        {children ?? <LuCheck />}
      </button>
    );
  },
);

// ---------------------------------------------------------------------------
// ItemCancel
// ---------------------------------------------------------------------------

const EditableListItemCancel = forwardRef<HTMLButtonElement, EditableListItemCancelProps>(
  function EditableListItemCancel(
    { className, children, onClick, ...props },
    ref,
  ) {
    const { cancelEditing } = useContext(EditableListContext);

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        cancelEditing();
        onClick?.(event);
      },
      [cancelEditing, onClick],
    );

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.ActionButton, className)}
        onClick={handleClick}
        aria-label="Cancel"
        {...props}
      >
        {children ?? <LuX />}
      </button>
    );
  },
);

// ---------------------------------------------------------------------------
// Display names
// ---------------------------------------------------------------------------

EditableListRoot.displayName = 'EditableList';
EditableListItem.displayName = 'EditableList.Item';
EditableListItemView.displayName = 'EditableList.ItemView';
EditableListItemEditor.displayName = 'EditableList.ItemEditor';
EditableListItemField.displayName = 'EditableList.ItemField';
EditableListItemSave.displayName = 'EditableList.ItemSave';
EditableListItemCancel.displayName = 'EditableList.ItemCancel';

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type EditableListCompound = typeof EditableListRoot & {
  Root: typeof EditableListRoot;
  Viewport: typeof List.Viewport;
  Item: typeof EditableListItem;
  ItemView: typeof EditableListItemView;
  ItemEditor: typeof EditableListItemEditor;
  ItemField: typeof EditableListItemField;
  ItemSave: typeof EditableListItemSave;
  ItemCancel: typeof EditableListItemCancel;
  useField: typeof useEditableField;
  ItemIcon: typeof List.ItemIcon;
  ItemLabel: typeof List.ItemLabel;
  ItemDescription: typeof List.ItemDescription;
  ItemMeta: typeof List.ItemMeta;
  ItemActions: typeof List.ItemActions;
  Group: typeof List.Group;
  GroupHeader: typeof List.GroupHeader;
  Separator: typeof List.Separator;
  Empty: typeof List.Empty;
  Loading: typeof List.Loading;
};

export const EditableList = Object.assign(EditableListRoot, {
  Root: EditableListRoot,
  Viewport: List.Viewport,
  Item: EditableListItem,
  ItemView: EditableListItemView,
  ItemEditor: EditableListItemEditor,
  ItemField: EditableListItemField,
  ItemSave: EditableListItemSave,
  ItemCancel: EditableListItemCancel,
  useField: useEditableField,
  ItemIcon: List.ItemIcon,
  ItemLabel: List.ItemLabel,
  ItemDescription: List.ItemDescription,
  ItemMeta: List.ItemMeta,
  ItemActions: List.ItemActions,
  Group: List.Group,
  GroupHeader: List.GroupHeader,
  Separator: List.Separator,
  Empty: List.Empty,
  Loading: List.Loading,
}) as EditableListCompound;
