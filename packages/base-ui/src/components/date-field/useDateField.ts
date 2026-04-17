import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
  type FocusEvent,
} from 'react';
import {
  adjustSectionValue,
  applyDigitToSection,
  applyPaste,
  buildSections,
  clampDayToMonth,
  getNextEditableIndex,
  getPreviousEditableIndex,
  setSectionValue,
  validateSections,
  type Section,
} from './sections';

export interface UseDateFieldOptions {
  value: Date | null;
  onChange?: (value: Date | null) => void;
  mode: 'date' | 'time' | 'datetime';
  locale?: string;
  hourCycle?: 12 | 24;
  showSeconds?: boolean;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface SectionDomProps {
  /** Tag whether this section is currently focused. */
  'data-focused': '' | undefined;
  /** True when the value is empty (placeholder shown). */
  'data-placeholder': '' | undefined;
  /** True when this is a literal (separator) span — not editable. */
  'data-literal': '' | undefined;
  /** 0-based section index, for testing + delegation. */
  'data-section-index': number;
  /** Section type, for testing + delegation. */
  'data-section-type': Section['type'];
  role?: string;
  'aria-label'?: string;
  'aria-readonly'?: boolean;
  'aria-hidden'?: boolean;
  contentEditable?: 'true' | 'false' | 'plaintext-only';
  suppressContentEditableWarning?: boolean;
  tabIndex?: number;
  spellCheck?: boolean;
  autoCorrect?: string;
  inputMode?: 'numeric' | 'text' | 'none';
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onFocus?: (e: FocusEvent<HTMLElement>) => void;
  onBlur?: (e: FocusEvent<HTMLElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  onBeforeInput?: (e: React.SyntheticEvent<HTMLElement>) => void;
}

export interface UseDateFieldReturn {
  /** Current sections (derived from options + user edits). */
  sections: Section[];
  /** 0-based index of the currently focused section, or null. */
  focusedIndex: number | null;
  /** Whether the current section state represents a complete valid date. */
  isValid: boolean;
  /** Spread these onto the root element. */
  rootProps: {
    role: 'group';
    'aria-disabled': boolean | undefined;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
    onPaste: (e: ClipboardEvent<HTMLElement>) => void;
    onBlur: (e: FocusEvent<HTMLElement>) => void;
  };
  /** Returns per-section DOM props for the editable section span. */
  getSectionProps: (index: number) => SectionDomProps;
  /** Register a ref for a section's DOM element (callback ref). */
  registerSectionRef: (index: number) => (el: HTMLElement | null) => void;
  /** Programmatically focus a section by index. */
  focusSection: (index: number) => void;
}

/**
 * `useDateField` is the headless hook driving the sectioned input primitive.
 * It maintains section state derived from (locale, mode, value), handles
 * keyboard + paste, and calls `onChange` with a parsed Date when the sections
 * represent a complete valid datetime.
 */
export function useDateField(options: UseDateFieldOptions): UseDateFieldReturn {
  const {
    value,
    onChange,
    mode,
    locale,
    hourCycle,
    showSeconds,
    disabled,
    readOnly,
  } = options;

  // Build the initial section template (types + order + min/max) without value.
  const template = useMemo(
    () => buildSections({ mode, locale, hourCycle, showSeconds }),
    [mode, locale, hourCycle, showSeconds],
  );

  // State: current sections. Initialized from template + value.
  const [sections, setSections] = useState<Section[]>(() =>
    buildSections({ mode, locale, hourCycle, showSeconds, value }),
  );

  // State: focused section index. null when nothing focused.
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Track the last "external" value we synced from, to avoid clobbering local edits.
  const lastSyncedValue = useRef<Date | null>(value);
  const lastTemplateKey = useRef<string>(JSON.stringify(template.map((s) => s.type)));

  const currentTemplateKey = useMemo(
    () => JSON.stringify(template.map((s) => s.type)),
    [template],
  );

  // When the template changes (mode/locale/hourCycle/showSeconds), rebuild from value.
  useEffect(() => {
    if (lastTemplateKey.current !== currentTemplateKey) {
      setSections(buildSections({ mode, locale, hourCycle, showSeconds, value }));
      lastTemplateKey.current = currentTemplateKey;
      lastSyncedValue.current = value;
    }
  }, [currentTemplateKey, mode, locale, hourCycle, showSeconds, value]);

  // When the external value changes (and isn't the same as last sync), update sections.
  useEffect(() => {
    const prev = lastSyncedValue.current;
    const changed =
      (prev === null) !== (value === null) ||
      (prev !== null && value !== null && prev.getTime() !== value.getTime());
    if (changed) {
      setSections(buildSections({ mode, locale, hourCycle, showSeconds, value }));
      lastSyncedValue.current = value;
    }
  }, [value, mode, locale, hourCycle, showSeconds]);

  // Validation snapshot for current sections.
  const validation = useMemo(() => validateSections(sections), [sections]);

  // Fire onChange when the parsed Date changes and differs from the last synced.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!validation.valid || validation.date === null) return;
    const prev = lastSyncedValue.current;
    const next = validation.date;
    const changed =
      prev === null || prev.getTime() !== next.getTime();
    if (changed) {
      lastSyncedValue.current = next;
      onChangeRef.current?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.valid, validation.date?.getTime()]);

  // Refs map for section DOM elements.
  const sectionRefs = useRef<Map<number, HTMLElement | null>>(new Map());

  const registerSectionRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (el === null) {
        sectionRefs.current.delete(index);
      } else {
        sectionRefs.current.set(index, el);
      }
    },
    [],
  );

  const focusSection = useCallback((index: number) => {
    const el = sectionRefs.current.get(index);
    if (!el) {
      // Still update state so render can focus next tick.
      setFocusedIndex(index);
      return;
    }
    el.focus();
    setFocusedIndex(index);
    // Select all content for fast replacement
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch {
      /* ignore selection errors in jsdom */
    }
  }, []);

  const focusNext = useCallback(
    (from: number): boolean => {
      const nextIdx = getNextEditableIndex(sections, from);
      if (nextIdx === null) return false;
      focusSection(nextIdx);
      return true;
    },
    [sections, focusSection],
  );

  const focusPrevious = useCallback(
    (from: number): boolean => {
      const prevIdx = getPreviousEditableIndex(sections, from);
      if (prevIdx === null) return false;
      focusSection(prevIdx);
      return true;
    },
    [sections, focusSection],
  );

  const handleRootKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (focusedIndex === null) return;

      const section = sections[focusedIndex];
      if (!section || section.type === 'literal') return;

      // Tab navigation — allow native Tab to leave the component when at boundaries.
      if (e.key === 'Tab') {
        const moved = e.shiftKey
          ? focusPrevious(focusedIndex)
          : focusNext(focusedIndex);
        if (moved) {
          e.preventDefault();
        }
        return;
      }

      // Arrow keys: increment/decrement focused section
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (readOnly) return;
        const delta = e.key === 'ArrowUp' ? 1 : -1;
        const newValue = adjustSectionValue(section, delta);
        setSections((prev) => {
          const updated = setSectionValue(prev, focusedIndex, newValue);
          // Clamp day after month/year changes
          if (section.type === 'month' || section.type === 'year') {
            return clampDayToMonth(updated);
          }
          return updated;
        });
        return;
      }

      // ArrowLeft/ArrowRight move between sections (like MUI)
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        focusPrevious(focusedIndex);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusNext(focusedIndex);
        return;
      }

      // Digit input
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        if (readOnly) return;
        if (section.type === 'meridiem') return;

        const { value: newVal, shouldAdvance } = applyDigitToSection(section, e.key);
        setSections((prev) => {
          const updated = setSectionValue(prev, focusedIndex, newVal);
          if (section.type === 'month' || section.type === 'year') {
            return clampDayToMonth(updated);
          }
          return updated;
        });
        if (shouldAdvance) {
          // Defer to next tick so the state update is flushed.
          queueMicrotask(() => focusNext(focusedIndex));
        }
        return;
      }

      // Letters for meridiem (A/P)
      if (section.type === 'meridiem' && /^[apAP]$/.test(e.key)) {
        e.preventDefault();
        if (readOnly) return;
        const letter = e.key.toUpperCase() === 'A' ? 'AM' : 'PM';
        setSections((prev) => setSectionValue(prev, focusedIndex, letter));
        queueMicrotask(() => focusNext(focusedIndex));
        return;
      }

      // Backspace — clear section, then move to previous if already empty.
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (readOnly) return;
        if (section.value === '') {
          focusPrevious(focusedIndex);
        } else {
          setSections((prev) => setSectionValue(prev, focusedIndex, ''));
          // When we clear the current section, `onChange` won't be called because
          // validation returns incomplete. But we should still reset the
          // "last synced value" so a future re-fill triggers onChange.
          // We do NOT call onChange(null) automatically — that could be surprising.
        }
        return;
      }

      // Delete — behave like Backspace without backwards motion
      if (e.key === 'Delete') {
        e.preventDefault();
        if (readOnly) return;
        if (section.value !== '') {
          setSections((prev) => setSectionValue(prev, focusedIndex, ''));
        }
        return;
      }

      // Escape — revert to external value
      if (e.key === 'Escape') {
        e.preventDefault();
        setSections(buildSections({ mode, locale, hourCycle, showSeconds, value }));
        return;
      }

      // Enter — commit (no-op; validation already fires onChange on valid)
      if (e.key === 'Enter') {
        e.preventDefault();
        return;
      }
    },
    [
      disabled,
      readOnly,
      focusedIndex,
      sections,
      focusNext,
      focusPrevious,
      mode,
      locale,
      hourCycle,
      showSeconds,
      value,
    ],
  );

  const handleRootPaste = useCallback(
    (e: ClipboardEvent<HTMLElement>) => {
      if (disabled || readOnly) return;
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      if (!text) return;
      setSections((prev) => applyPaste(prev, text));
    },
    [disabled, readOnly],
  );

  const handleRootBlur = useCallback((e: FocusEvent<HTMLElement>) => {
    const nextTarget = e.relatedTarget as HTMLElement | null;
    const rootEl = e.currentTarget;
    if (nextTarget && rootEl.contains(nextTarget)) {
      // Still within the component; don't reset.
      return;
    }
    setFocusedIndex(null);
  }, []);

  const getSectionProps = useCallback(
    (index: number): SectionDomProps => {
      const section = sections[index];
      if (!section) {
        return {
          'data-focused': undefined,
          'data-placeholder': undefined,
          'data-literal': undefined,
          'data-section-index': index,
          'data-section-type': 'literal',
        };
      }

      const isFocused = focusedIndex === index;
      const isLiteral = section.type === 'literal';
      const isPlaceholder = !isLiteral && section.value === '';

      const base: SectionDomProps = {
        'data-focused': isFocused ? '' : undefined,
        'data-placeholder': isPlaceholder ? '' : undefined,
        'data-literal': isLiteral ? '' : undefined,
        'data-section-index': index,
        'data-section-type': section.type,
      };

      if (isLiteral) {
        // Literals are presentational and non-editable.
        return {
          ...base,
          'aria-hidden': true,
          contentEditable: 'false',
        };
      }

      return {
        ...base,
        role: 'spinbutton',
        'aria-label': ariaLabelForSection(section.type),
        'aria-readonly': !!readOnly,
        contentEditable: disabled || readOnly ? 'false' : 'true',
        suppressContentEditableWarning: true,
        tabIndex: isFocused ? 0 : -1,
        spellCheck: false,
        autoCorrect: 'off',
        inputMode: section.type === 'meridiem' ? 'text' : 'numeric',
        onClick: (e) => {
          e.stopPropagation();
          focusSection(index);
        },
        onFocus: () => {
          setFocusedIndex(index);
        },
        onBeforeInput: (e) => {
          // Block native editing — we drive everything through keydown.
          e.preventDefault();
        },
      };
    },
    [sections, focusedIndex, readOnly, disabled, focusSection],
  );

  const rootProps = useMemo(
    () =>
      ({
        role: 'group',
        'aria-disabled': disabled || undefined,
        onKeyDown: handleRootKeyDown,
        onPaste: handleRootPaste,
        onBlur: handleRootBlur,
      }) as UseDateFieldReturn['rootProps'],
    [disabled, handleRootKeyDown, handleRootPaste, handleRootBlur],
  );

  return {
    sections,
    focusedIndex,
    isValid: validation.valid,
    rootProps,
    getSectionProps,
    registerSectionRef,
    focusSection,
  };
}

function ariaLabelForSection(type: Section['type']): string {
  switch (type) {
    case 'year':
      return 'Year';
    case 'month':
      return 'Month';
    case 'day':
      return 'Day';
    case 'hour':
      return 'Hour';
    case 'minute':
      return 'Minute';
    case 'second':
      return 'Second';
    case 'meridiem':
      return 'AM or PM';
    default:
      return '';
  }
}
