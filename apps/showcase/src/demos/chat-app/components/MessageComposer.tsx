// apps/showcase/src/demos/chat-app/components/MessageComposer.tsx
import { useState, useCallback, useRef, type KeyboardEvent } from 'react';
import {
  LuBold,
  LuItalic,
  LuStrikethrough,
  LuCode,
  LuLink,
  LuList,
  LuListOrdered,
  LuSmile,
  LuPaperclip,
  LuSendHorizontal,
} from 'react-icons/lu';
import { IconButton } from '@omniview/base-ui';
import styles from '../index.module.css';

export interface MessageComposerProps {
  placeholder?: string;
  onSend: (content: string) => void;
}

export function MessageComposer({ placeholder = 'Message…', onSend }: MessageComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  return (
    <div className={styles.composer}>
      <div className={styles.composerBox}>
        <textarea
          ref={textareaRef}
          className={styles.composerTextarea}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
        />
        <div className={styles.composerToolbar}>
          <div className={styles.composerFormatting}>
            <IconButton variant="ghost" size="sm" aria-label="Bold">
              <LuBold size={14} />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Italic">
              <LuItalic size={14} />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Strikethrough">
              <LuStrikethrough size={14} />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Code">
              <LuCode size={14} />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Link">
              <LuLink size={14} />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Bulleted list">
              <LuList size={14} />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Numbered list">
              <LuListOrdered size={14} />
            </IconButton>
          </div>
          <div className={styles.composerActions}>
            <IconButton variant="ghost" size="sm" aria-label="Emoji">
              <LuSmile size={14} />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Attach file">
              <LuPaperclip size={14} />
            </IconButton>
            <IconButton
              variant="solid"
              size="sm"
              color="brand"
              aria-label="Send"
              disabled={!value.trim()}
              onClick={handleSend}
            >
              <LuSendHorizontal size={14} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
