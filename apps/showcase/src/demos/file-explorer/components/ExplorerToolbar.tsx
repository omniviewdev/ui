import {
  LuArrowLeft,
  LuArrowRight,
  LuArrowUp,
  LuCopy,
  LuFolderPlus,
  LuMove,
  LuTrash2,
} from 'react-icons/lu';
import { IconButton, SearchInput, Toolbar, useToast } from '@omniviewdev/base-ui';
import styles from './ExplorerToolbar.module.css';

export interface ExplorerToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasSelection: boolean;
}

export function ExplorerToolbar({ searchQuery, onSearchChange, hasSelection }: ExplorerToolbarProps) {
  const { toast } = useToast();

  const handleAction = (label: string) => {
    toast(`${label} completed`, { severity: 'success' });
  };

  return (
    <Toolbar size="sm" className={styles.toolbar}>
      <Toolbar.Group>
        <IconButton
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Back"
          onClick={() => handleAction('Back')}
        >
          <LuArrowLeft aria-hidden />
        </IconButton>
        <IconButton
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Forward"
          onClick={() => handleAction('Forward')}
        >
          <LuArrowRight aria-hidden />
        </IconButton>
        <IconButton
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Up"
          onClick={() => handleAction('Up')}
        >
          <LuArrowUp aria-hidden />
        </IconButton>
      </Toolbar.Group>

      <Toolbar.Group className={styles.searchGroup}>
        <SearchInput
          value={searchQuery}
          onValueChange={onSearchChange}
          placeholder="Search files…"
          size="sm"
          variant="outline"
        />
      </Toolbar.Group>

      <Toolbar.Group separator>
        <IconButton
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Copy"
          disabled={!hasSelection}
          onClick={() => handleAction('Copy')}
        >
          <LuCopy aria-hidden />
        </IconButton>
        <IconButton
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Move"
          disabled={!hasSelection}
          onClick={() => handleAction('Move')}
        >
          <LuMove aria-hidden />
        </IconButton>
        <IconButton
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="Delete"
          disabled={!hasSelection}
          onClick={() => handleAction('Delete')}
        >
          <LuTrash2 aria-hidden />
        </IconButton>
        <IconButton
          variant="ghost"
          color="neutral"
          size="sm"
          aria-label="New Folder"
          onClick={() => handleAction('New Folder')}
        >
          <LuFolderPlus aria-hidden />
        </IconButton>
      </Toolbar.Group>
    </Toolbar>
  );
}
