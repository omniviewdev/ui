import '@omniview/editors/styles.css';
import { setupMonacoWorkers } from '@omniview/editors';
setupMonacoWorkers();

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ResizableSplitPane,
  EditorTabs,
} from '@omniview/base-ui';
import type { TabDescriptor } from '@omniview/base-ui';
import {
  CodeEditor,
  DiffViewer,
  MarkdownPreview,
  Terminal,
  CommandPalette,
} from '@omniview/editors';
import type { TerminalHandle, CommandItem } from '@omniview/editors';

import { IconStrip } from './components/IconStrip';
import { SidebarPanel } from './components/SidebarPanel';
import type { SidebarPanel as SidebarPanelType, IDETab } from './types';
import {
  projectFiles,
  initialTabs,
  terminalOutput,
  paletteCommands,
  type PaletteCommand,
} from './data';
import styles from './index.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paletteCommandToCommandItem(cmd: PaletteCommand): CommandItem {
  return {
    id: cmd.id,
    label: cmd.label,
    group: cmd.group,
  };
}

// ─── IDEEditorDemo ────────────────────────────────────────────────────────────

export default function IdeEditorDemo() {
  // Sidebar
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanelType>('files');

  // Tabs
  const [tabs, setTabs] = useState<IDETab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0]?.id ?? '');

  // Terminal
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalRef = useRef<TerminalHandle>(null);

  // Command palette
  const [showPalette, setShowPalette] = useState(false);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((p) => !p);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── Tab management ─────────────────────────────────────────────────────────

  const handleOpenFile = useCallback(
    (fileId: string) => {
      const file = projectFiles.find((f) => f.id === fileId);
      if (!file) return;

      const existingTab = tabs.find((t) => t.file.id === fileId);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      const newTab: IDETab = {
        id: `tab-${fileId}`,
        file,
        type: 'code',
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [tabs],
  );

  const handleCloseTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      return next;
    });
    setActiveTabId((current) => {
      if (current !== tabId) return current;
      const idx = tabs.findIndex((t) => t.id === tabId);
      const remaining = tabs.filter((t) => t.id !== tabId);
      if (remaining.length === 0) return '';
      const nextIdx = Math.min(idx, remaining.length - 1);
      return remaining[nextIdx]?.id ?? '';
    });
  }, [tabs]);

  // ─── Command palette ────────────────────────────────────────────────────────

  const handleCommand = useCallback((command: CommandItem) => {
    if (command.id === 'cmd-toggle-terminal') {
      setShowTerminal((v) => !v);
    }
    setShowPalette(false);
  }, []);

  // ─── Derived state ──────────────────────────────────────────────────────────

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;

  const tabDescriptors: TabDescriptor[] = tabs.map((t) => ({
    id: t.id,
    title: t.file.name,
    closable: true,
    dirty: t.type === 'diff',
  }));

  const commandItems: CommandItem[] = paletteCommands.map(paletteCommandToCommandItem);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.ide}>
      <IconStrip activePanel={sidebarPanel} onPanelChange={setSidebarPanel} />

      <ResizableSplitPane
        direction="horizontal"
        defaultSize={250}
        minSize={180}
        maxSize={400}
        handleLabel="Resize sidebar"
      >
        <SidebarPanel panel={sidebarPanel} onOpenFile={handleOpenFile} />

        <div className={styles.editorArea}>
          <EditorTabs
            tabs={tabDescriptors}
            activeId={activeTabId}
            onActiveChange={setActiveTabId}
            onCloseTab={handleCloseTab}
          />

          <ResizableSplitPane
            direction="vertical"
            defaultSize={400}
            minSize={100}
            handleLabel="Resize editor / terminal"
          >
            <div className={styles.editorContent}>
              {activeTab?.type === 'code' && (
                <CodeEditor
                  key={activeTab.id}
                  value={activeTab.file.content}
                  language={activeTab.file.language}
                  filename={activeTab.file.path}
                  readOnly
                />
              )}
              {activeTab?.type === 'diff' && activeTab.originalContent != null && (
                <DiffViewer
                  key={activeTab.id}
                  original={activeTab.originalContent}
                  modified={activeTab.file.content}
                  language={activeTab.file.language}
                  mode="side-by-side"
                />
              )}
              {activeTab?.type === 'markdown' && (
                <div className={styles.markdownWrapper}>
                  <MarkdownPreview
                    key={activeTab.id}
                    content={activeTab.file.content}
                  />
                </div>
              )}
              {activeTab == null && (
                <div className={styles.emptyEditor}>No file open</div>
              )}
            </div>

            {showTerminal ? (
              <Terminal
                ref={terminalRef}
                disableStdin
                convertEol
                onReady={() => {
                  terminalRef.current?.write(terminalOutput);
                }}
              />
            ) : (
              <div />
            )}
          </ResizableSplitPane>
        </div>
      </ResizableSplitPane>

      <CommandPalette
        open={showPalette}
        commands={commandItems}
        onSelect={handleCommand}
        onClose={() => setShowPalette(false)}
      />
    </div>
  );
}
