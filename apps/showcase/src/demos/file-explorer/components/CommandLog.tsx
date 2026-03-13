import { useState, useEffect, useRef } from 'react';
import { LuChevronDown, LuChevronRight, LuTerminal } from 'react-icons/lu';
import type { LogEntry } from '../types';
import styles from './CommandLog.module.css';

export interface CommandLogProps {
  entries: LogEntry[];
  defaultCollapsed?: boolean;
}

export function CommandLog({ entries, defaultCollapsed = true }: CommandLogProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsed && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, collapsed]);

  // Last entry for the summary line
  const lastEntry = entries[entries.length - 1];

  return (
    <div className={styles.root}>
      <button
        className={styles.toggle}
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span className={styles.toggleLeft}>
          {collapsed ? <LuChevronRight size={12} /> : <LuChevronDown size={12} />}
          <LuTerminal size={12} />
          <span className={styles.toggleLabel}>Connection Log</span>
        </span>
        {collapsed && lastEntry && (
          <span className={styles.togglePreview} data-type={lastEntry.type}>
            {lastEntry.message}
          </span>
        )}
        <span className={styles.toggleCount}>{entries.length} entries</span>
      </button>

      {!collapsed && (
        <div ref={scrollRef} className={styles.scroll}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.entry} data-type={entry.type}>
              <span className={styles.timestamp}>{entry.timestamp}</span>
              <span className={styles.label}>
                {entry.type === 'command' ? 'CMD' : 'RSP'}
              </span>
              <span className={styles.message}>{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
