// apps/showcase/src/demos/chat-app/components/MessageItem.tsx
import { type ReactNode, Fragment } from 'react';
import {
  LuSmile,
  LuMessageSquare,
  LuBookmark,
  LuEllipsis,
  LuPencil,
  LuTrash2,
  LuPin,
  LuCopy,
  LuFile,
} from 'react-icons/lu';
import { Avatar, IconButton, CodeBlock, Menu } from '@omniview/base-ui';
import type { Message, User } from '../types';
import { getUserById, formatTime } from '../data';
import { ReactionBar } from './ReactionBar';
import styles from '../index.module.css';

export interface MessageItemProps {
  message: Message;
  users: User[];
  currentUserId: string;
  /** If true, hide avatar and name (grouped message from same user). */
  compact?: boolean;
  /** If true, use smaller avatars for thread panel. */
  threadView?: boolean;
  /** User IDs of unique thread repliers (for stacked avatars in thread indicator). */
  threadReplierIds?: string[];
  onToggleReaction: (messageId: string, emoji: string) => void;
  onOpenThread?: (messageId: string) => void;
}

/** Parse content into text segments, @mentions, URLs, code blocks, and file attachments. */
function renderContent(content: string): ReactNode[] {
  const result: ReactNode[] = [];

  // First split out triple-backtick code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Render text before this code block
    if (match.index > lastIndex) {
      result.push(...renderInlineContent(content.slice(lastIndex, match.index), result.length));
    }
    // Render the code block
    result.push(
      <CodeBlock
        key={`cb-${result.length}`}
        code={match[2]!.trim()}
        language={match[1] ?? 'text'}
        copyable
      />,
    );
    lastIndex = match.index + match[0].length;
  }

  // Render remaining text
  if (lastIndex < content.length) {
    result.push(...renderInlineContent(content.slice(lastIndex), result.length));
  }

  return result;
}

/** Render inline content — @mentions, URLs, and file attachment syntax [file:name]. */
function renderInlineContent(text: string, keyOffset: number): ReactNode[] {
  const parts = text.split(/(@\w+|https?:\/\/\S+|\[file:[^\]]+\])/g);
  return parts.map((part, i) => {
    const key = keyOffset + i;
    if (part.startsWith('@')) {
      return (
        <span key={key} className={styles.messageMention}>
          {part}
        </span>
      );
    }
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={key}
          className={styles.messageLink}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.preventDefault()}
        >
          {part}
        </a>
      );
    }
    if (part.startsWith('[file:')) {
      const fileName = part.slice(6, -1);
      return (
        <div key={key} className={styles.fileAttachment}>
          <LuFile size={16} />
          <span className={styles.fileName}>{fileName}</span>
        </div>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function HoverActions({
  messageId,
  onOpenThread,
}: {
  messageId: string;
  onOpenThread?: (id: string) => void;
}) {
  return (
    <div className={styles.hoverActions}>
      <IconButton variant="ghost" size="sm" aria-label="React">
        <LuSmile size={14} />
      </IconButton>
      {onOpenThread && (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Reply in thread"
          onClick={() => onOpenThread(messageId)}
        >
          <LuMessageSquare size={14} />
        </IconButton>
      )}
      <IconButton variant="ghost" size="sm" aria-label="Bookmark">
        <LuBookmark size={14} />
      </IconButton>
      <Menu.Root>
        <Menu.Trigger
          render={({ color: _, ...props }) => (
            <IconButton {...props} variant="ghost" size="sm" aria-label="More actions">
              <LuEllipsis size={14} />
            </IconButton>
          )}
        />
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              <Menu.Item startDecorator={<LuCopy size={14} />}>Copy text</Menu.Item>
              <Menu.Item startDecorator={<LuPin size={14} />}>Pin message</Menu.Item>
              <Menu.Separator />
              <Menu.Item startDecorator={<LuPencil size={14} />}>Edit message</Menu.Item>
              <Menu.Item startDecorator={<LuTrash2 size={14} />}>Delete message</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}

export function MessageItem({
  message,
  users,
  currentUserId,
  compact = false,
  threadView = false,
  threadReplierIds = [],
  onToggleReaction,
  onOpenThread,
}: MessageItemProps) {
  const user = getUserById(users, message.userId);
  const avatarSize = threadView ? 'sm' : 'md';

  if (compact) {
    return (
      <div className={`${styles.message} ${styles.messageCompact}`}>
        <span className={styles.messageCompactTime}>{formatTime(message.timestamp)}</span>
        <div className={styles.messageBody}>
          <div className={styles.messageContent}>{renderContent(message.content)}</div>
          <ReactionBar
            reactions={message.reactions}
            currentUserId={currentUserId}
            onToggle={(emoji) => onToggleReaction(message.id, emoji)}
          />
        </div>
        <HoverActions messageId={message.id} onOpenThread={onOpenThread} />
      </div>
    );
  }

  // Collect unique replier avatars for thread indicator (up to 3)
  const threadAvatarUsers = threadReplierIds
    .slice(0, 3)
    .map((uid) => getUserById(users, uid));

  return (
    <div className={styles.message}>
      <div className={styles.messageAvatar}>
        <Avatar name={user.name} shape="rounded" size={avatarSize} />
      </div>
      <div className={styles.messageBody}>
        <div className={styles.messageHeader}>
          <span className={styles.messageName}>{user.name}</span>
          <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
        </div>
        <div className={styles.messageContent}>{renderContent(message.content)}</div>
        <ReactionBar
          reactions={message.reactions}
          currentUserId={currentUserId}
          onToggle={(emoji) => onToggleReaction(message.id, emoji)}
        />
        {message.replyCount > 0 && onOpenThread && (
          <button
            className={styles.threadIndicator}
            onClick={() => onOpenThread(message.id)}
          >
            <span className={styles.threadAvatars}>
              {threadAvatarUsers.length > 0
                ? threadAvatarUsers.map((u) => (
                    <Avatar key={u.id} name={u.name} shape="circle" size="sm" />
                  ))
                : <Avatar name={user.name} shape="circle" size="sm" />
              }
            </span>
            <span>{message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}
      </div>
      <HoverActions messageId={message.id} onOpenThread={onOpenThread} />
    </div>
  );
}
