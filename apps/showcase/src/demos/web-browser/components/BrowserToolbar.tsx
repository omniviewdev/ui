import { useState, useCallback, useEffect, type KeyboardEvent } from 'react';
import {
  LuArrowLeft,
  LuArrowRight,
  LuRotateCw,
  LuLock,
} from 'react-icons/lu';
import { IconButton, Input } from '@omniviewdev/base-ui';
import { ensureProtocol, NEW_TAB_URL } from '../data';
import styles from '../index.module.css';

export interface BrowserToolbarProps {
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
}

export function BrowserToolbar({
  url,
  canGoBack,
  canGoForward,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
}: BrowserToolbarProps) {
  const displayUrl = url === NEW_TAB_URL ? '' : url;
  const [inputValue, setInputValue] = useState(displayUrl);

  // Sync input when URL changes externally (tab switch, bookmark click)
  useEffect(() => {
    setInputValue(displayUrl);
  }, [displayUrl]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = inputValue.trim();
        if (trimmed) onNavigate(ensureProtocol(trimmed));
      }
    },
    [inputValue, onNavigate],
  );

  return (
    <div className={styles.toolbar}>
      <IconButton
        variant="ghost"
        size="sm"

        aria-label="Back"
        disabled={!canGoBack}
        onClick={onBack}
      >
        <LuArrowLeft size={14} />
      </IconButton>
      <IconButton
        variant="ghost"
        size="sm"

        aria-label="Forward"
        disabled={!canGoForward}
        onClick={onForward}
      >
        <LuArrowRight size={14} />
      </IconButton>
      <IconButton
        variant="ghost"
        size="sm"

        aria-label="Refresh"
        onClick={onRefresh}
      >
        <LuRotateCw size={14} />
      </IconButton>
      <Input.Root size="sm" className={styles.addressBar}>
        <Input.Control
          startDecorator={<LuLock size={12} />}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setInputValue(displayUrl)}
          placeholder="Enter a URL…"
        />
      </Input.Root>
    </div>
  );
}
