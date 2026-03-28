// apps/showcase/src/demos/chat-app/components/ThreadPanel.tsx
import { useRef, useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import { IconButton } from '@omniviewdev/base-ui';
import type { Message, Channel, User } from '../types';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import styles from '../index.module.css';

export interface ThreadPanelProps {
  parentMessage: Message;
  replies: Message[];
  channel: Channel;
  users: User[];
  currentUserId: string;
  onClose: () => void;
  onSendReply: (content: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export function ThreadPanel({
  parentMessage,
  replies,
  channel,
  users,
  currentUserId,
  onClose,
  onSendReply,
  onToggleReaction,
}: ThreadPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies.length]);

  return (
    <div className={styles.threadPanel}>
      <div className={styles.threadHeader}>
        <div>
          <span className={styles.threadTitle}>Thread</span>
          <span className={styles.threadContext}>#{channel.name}</span>
        </div>
        <IconButton variant="ghost" size="sm" aria-label="Close thread" onClick={onClose}>
          <LuX size={14} />
        </IconButton>
      </div>

      <div className={styles.threadMessages}>
        <div className={styles.threadParent}>
          <MessageItem
            message={parentMessage}
            users={users}
            currentUserId={currentUserId}
            threadView
            onToggleReaction={onToggleReaction}
          />
        </div>

        {replies.length > 0 && (
          <div className={styles.threadRepliesLabel}>
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </div>
        )}

        {replies.map((reply) => (
          <MessageItem
            key={reply.id}
            message={reply}
            users={users}
            currentUserId={currentUserId}
            threadView
            onToggleReaction={onToggleReaction}
          />
        ))}
        <div ref={endRef} />
      </div>

      <MessageComposer placeholder="Reply…" onSend={onSendReply} />
    </div>
  );
}
