import { useState, useCallback, type KeyboardEvent } from 'react';
import { Input } from '@omniview/base-ui';
import { LuSearch } from 'react-icons/lu';
import { SPEED_DIAL_SITES, ensureProtocol } from '../data';
import styles from '../index.module.css';

export interface NewTabPageProps {
  onNavigate: (url: string) => void;
}

export function NewTabPage({ onNavigate }: NewTabPageProps) {
  const [search, setSearch] = useState('');

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && search.trim()) {
        onNavigate(ensureProtocol(search.trim()));
      }
    },
    [search, onNavigate],
  );

  return (
    <div className={styles.newTabPage}>
      <div className={styles.newTabSearch}>
        <Input.Root size="md">
          <Input.Control
            startDecorator={<LuSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter URL"
          />
        </Input.Root>
      </div>
      <div className={styles.speedDial}>
        {SPEED_DIAL_SITES.map((site) => (
          <button
            type="button"
            key={site.id}
            className={styles.speedDialCard}
            onClick={() => onNavigate(site.url)}
          >
            <span className={styles.speedDialIcon}>{site.favicon}</span>
            <span className={styles.speedDialLabel}>{site.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
