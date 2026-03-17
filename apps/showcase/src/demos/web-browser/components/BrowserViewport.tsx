import type { BrowserTab } from '../types';
import { NEW_TAB_URL } from '../data';
import { NewTabPage } from './NewTabPage';
import { ErrorPage } from './ErrorPage';
import styles from '../index.module.css';

export interface BrowserViewportProps {
  tab: BrowserTab;
  onNavigate: (url: string) => void;
  onFrameLoad: () => void;
  onFrameError: () => void;
  onNewTab: () => void;
}

export function BrowserViewport({
  tab,
  onNavigate,
  onFrameLoad,
  onFrameError,
  onNewTab,
}: BrowserViewportProps) {
  // Key forces iframe remount on URL/history change
  const iframeKey = `${tab.id}-${tab.historyIndex}`;

  if (tab.url === NEW_TAB_URL) {
    return (
      <div className={styles.viewport}>
        <NewTabPage onNavigate={onNavigate} />
      </div>
    );
  }

  if (tab.error) {
    return (
      <div className={styles.viewport}>
        <ErrorPage url={tab.url} onNewTab={onNewTab} />
      </div>
    );
  }

  return (
    <div className={styles.viewport}>
      <iframe
        key={iframeKey}
        src={tab.url}
        className={styles.iframe}
        title={tab.title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={onFrameLoad}
        onError={onFrameError}
      />
    </div>
  );
}
