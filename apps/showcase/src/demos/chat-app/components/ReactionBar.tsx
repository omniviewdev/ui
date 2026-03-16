// apps/showcase/src/demos/chat-app/components/ReactionBar.tsx
import { LuSmilePlus } from 'react-icons/lu';
import type { Reaction } from '../types';
import styles from '../index.module.css';

export interface ReactionBarProps {
  reactions: Reaction[];
  currentUserId: string;
  onToggle: (emoji: string) => void;
}

export function ReactionBar({ reactions, currentUserId, onToggle }: ReactionBarProps) {
  if (reactions.length === 0) return null;

  return (
    <div className={styles.reactions}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          className={styles.reaction}
          data-active={r.userIds.includes(currentUserId) ? '' : undefined}
          onClick={() => onToggle(r.emoji)}
        >
          <span>{r.emoji}</span>
          <span>{r.userIds.length}</span>
        </button>
      ))}
      <button className={styles.reactionAdd} onClick={() => onToggle('👍')}>
        <LuSmilePlus size={12} />
      </button>
    </div>
  );
}
