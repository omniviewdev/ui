import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../system/classnames';
import type { StyledComponentProps } from '../../system/types';
import { Input } from '../input';
import { Popover } from '../popover';
import {
  applyKeyedSearchCompletion,
  createKeyedSearchIndex,
  getKeyedSearchCompletions,
  parseKeyedSearch,
  type KeyedSearchCompletion,
  type KeyedSearchField,
  type ParsedKeyedSearch,
} from './query';
import styles from './KeyedSearch.module.css';

export interface KeyedSearchProps
  extends
    Omit<
      ComponentPropsWithoutRef<'input'>,
      'size' | 'color' | 'value' | 'defaultValue' | 'onChange' | 'onSubmit' | 'type'
    >,
    StyledComponentProps {
  query: string;
  onQueryChange: (query: string) => void;
  fields: readonly KeyedSearchField[];
  onParsedQueryChange?: (parsed: ParsedKeyedSearch) => void;
  onSubmit?: (parsed: ParsedKeyedSearch, event: KeyboardEvent<HTMLInputElement>) => void;
  /** Rendering is capped at 100 options. Default: 20. */
  maxSuggestions?: number;
  suggestionsLabel?: string;
}

/** Native single-line editing with local, caret-aware keyed completions. */
export const KeyedSearch = forwardRef<HTMLInputElement, KeyedSearchProps>(function KeyedSearch(
  {
    query,
    onQueryChange,
    fields,
    onParsedQueryChange,
    onSubmit,
    maxSuggestions = 20,
    suggestionsLabel = 'Search suggestions',
    size = 'md',
    color = 'neutral',
    variant = 'outline',
    className,
    disabled,
    readOnly,
    id: suppliedId,
    onKeyDown,
    onFocus,
    onBlur,
    onClick,
    onSelect,
    onScroll,
    onCompositionStart,
    onCompositionEnd,
    'aria-describedby': describedBy,
    'aria-label': label = 'Search',
    ...inputProps
  },
  forwardedRef,
) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const highlight = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const pendingSelection = useRef<{ query: string; caret: number } | null>(null);
  const [ime, setIme] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selection, setSelection] = useState({ start: query.length, end: query.length });
  const [choice, setChoice] = useState<{ items: readonly KeyedSearchCompletion[]; index: number }>({
    items: [],
    index: 0,
  });
  useImperativeHandle(forwardedRef, () => input.current!);
  const index = useMemo(() => createKeyedSearchIndex(fields), [fields]);
  const parsed = useMemo(() => parseKeyedSearch(query, index), [query, index]);
  const suggestions = useMemo(
    () => getKeyedSearchCompletions(parsed, selection.start, index, maxSuggestions),
    [parsed, selection.start, index, maxSuggestions],
  );
  const selected =
    choice.items === suggestions ? Math.min(choice.index, suggestions.length - 1) : 0;
  const blocked = Boolean(disabled || readOnly);
  const open =
    focused &&
    !dismissed &&
    !blocked &&
    !ime &&
    selection.start === selection.end &&
    suggestions.length > 0;

  useEffect(() => onParsedQueryChange?.(parsed), [parsed, onParsedQueryChange]);
  useLayoutEffect(() => {
    const next = pendingSelection.current;
    if (next?.query === query) {
      input.current?.setSelectionRange(next.caret, next.caret);
      pendingSelection.current = null;
    }
    if (highlight.current && input.current) highlight.current.scrollLeft = input.current.scrollLeft;
  }, [query]);
  useEffect(() => {
    if (open)
      input.current?.ownerDocument
        .getElementById(`${id}-option-${selected}`)
        ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [open, selected, id, suggestions]);

  function readSelection(element: HTMLInputElement) {
    const start = element.selectionStart ?? query.length;
    const end = element.selectionEnd ?? start;
    if (start !== selection.start || end !== selection.end) {
      setSelection({ start, end });
      setDismissed(false);
    }
  }
  function accept(completion: KeyedSearchCompletion) {
    if (blocked || composing.current) return;
    const next = applyKeyedSearchCompletion(query, completion);
    pendingSelection.current = next;
    setSelection({ start: next.caret, end: next.caret });
    setDismissed(completion.kind === 'value');
    onQueryChange(next.query);
    if (next.query === query) {
      input.current?.setSelectionRange(next.caret, next.caret);
      pendingSelection.current = null;
    }
  }

  // Source slices preserve all whitespace and malformed text without HTML injection.
  const highlightedQuery = useMemo(() => {
    const spans = [];
    let previous = 0;
    for (const token of parsed.tokens) {
      spans.push(query.slice(previous, token.start));
      const invalid =
        token.unclosedQuote || (token.key !== undefined && !index.byName.has(token.key));
      spans.push(
        <span key={token.start} data-invalid={invalid || undefined} className={styles.Token}>
          {token.colon === undefined ? (
            token.raw
          ) : (
            <>
              <span className={styles.Key}>{query.slice(token.start, token.colon)}</span>
              <span className={styles.Colon}>:</span>
              <span className={styles.Value}>{query.slice(token.colon + 1, token.end)}</span>
            </>
          )}
        </span>,
      );
      previous = token.end;
    }
    spans.push(query.slice(previous));
    return spans;
  }, [parsed, query, index]);

  return (
    <Input.Root
      ref={root}
      size={size}
      color={color}
      variant={variant}
      className={cn(styles.Root, className)}
    >
      <div className={styles.Editor} data-composing={ime || undefined}>
        <Input.Control
          {...inputProps}
          ref={input}
          id={id}
          mono
          type="text"
          className={styles.Control}
          value={query}
          disabled={disabled}
          readOnly={readOnly}
          role="combobox"
          aria-label={label}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${id}-listbox` : undefined}
          aria-activedescendant={open ? `${id}-option-${selected}` : undefined}
          aria-invalid={parsed.diagnostics.length > 0 || inputProps['aria-invalid'] || undefined}
          aria-describedby={[
            describedBy,
            `${id}-help`,
            parsed.diagnostics.length ? `${id}-diagnostics` : '',
          ]
            .filter(Boolean)
            .join(' ')}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => {
            if (blocked) return;
            readSelection(event.currentTarget);
            setDismissed(false);
            onQueryChange(event.currentTarget.value);
          }}
          onFocus={(event) => {
            readSelection(event.currentTarget);
            setFocused(true);
            setDismissed(false);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            setDismissed(true);
            onBlur?.(event);
          }}
          onClick={(event) => {
            readSelection(event.currentTarget);
            setDismissed(false);
            onClick?.(event);
          }}
          onSelect={(event) => {
            readSelection(event.currentTarget);
            onSelect?.(event);
          }}
          onScroll={(event) => {
            if (highlight.current) highlight.current.scrollLeft = event.currentTarget.scrollLeft;
            onScroll?.(event);
          }}
          onCompositionStart={(event) => {
            composing.current = true;
            setIme(true);
            onCompositionStart?.(event);
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            setIme(false);
            readSelection(event.currentTarget);
            setDismissed(false);
            onCompositionEnd?.(event);
          }}
          onKeyDown={(event) => {
            if (
              blocked ||
              composing.current ||
              event.nativeEvent.isComposing ||
              event.keyCode === 229
            )
              return;
            const plain = !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
            if (open && event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              setDismissed(true);
              return;
            }
            if (open && plain && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
              event.preventDefault();
              event.stopPropagation();
              setChoice({
                items: suggestions,
                index:
                  (selected + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) %
                  suggestions.length,
              });
              return;
            }
            if (open && plain && (event.key === 'Enter' || event.key === 'Tab')) {
              event.preventDefault();
              event.stopPropagation();
              accept(suggestions[selected]!);
              return;
            }
            if ((event.ctrlKey || event.metaKey) && event.key === ' ') {
              event.preventDefault();
              setDismissed(false);
              return;
            }
            // Consumers own result navigation only after completion handling declines the key.
            onKeyDown?.(event);
            if (!event.defaultPrevented && plain && event.key === 'Enter' && onSubmit) {
              event.preventDefault();
              onSubmit(parsed, event);
            }
          }}
        />
        <div
          ref={highlight}
          className={styles.Highlight}
          aria-hidden="true"
          data-ov-keyed-search-highlight=""
        >
          <div className={styles.HighlightText}>{highlightedQuery}</div>
        </div>
      </div>
      <span id={`${id}-help`} className={styles.SrOnly}>
        Type field:value or free text. Quote values containing spaces. Arrow keys select
        suggestions; Enter or Tab accepts; Escape dismisses. Control+Space reopens suggestions.
      </span>
      <span role="status" aria-live="polite" aria-atomic="true" className={styles.SrOnly}>
        {open
          ? `${suggestions.length} suggestions available. ${suggestions[selected]?.label}.`
          : 'Suggestions closed.'}
      </span>
      {parsed.diagnostics.length > 0 ? (
        <div id={`${id}-diagnostics`} className={styles.Diagnostics}>
          {parsed.diagnostics.map((diagnostic) => (
            <div key={`${diagnostic.code}-${diagnostic.start}`}>{diagnostic.message}</div>
          ))}
        </div>
      ) : null}
      <Popover.Root
        open={open}
        modal={false}
        onOpenChange={(next, details) => {
          if (!next && details.event.target !== input.current) setDismissed(true);
        }}
      >
        {/* Keep the portal inside the owning theme scope, including custom inline tokens. */}
        <Popover.Portal container={root.current} className={styles.Portal}>
          <Popover.Positioner
            anchor={input}
            side="bottom"
            align="start"
            sideOffset={4}
            positionMethod="fixed"
            className={styles.Positioner}
          >
            <Popover.Popup
              initialFocus={false}
              finalFocus={false}
              role="presentation"
              className={styles.Suggestions}
              size={size}
              onMouseDown={(event) => event.preventDefault()}
            >
              <div
                id={`${id}-listbox`}
                role="listbox"
                aria-label={suggestionsLabel}
                aria-hidden={!open || undefined}
              >
                {suggestions.map((suggestion, optionIndex) => (
                  <div
                    key={`${suggestion.kind}-${optionIndex}`}
                    id={`${id}-option-${optionIndex}`}
                    role="option"
                    aria-selected={selected === optionIndex}
                    className={styles.Option}
                    onPointerMove={() => setChoice({ items: suggestions, index: optionIndex })}
                    onClick={() => accept(suggestion)}
                  >
                    <span className={styles.OptionLabel}>{suggestion.label}</span>
                    {suggestion.description ? (
                      <span className={styles.OptionDescription}>{suggestion.description}</span>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className={styles.Hint}>↑ ↓ select · Enter / Tab insert · Esc close</div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </Input.Root>
  );
});
