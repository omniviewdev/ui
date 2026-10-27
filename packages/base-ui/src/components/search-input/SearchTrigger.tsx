import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { LuSearch } from 'react-icons/lu';
import { styleDataAttributes } from '../../system/styleProps';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  DEFAULT_VARIANT,
  type StyledComponentProps,
} from '../../system/types';
import inputStyles from '../input/Input.module.css';
import styles from './SearchInput.module.css';

export interface SearchTriggerProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'color' | 'children'>, StyledComponentProps {
  placeholder?: string;
  shortcut?: ReactNode;
}

/** Opens a search surface using the same shell and sizing as a text input. */
export const SearchTrigger = forwardRef<HTMLButtonElement, SearchTriggerProps>(
  function SearchTrigger(
    {
      placeholder = 'Search…',
      shortcut,
      variant = DEFAULT_VARIANT,
      color = DEFAULT_COLOR,
      size = DEFAULT_SIZE,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={disabled}
        data-disabled={disabled ? '' : undefined}
        {...styleDataAttributes({ variant, color, size })}
        className={[inputStyles.Root, inputStyles.ControlShell, styles.Trigger, className]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={inputStyles.Decorator} data-ov-side="start" aria-hidden="true">
          <LuSearch />
        </span>
        <span className={`${inputStyles.Control} ${styles.TriggerPlaceholder}`}>{placeholder}</span>
        {shortcut ? (
          <span
            className={`${inputStyles.Decorator} ${styles.TriggerShortcut}`}
            data-ov-side="end"
            aria-hidden="true"
          >
            {shortcut}
          </span>
        ) : null}
      </button>
    );
  },
);

SearchTrigger.displayName = 'SearchTrigger';
