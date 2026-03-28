import '@omniviewdev/editors/styles.css';
import { setupMonacoWorkers } from '@omniviewdev/editors';
setupMonacoWorkers();

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ResizableSplitPane,
  EditorTabs,
  Tabs,
} from '@omniviewdev/base-ui';
import type { TabDescriptor } from '@omniviewdev/base-ui';
import {
  CodeEditor,
  DiffViewer,
  MarkdownPreview,
  Terminal,
  CommandPalette,
} from '@omniviewdev/editors';
import type { TerminalHandle, CommandItem } from '@omniviewdev/editors';

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
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
      const idx = prev.findIndex((t) => t.id === tabId);
      const next = prev.filter((t) => t.id !== tabId);
      setActiveTabId((current) => {
        if (current !== tabId) return current;
        if (next.length === 0) return '';
        const nextIdx = Math.min(idx, next.length - 1);
        return next[nextIdx]?.id ?? '';
      });
      return next;
    });
  }, []);

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
                  bordered={false}
                />
              )}
              {activeTab?.type === 'diff' && activeTab.originalContent != null && (
                <DiffViewer
                  key={activeTab.id}
                  original={activeTab.originalContent}
                  modified={activeTab.file.content}
                  language={activeTab.file.language}
                  mode="side-by-side"
                  bordered={false}
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
              <div className={styles.panelArea}>
                <Tabs.Root variant="flat" size="sm" defaultValue="terminal">
                  <Tabs.List>
                    <Tabs.Tab value="terminal">Terminal</Tabs.Tab>
                    <Tabs.Tab value="problems">Problems</Tabs.Tab>
                    <Tabs.Tab value="output">Output</Tabs.Tab>
                    <Tabs.Indicator />
                  </Tabs.List>
                </Tabs.Root>
                <div className={styles.terminalWrapper}>
                  <Terminal
                    ref={terminalRef}
                    disableStdin
                    convertEol
                    onReady={() => {
                      terminalRef.current?.write(terminalOutput);
                    }}
                  />
                </div>
              </div>
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
