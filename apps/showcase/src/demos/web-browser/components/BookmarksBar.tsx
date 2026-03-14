import { Chip } from '@omniview/base-ui';
import type { Bookmark } from '../types';
import styles from '../index.module.css';

export interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
}

export function BookmarksBar({ bookmarks, onNavigate }: BookmarksBarProps) {
  return (
    <div className={styles.bookmarksBar}>
      {bookmarks.map((bm) => (
        <Chip
          key={bm.id}
          size="sm"
          variant="ghost"
          clickable
          startDecorator={bm.favicon ? <span>{bm.favicon}</span> : undefined}
          onClick={() => onNavigate(bm.url)}
        >
          {bm.label}
        </Chip>
      ))}
    </div>
  );
}
