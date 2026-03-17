import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { BrowserTab } from '../types';
import { NEW_TAB_URL, domainFromUrl } from '../data';

let nextId = 1;
function makeId(): string {
  return `tab-${nextId++}`;
}

function createTab(url: string = NEW_TAB_URL): BrowserTab {
  return {
    id: makeId(),
    title: url === NEW_TAB_URL ? 'New Tab' : domainFromUrl(url),
    url,
    loading: url !== NEW_TAB_URL,
    history: [url],
    historyIndex: 0,
  };
}

const INITIAL_TAB = createTab();

export interface UseBrowserReturn {
  tabs: BrowserTab[];
  activeTab: BrowserTab;
  activeTabId: string;

  addTab: (url?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (orderedIds: string[]) => void;

  navigate: (url: string) => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  canGoBack: boolean;
  canGoForward: boolean;

  onFrameLoad: () => void;
  onFrameError: () => void;
}

const BLOCKED_TIMEOUT_MS = 5000;

export function useBrowser(): UseBrowserReturn {
  const [tabs, setTabs] = useState<BrowserTab[]>([INITIAL_TAB]);
  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_TAB.id);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? tabs[0] ?? INITIAL_TAB,
    [tabs, activeTabId],
  );

  const updateActiveTab = useCallback(
    (updater: (tab: BrowserTab) => BrowserTab) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? updater(t) : t)),
      );
    },
    [activeTabId],
  );

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startBlockedTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateActiveTab((t) =>
        t.loading ? { ...t, loading: false, error: 'blocked' as const } : t,
      );
    }, BLOCKED_TIMEOUT_MS);
  }, [updateActiveTab]);

  const navigate = useCallback(
    (url: string) => {
      updateActiveTab((t) => {
        // Truncate forward history
        const trimmedHistory = t.history.slice(0, t.historyIndex + 1);
        return {
          ...t,
          url,
          title: domainFromUrl(url),
          loading: url !== NEW_TAB_URL,
          error: undefined,
          history: [...trimmedHistory, url],
          historyIndex: trimmedHistory.length,
        };
      });
      if (url !== NEW_TAB_URL) startBlockedTimeout();
    },
    [updateActiveTab, startBlockedTimeout],
  );

  const goBack = useCallback(() => {
    let targetUrl = '';
    updateActiveTab((t) => {
      if (t.historyIndex <= 0) return t;
      const newIndex = t.historyIndex - 1;
      const url = t.history[newIndex]!;
      targetUrl = url;
      return {
        ...t,
        url,
        title: domainFromUrl(url),
        historyIndex: newIndex,
        loading: url !== NEW_TAB_URL,
        error: undefined,
      };
    });
    if (targetUrl && targetUrl !== NEW_TAB_URL) startBlockedTimeout();
  }, [updateActiveTab, startBlockedTimeout]);

  const goForward = useCallback(() => {
    let targetUrl = '';
    updateActiveTab((t) => {
      if (t.historyIndex >= t.history.length - 1) return t;
      const newIndex = t.historyIndex + 1;
      const url = t.history[newIndex]!;
      targetUrl = url;
      return {
        ...t,
        url,
        title: domainFromUrl(url),
        historyIndex: newIndex,
        loading: url !== NEW_TAB_URL,
        error: undefined,
      };
    });
    if (targetUrl && targetUrl !== NEW_TAB_URL) startBlockedTimeout();
  }, [updateActiveTab, startBlockedTimeout]);

  const refresh = useCallback(() => {
    updateActiveTab((t) => ({ ...t, loading: true, error: undefined }));
    startBlockedTimeout();
  }, [updateActiveTab, startBlockedTimeout]);

  const addTab = useCallback(
    (url?: string) => {
      const tab = createTab(url);
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tab.id);
    },
    [],
  );

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        // If closing the last tab, open a new one
        if (next.length === 0) {
          const newTab = createTab();
          setActiveTabId(newTab.id);
          return [newTab];
        }
        // If closing active tab, switch to neighbor
        if (id === activeTabId) {
          const closedIndex = prev.findIndex((t) => t.id === id);
          const newActive = next[Math.min(closedIndex, next.length - 1)]!;
          setActiveTabId(newActive.id);
        }
        return next;
      });
    },
    [activeTabId],
  );

  const reorderTabs = useCallback((orderedIds: string[]) => {
    setTabs((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));
      return orderedIds.map((id) => map.get(id)).filter(Boolean) as BrowserTab[];
    });
  }, []);

  const onFrameLoad = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateActiveTab((t) => ({ ...t, loading: false }));
  }, [updateActiveTab]);

  const onFrameError = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateActiveTab((t) => ({ ...t, loading: false, error: 'blocked' as const }));
  }, [updateActiveTab]);

  return {
    tabs,
    activeTab,
    activeTabId,
    addTab,
    closeTab,
    setActiveTab: setActiveTabId,
    reorderTabs,
    navigate,
    goBack,
    goForward,
    refresh,
    canGoBack: activeTab.historyIndex > 0,
    canGoForward: activeTab.historyIndex < activeTab.history.length - 1,
    onFrameLoad,
    onFrameError,
  };
}
