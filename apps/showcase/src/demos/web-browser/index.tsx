import { useCallback, useMemo } from 'react';
import { LuPlus } from 'react-icons/lu';
import { EditorTabs, IconButton, Progress } from '@omniview/base-ui';
import type { TabDescriptor, ReorderMeta } from '@omniview/base-ui';
import { useBrowser } from './hooks/useBrowser';
import { BrowserToolbar } from './components/BrowserToolbar';
import { BookmarksBar } from './components/BookmarksBar';
import { BrowserViewport } from './components/BrowserViewport';
import { DEFAULT_BOOKMARKS } from './data';
import styles from './index.module.css';

export default function WebBrowser() {
  const browser = useBrowser();

  // Map BrowserTab[] → TabDescriptor[] for EditorTabs
  const tabDescriptors: TabDescriptor[] = useMemo(
    () =>
      browser.tabs.map((t) => ({
        id: t.id,
        title: t.title,
        icon: t.favicon ? <span>{t.favicon}</span> : undefined,
        closable: true,
      })),
    [browser.tabs],
  );

  // Handle tab reorder from EditorTabs
  const handleReorder = useCallback(
    (nextTabs: TabDescriptor[], _meta: ReorderMeta) => {
      browser.reorderTabs(nextTabs.map((t) => t.id));
    },
    [browser.reorderTabs],
  );

  const handleNewTab = useCallback(() => {
    browser.addTab();
  }, [browser.addTab]);

  return (
    <div className={styles.browser}>
      {/* Tab bar with + button */}
      <div className={styles.tabBar}>
        <EditorTabs
          tabs={tabDescriptors}
          activeId={browser.activeTabId}
          onActiveChange={browser.setActiveTab}
          onCloseTab={browser.closeTab}
          onReorder={handleReorder}
          variant="pill"
          size="sm"
          className={styles.tabStrip}
        />
        <IconButton
          variant="ghost"
          size="sm"
          dense
          aria-label="New tab"
          onClick={handleNewTab}
          className={styles.newTabButton}
        >
          <LuPlus size={14} />
        </IconButton>
      </div>

      {/* Navigation toolbar */}
      <BrowserToolbar
        url={browser.activeTab.url}
        canGoBack={browser.canGoBack}
        canGoForward={browser.canGoForward}
        onNavigate={browser.navigate}
        onBack={browser.goBack}
        onForward={browser.goForward}
        onRefresh={browser.refresh}
      />

      {/* Bookmarks bar */}
      <BookmarksBar
        bookmarks={DEFAULT_BOOKMARKS}
        onNavigate={browser.navigate}
      />

      {/* Loading indicator */}
      {browser.activeTab.loading && (
        <Progress size="sm" color="brand" className={styles.loadingBar} />
      )}

      {/* Content area */}
      <BrowserViewport
        tab={browser.activeTab}
        onNavigate={browser.navigate}
        onFrameLoad={browser.onFrameLoad}
        onFrameError={browser.onFrameError}
        onNewTab={handleNewTab}
      />
    </div>
  );
}
