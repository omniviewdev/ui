import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { TextArea } from '../text-area';
import { Popover } from '../popover';
import {
  applyQueryEdit,
  applyTextareaChange,
  sourceOffsetToTextarea,
  textareaOffsetToSource,
  utf16ToUtf8,
  utf8ToUtf16,
} from './offsets';
import type {
  QueryAvailability,
  QueryCompletion,
  QueryDocument,
  QueryEdit,
  QueryLanguageResponse,
  QueryLanguageService,
} from './types';
import styles from './QueryAuthoring.module.css';

export interface QueryInputProps {
  document: QueryDocument;
  onChange: (text: string) => void;
  contextKey: string;
  request?: QueryLanguageService;
  onSubmit?: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  availability?: QueryAvailability;
  debounceMs?: number;
  /** Bounded visible suggestions; the service must also enforce its own response limit. */
  maxSuggestions?: number;
  rows?: number;
  className?: string;
}
const messages = {
  ready: 'No suggestions at this position.',
  empty: 'No suggestions at this position.',
  loading: 'Loading suggestions…',
  error: 'Suggestions failed. Edit or press Control+Space to retry.',
  denied: 'Suggestion access denied.',
  unavailable: 'Suggestions unavailable.',
};

/** Compact native editing mechanics: no CEL parser, schema walker, Monaco model or worker. */
export function QueryInput({
  document,
  onChange,
  contextKey,
  request,
  onSubmit,
  label = 'Query expression',
  placeholder = 'Enter a query expression…',
  disabled = false,
  readOnly = false,
  availability,
  debounceMs = 120,
  maxSuggestions = 50,
  rows = 1,
  className,
}: QueryInputProps) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const selection = useRef<{ text: string; start: number; end: number } | null>(null);
  const composing = useRef(false);
  const [ime, setIme] = useState(false);
  const [active, setActive] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(0);
  const [result, setResult] = useState<QueryLanguageResponse | null>(null);
  const [resultCursor, setResultCursor] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [editError, setEditError] = useState<string>();
  const blocked =
    disabled || readOnly || (availability !== undefined && availability.status !== 'ready');
  const open = active && !blocked && !ime && Boolean(request);
  // Keep pending presentation tied to request inputs, including debounce and explicit retries.
  const [requestInputs, setRequestInputs] = useState(() => ({
    text: document.text, version: document.version, uri: document.uri,
    contextKey, request, cursor, open, debounceMs, retry,
  }));
  if (
    requestInputs.text !== document.text ||
    requestInputs.version !== document.version ||
    requestInputs.uri !== document.uri ||
    requestInputs.contextKey !== contextKey ||
    requestInputs.request !== request ||
    requestInputs.cursor !== cursor ||
    requestInputs.open !== open ||
    requestInputs.debounceMs !== debounceMs ||
    requestInputs.retry !== retry
  ) {
    setRequestInputs({
      text: document.text, version: document.version, uri: document.uri,
      contextKey, request, cursor, open, debounceMs, retry,
    });
    setLoading(Boolean(open && request));
    setSelected(0);
  }
  const current =
    result?.documentVersion === document.version && result.contextKey === contextKey
      ? result
      : null;
  const suggestions = (
    !loading && resultCursor === cursor && current?.status === 'ready' ? current.completions : []
  ).slice(0, Math.max(0, maxSuggestions));
  const highlighted = suggestions[selected];

  useLayoutEffect(() => {
    const next = selection.current;
    if (next && next.text === document.text) {
      input.current?.setSelectionRange(next.start, next.end);
      selection.current = null;
    }
  }, [document.text]);

  useEffect(() => {
    const sequence = ++generation.current;
    const abort = new AbortController();
    controller.current = abort;
    if (!open || !request) {
      return () => abort.abort();
    }
    const timer = setTimeout(
      async () => {
        try {
          const domLength = sourceOffsetToTextarea(document.text, document.text.length);
          const offset = utf16ToUtf8(
            document.text,
            textareaOffsetToSource(document.text, Math.min(cursor, domLength)),
          );
          const response = await request({
            document: { text: document.text, version: document.version, uri: document.uri },
            cursor: { offset, unit: 'utf8-byte' },
            contextKey,
            signal: abort.signal,
          });
          if (abort.signal.aborted || sequence !== generation.current) return;
          if (response.documentVersion !== document.version || response.contextKey !== contextKey) {
            setResult({
              documentVersion: document.version,
              contextKey,
              status: 'unavailable',
              message:
                'Authoring context changed. Press Control+Space to request current suggestions.',
              completions: [],
              diagnostics: [],
            });
          } else {
            // Native textareas do not implement snippet tab stops or placeholder expansion.
            const completions = response.completions.filter(
              (completion) => completion.insertTextFormat !== 'snippet',
            );
            setResult({ ...response, completions });
            setResultCursor(cursor);
            const firstEnabled = completions.findIndex(
              (completion) => !completion.disabledReason,
            );
            setSelected(firstEnabled < 0 ? 0 : firstEnabled);
          }
        } catch (error) {
          if (!abort.signal.aborted && sequence === generation.current) {
            setResult({
              documentVersion: document.version,
              contextKey,
              status: 'error',
              message: error instanceof Error ? error.message : messages.error,
              completions: [],
              diagnostics: [],
            });
          }
        } finally {
          if (!abort.signal.aborted && sequence === generation.current) setLoading(false);
        }
      },
      Math.max(0, debounceMs),
    );
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [document.text, document.version, document.uri, contextKey, request, cursor, open, debounceMs, retry]);

  useEffect(() => {
    if (open && highlighted)
      globalThis.document
        .getElementById(`${id}-option-${selected}`)
        ?.scrollIntoView?.({ block: 'nearest' });
  }, [open, highlighted, id, selected]);

  function dismiss() {
    controller.current?.abort();
    generation.current++;
    setActive(false);
  }
  function accept(edit: QueryEdit) {
    if (blocked || composing.current || !current) return;
    try {
      const next = applyQueryEdit(document.text, edit);
      const domSelection = sourceOffsetToTextarea(next.text, next.selection);
      selection.current = { text: next.text, start: domSelection, end: domSelection };
      setEditError(undefined);
      dismiss();
      onChange(next.text);
      input.current?.focus();
      if (next.text === document.text) input.current?.setSelectionRange(domSelection, domSelection);
    } catch {
      setEditError('The service returned an invalid UTF-8 edit range. The query was not changed.');
    }
  }
  function acceptCompletion(completion: QueryCompletion) {
    if (!completion.disabledReason && completion.insertTextFormat !== 'snippet') accept(completion.edit);
  }
  function navigate(direction: number) {
    if (!suggestions.length) return;
    let index = selected;
    for (let count = 0; count < suggestions.length; count++) {
      index = (index + direction + suggestions.length) % suggestions.length;
      if (!suggestions[index]?.disabledReason) {
        setSelected(index);
        break;
      }
    }
  }
  const status =
    availability && availability.status !== 'ready'
      ? availability.status
      : loading
        ? 'loading'
        : (current?.status ?? 'empty');
  const statusMessage =
    availability?.message ?? (loading ? messages.loading : (current?.message ?? messages[status]));

  return (
    <TextArea.Root className={`${styles.InputRoot} ${className ?? ''}`}>
      <TextArea.Control
        ref={input}
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={open && highlighted ? `${id}-option-${selected}` : undefined}
        aria-describedby={`${id}-help ${id}-diagnostics`}
        aria-invalid={
          current?.diagnostics.some((diagnostic) => diagnostic.severity === 'error') || undefined
        }
        value={document.text.replace(/\r\n?/g, '\n')}
        rows={rows}
        mono
        resize={rows > 1 ? 'vertical' : 'none'}
        className={styles.QueryText}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly || availability?.status === 'denied'}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        onFocus={(event) => {
          setCursor(event.currentTarget.selectionStart);
          setActive(true);
        }}
        onBlur={dismiss}
        onSelect={(event) => setCursor(event.currentTarget.selectionStart)}
        onChange={(event) => {
          controller.current?.abort();
          generation.current++;
          const text = applyTextareaChange(document.text, event.currentTarget.value);
          if (!composing.current)
            selection.current = {
              text,
              start: event.currentTarget.selectionStart,
              end: event.currentTarget.selectionEnd,
            };
          setResult(null);
          setEditError(undefined);
          setCursor(event.currentTarget.selectionStart);
          setActive(true);
          onChange(text);
        }}
        onCompositionStart={() => {
          composing.current = true;
          setIme(true);
          controller.current?.abort();
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          setIme(false);
          setCursor(event.currentTarget.selectionStart);
          setActive(true);
        }}
        onKeyDown={(event) => {
          if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
          if ((event.ctrlKey || event.metaKey) && event.key === ' ') {
            event.preventDefault();
            setActive(true);
            setRetry((value) => value + 1);
            return;
          }
          if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            dismiss();
            return;
          }
          if (event.key === 'Tab') {
            dismiss();
            return;
          }
          if (
            open &&
            !event.shiftKey &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            suggestions.some((item) => !item.disabledReason) &&
            (event.key === 'ArrowDown' || event.key === 'ArrowUp')
          ) {
            event.preventDefault();
            navigate(event.key === 'ArrowDown' ? 1 : -1);
            return;
          }
          if (event.key === 'Enter' && !event.shiftKey) {
            if (open && highlighted) {
              event.preventDefault();
              acceptCompletion(highlighted);
            } else if (open && loading) {
              event.preventDefault();
            } else if (onSubmit && !blocked) {
              event.preventDefault();
              dismiss();
              onSubmit();
            }
          }
        }}
      />
      <span id={`${id}-help`} className={styles.SrOnly}>
        Control+Space requests suggestions. Arrow keys select, Enter accepts, Escape dismisses, Tab
        moves focus. Shift+Enter inserts a newline.
      </span>
      <Popover.Root
        open={open}
        onOpenChange={(next, details) => {
          if (!next && details.event.target !== input.current) dismiss();
        }}
        modal={false}
      >
        <Popover.Portal>
          <Popover.Positioner
            anchor={input}
            side="bottom"
            align="start"
            sideOffset={4}
            className={styles.Positioner}
          >
            <Popover.Popup
              initialFocus={false}
              finalFocus={false}
              className={styles.Suggestions}
              role="presentation"
              onMouseDown={(event) => event.preventDefault()}
            >
              <div
                role="listbox"
                aria-label="Query suggestions"
                id={`${id}-list`}
                aria-busy={loading}
              >
                {suggestions.map((item, index) => (
                  <div
                    role="option"
                    id={`${id}-option-${index}`}
                    key={item.id}
                    aria-selected={selected === index}
                    aria-disabled={Boolean(item.disabledReason)}
                    className={styles.Option}
                    onPointerMove={() => setSelected(index)}
                    onClick={() => acceptCompletion(item)}
                  >
                    <span className={styles.OptionTitle}>
                      <strong>{item.label}</strong>
                      <span className={styles.Kind}>
                        {item.kind}
                        {item.type ? ` · ${item.type}` : ''}
                      </span>
                    </span>
                    {item.description ? (
                      <span className={styles.Muted}>{item.description}</span>
                    ) : null}
                    {item.condition ? (
                      <span className={styles.Condition}>Conditional: {item.condition}</span>
                    ) : null}
                    {item.detail ? <span className={styles.Muted}>{item.detail}</span> : null}
                    {item.disabledReason ? <span>{item.disabledReason}</span> : null}
                  </div>
                ))}
              </div>
              {loading || !suggestions.length || current?.message ? (
                <div role="status" className={styles.Status} data-status={status}>
                  {statusMessage}
                </div>
              ) : null}
              {current?.incomplete || (current?.completions.length ?? 0) > suggestions.length ? (
                <div className={styles.Muted}>
                  Suggestions are limited. Continue typing to narrow the request.
                </div>
              ) : null}
              <div className={styles.Hint}>↑ ↓ select · Enter insert · Esc close</div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {!open && availability && availability.status !== 'ready' ? (
        <div role="status" data-status={availability.status}>
          {availability.message ?? messages[availability.status]}
        </div>
      ) : null}
      <div id={`${id}-diagnostics`} className={styles.Diagnostics}>
        {current?.diagnostics.map((diagnostic) => (
          <div
            key={diagnostic.id}
            data-severity={diagnostic.severity}
            className={styles.Diagnostic}
          >
            <button
              type="button"
              onClick={() => {
                try {
                  const start = sourceOffsetToTextarea(
                    document.text,
                    utf8ToUtf16(document.text, diagnostic.range.start),
                  );
                  const end = sourceOffsetToTextarea(
                    document.text,
                    utf8ToUtf16(document.text, diagnostic.range.end),
                  );
                  input.current?.focus();
                  input.current?.setSelectionRange(start, end);
                } catch {
                  setEditError('The service returned an invalid UTF-8 diagnostic range.');
                }
              }}
            >
              {diagnostic.message}
            </button>
            {diagnostic.fix ? (
              <button
                type="button"
                disabled={blocked}
                aria-label={`Apply fix: ${diagnostic.message}`}
                onClick={() => accept(diagnostic.fix!)}
              >
                Apply fix
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {editError ? <div role="alert">{editError}</div> : null}
    </TextArea.Root>
  );
}
