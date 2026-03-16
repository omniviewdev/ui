// apps/showcase/src/demos/chat-app/components/TypingIndicator.tsx
import type { User } from '../types';
import styles from '../index.module.css';

export interface TypingIndicatorProps {
  users: User[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return <div className={styles.typingIndicator} />;

  const names = users.map((u) => u.name.split(' ')[0]).join(', ');
  const verb = users.length === 1 ? 'is' : 'are';

  return (
    <div className={styles.typingIndicator}>
      <span className={styles.typingDots}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </span>
      <span>
        <strong>{names}</strong> {verb} typing…
      </span>
    </div>
  );
}
