// apps/showcase/src/demos/chat-app/components/MessageList.tsx
import { useRef, useEffect } from 'react';
import type { Message, User } from '../types';
import { formatDateSeparator } from '../data';
import { MessageItem } from './MessageItem';
import styles from '../index.module.css';

export interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
  /** Thread replies keyed by parent message ID — used to derive replier avatars. */
  threadReplies: Record<string, Message[]>;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onOpenThread: (messageId: string) => void;
}

/** Group messages: collapse consecutive messages from the same user within 5 minutes. */
function shouldShowHeader(msg: Message, prevMsg: Message | undefined): boolean {
  if (!prevMsg) return true;
  if (msg.userId !== prevMsg.userId) return true;
  return msg.timestamp - prevMsg.timestamp > 5 * 60 * 1000;
}

function getDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getUniqueReplierIds(replies: Message[] | undefined): string[] {
  if (!replies) return [];
  const seen = new Set<string>();
  return replies.reduce<string[]>((acc, r) => {
    if (!seen.has(r.userId)) {
      seen.add(r.userId);
      acc.push(r.userId);
    }
    return acc;
  }, []);
}

export function MessageList({
  messages,
  users,
  currentUserId,
  threadReplies,
  onToggleReaction,
  onOpenThread,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  let lastDateKey = '';

  return (
    <div className={styles.messageList}>
      {messages.map((msg, i) => {
        const dateKey = getDateKey(msg.timestamp);
        const showDateSep = dateKey !== lastDateKey;
        lastDateKey = dateKey;

        const showHeader = shouldShowHeader(msg, messages[i - 1]);

        return (
          <div key={msg.id}>
            {showDateSep && (
              <div className={styles.dateSeparator}>
                {formatDateSeparator(msg.timestamp)}
              </div>
            )}
            <MessageItem
              message={msg}
              users={users}
              currentUserId={currentUserId}
              compact={!showHeader}
              threadReplierIds={getUniqueReplierIds(threadReplies[msg.id])}
              onToggleReaction={onToggleReaction}
              onOpenThread={onOpenThread}
            />
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
