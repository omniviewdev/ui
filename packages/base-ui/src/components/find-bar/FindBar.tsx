import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../system/classnames';
import { Input } from '../input';
import { IconButton } from '../icon-button';
import { ToggleButton } from '../toggle-button';
import { Toolbar } from '../toolbar';
import { LuChevronUp, LuChevronDown, LuX, LuReplace, LuReplaceAll } from 'react-icons/lu';
import styles from './FindBar.module.css';

export interface FindBarProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  matchCount?: number;
  currentMatch?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  replaceEnabled?: boolean;
  replaceText?: string;
  onReplaceTextChange?: (text: string) => void;
  onReplace?: () => void;
  onReplaceAll?: () => void;
  caseSensitive?: boolean;
  onCaseSensitiveChange?: (v: boolean) => void;
  regex?: boolean;
  onRegexChange?: (v: boolean) => void;
  wholeWord?: boolean;
  onWholeWordChange?: (v: boolean) => void;
}

export const FindBar = forwardRef<HTMLDivElement, FindBarProps>(function FindBar(
  {
    open = true,
    onOpenChange,
    query = '',
    onQueryChange,
    matchCount,
    currentMatch,
    onNext,
    onPrevious,
    replaceEnabled = false,
    replaceText = '',
    onReplaceTextChange,
    onReplace,
    onReplaceAll,
    caseSensitive = false,
    onCaseSensitiveChange,
    regex = false,
    onRegexChange,
    wholeWord = false,
    onWholeWordChange,
    className,
    ...props
  },
  ref,
) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) searchInputRef.current?.focus();
  }, [open]);

  const handleSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false);
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          onPrevious?.();
        } else {
          onNext?.();
        }
      }
    },
    [onOpenChange, onNext, onPrevious],
  );

  const handleReplaceKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false);
      } else if (e.key === 'Enter') {
        onReplace?.();
      }
    },
    [onOpenChange, onReplace],
  );

  const handleQueryChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onQueryChange?.(e.target.value),
    [onQueryChange],
  );

  const handleCaseSensitiveChange = useCallback(
    (pressed: boolean) => onCaseSensitiveChange?.(pressed),
    [onCaseSensitiveChange],
  );

  const handleWholeWordChange = useCallback(
    (pressed: boolean) => onWholeWordChange?.(pressed),
    [onWholeWordChange],
  );

  const handleRegexChange = useCallback(
    (pressed: boolean) => onRegexChange?.(pressed),
    [onRegexChange],
  );

  const handleClose = useCallback(
    () => onOpenChange?.(false),
    [onOpenChange],
  );

  const handleReplaceTextChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onReplaceTextChange?.(e.target.value),
    [onReplaceTextChange],
  );

  if (!open) return null;

  const matchInfo =
    matchCount !== undefined
      ? currentMatch !== undefined
        ? `${currentMatch} of ${matchCount}`
        : `${matchCount} match${matchCount !== 1 ? 'es' : ''}`
      : undefined;

  return (
    <div ref={ref} className={cn(styles.Root, className)} role="search" {...props}>
      <Toolbar size="sm" className={styles.Row}>
        <Input.Control
          ref={searchInputRef}
          size="sm"
          variant="outline"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleSearchKeyDown}
          placeholder="Find"
          aria-label="Find"
          className={styles.SearchInput}
          endDecorator={
            matchInfo ? <span className={styles.MatchCount}>{matchInfo}</span> : undefined
          }
        />

        <Toolbar.Group>
          {onCaseSensitiveChange && (
            <ToggleButton
              size="sm"
              variant="ghost"
              square
              pressed={caseSensitive}
              onPressedChange={handleCaseSensitiveChange}
              aria-label="Match case"
              title="Match Case"
              className={styles.ToggleBtn}
            >
              Aa
            </ToggleButton>
          )}
          {onWholeWordChange && (
            <ToggleButton
              size="sm"
              variant="ghost"
              square
              pressed={wholeWord}
              onPressedChange={handleWholeWordChange}
              aria-label="Match whole word"
              title="Match Whole Word"
              className={styles.ToggleBtn}
            >
              ab
            </ToggleButton>
          )}
          {onRegexChange && (
            <ToggleButton
              size="sm"
              variant="ghost"
              square
              pressed={regex}
              onPressedChange={handleRegexChange}
              aria-label="Use regular expression"
              title="Use Regular Expression"
              className={styles.ToggleBtn}
            >
              .*
            </ToggleButton>
          )}
        </Toolbar.Group>

        <Toolbar.Group separator>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={!onPrevious}
            aria-label="Previous match"
            title="Previous Match (Shift+Enter)"
          >
            <LuChevronUp />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={!onNext}
            aria-label="Next match"
            title="Next Match (Enter)"
          >
            <LuChevronDown />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={handleClose}
            aria-label="Close"
            title="Close (Escape)"
          >
            <LuX />
          </IconButton>
        </Toolbar.Group>
      </Toolbar>

      {replaceEnabled && (
        <Toolbar size="sm" className={styles.Row}>
          <Input.Control
            size="sm"
            variant="outline"
            value={replaceText}
            onChange={handleReplaceTextChange}
            onKeyDown={handleReplaceKeyDown}
            placeholder="Replace"
            aria-label="Replace"
            className={styles.SearchInput}
          />
          <Toolbar.Group separator>
            <IconButton
              variant="ghost"
              size="sm"
              dense
              onClick={onReplace}
              disabled={!onReplace}
              aria-label="Replace"
              title="Replace"
            >
              <LuReplace />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              dense
              onClick={onReplaceAll}
              disabled={!onReplaceAll}
              aria-label="Replace all"
              title="Replace All"
            >
              <LuReplaceAll />
            </IconButton>
          </Toolbar.Group>
        </Toolbar>
      )}
    </div>
  );
});

FindBar.displayName = 'FindBar';
