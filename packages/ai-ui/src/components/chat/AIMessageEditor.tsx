import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react';
import { Button, Spinner } from '@omniview/base-ui';
import { cn } from '../../system/classnames';
import styles from './AIMessageEditor.module.css';

export interface AIMessageEditorProps extends HTMLAttributes<HTMLDivElement> {
  /** Initial text content to edit */
  defaultValue: string;
  /** Called with the edited text when the user saves */
  onSave: (value: string) => void;
  /** Called when the user cancels editing */
  onCancel: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the save action is in progress (disables controls) */
  saving?: boolean;
  /** Auto-focus the textarea on mount (default: true) */
  autoFocus?: boolean;
}

export const AIMessageEditor = forwardRef<HTMLDivElement, AIMessageEditorProps>(
  function AIMessageEditor(
    {
      defaultValue,
      onSave,
      onCancel,
      placeholder,
      saving = false,
      autoFocus = true,
      className,
      ...rest
    },
    ref,
  ) {
    const [value, setValue] = useState(defaultValue);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (autoFocus) {
        textareaRef.current?.focus();
      }
    }, [autoFocus]);

    const saveDisabled = saving || value.trim() === '' || value === defaultValue;

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }

    const handleSave = () => onSave(value);

    return (
      <div ref={ref} className={cn(styles.Root, className)} {...rest}>
        <textarea
          ref={textareaRef}
          className={styles.Textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={saving}
          rows={3}
        />
        <div className={styles.Actions}>
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            color="brand"
            size="sm"
            onClick={handleSave}
            disabled={saveDisabled}
            startDecorator={saving ? <Spinner size="sm" /> : undefined}
          >
            Save
          </Button>
        </div>
      </div>
    );
  },
);
