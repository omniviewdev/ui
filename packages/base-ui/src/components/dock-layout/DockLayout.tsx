import {
  forwardRef,
  useCallback,

  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import styles from './DockLayout.module.css';

// ─── Types ──────────────────────────────────────

export type DockDirection = 'horizontal' | 'vertical';

export interface DockTab {
  id: string;
  title: string;
  icon?: ReactNode;
  closable?: boolean;
  content: ReactNode;
}

export interface DockSplit {
  type: 'split';
  direction: DockDirection;
  children: DockNode[];
  sizes?: number[];
}

export interface DockLeaf {
  type: 'leaf';
  id: string;
  tabs: DockTab[];
  activeTab?: string;
}

export type DockNode = DockSplit | DockLeaf;

export interface DockLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** The layout tree definition. */
  layout: DockNode;
  /** Callback when layout changes (tab switches, closes, resize). */
  onLayoutChange?: (layout: DockNode) => void;
}

// ─── Layout helpers ─────────────────────────────

function updateNodeInTree(root: DockNode, nodeId: string, updater: (leaf: DockLeaf) => DockLeaf): DockNode {
  if (root.type === 'leaf') {
    return root.id === nodeId ? updater(root) : root;
  }
  return {
    ...root,
    children: root.children.map((child) => updateNodeInTree(child, nodeId, updater)),
  };
}

function removeTabFromTree(root: DockNode, leafId: string, tabId: string): DockNode | null {
  if (root.type === 'leaf') {
    if (root.id !== leafId) return root;
    const tabs = root.tabs.filter((t) => t.id !== tabId);
    if (tabs.length === 0) return null;
    const activeTab = root.activeTab === tabId ? tabs[0].id : root.activeTab;
    return { ...root, tabs, activeTab };
  }

  const children = root.children
    .map((child) => removeTabFromTree(child, leafId, tabId))
    .filter((child): child is DockNode => child != null);

  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return { ...root, children };
}

/** Find a split node by matching its children's leaf IDs structurally. */
function findSplitByIndex(root: DockNode, path: number[]): DockSplit | null {
  if (root.type === 'leaf') return null;
  if (path.length === 0) return root;
  const childIndex = path[0];
  if (childIndex >= root.children.length) return null;
  return findSplitByIndex(root.children[childIndex], path.slice(1));
}

/** Build a path from root to the split that contains the given leaf IDs at divider position. */
function findSplitPath(root: DockNode, splitId: string): number[] | null {
  if (root.type === 'leaf') return null;
  if (getSplitId(root) === splitId) return [];
  for (let i = 0; i < root.children.length; i++) {
    const childPath = findSplitPath(root.children[i], splitId);
    if (childPath != null) return [i, ...childPath];
  }
  return null;
}

/** Generate a stable identity for a split based on its leaf descendants. */
function getSplitId(node: DockSplit): string {
  return node.children.map((child) => {
    if (child.type === 'leaf') return child.id;
    return `[${getSplitId(child)}]`;
  }).join(',');
}

function updateSizesByPath(root: DockNode, path: number[], newSizes: number[]): DockNode {
  if (root.type === 'leaf') return root;
  if (path.length === 0) {
    return { ...root, sizes: newSizes };
  }
  const idx = path[0];
  return {
    ...root,
    children: root.children.map((child, i) =>
      i === idx ? updateSizesByPath(child, path.slice(1), newSizes) : child,
    ),
  };
}

// ─── Internal Components ────────────────────────

interface DockDividerProps {
  direction: DockDirection;
  onDrag: (delta: number) => void;
}

function DockDivider({ direction, onDrag }: DockDividerProps) {
  const dragging = useRef(false);
  const lastPos = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragging.current = true;
      lastPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
      const target = e.target as HTMLElement;
      if (target.setPointerCapture) {
        target.setPointerCapture(e.pointerId);
      }
    },
    [direction],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - lastPos.current;
      lastPos.current = currentPos;
      onDrag(delta);
    },
    [direction, onDrag],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      className={styles.Divider}
      data-ov-direction={direction}
      role="separator"
      aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}

interface DockTabBarProps {
  tabs: DockTab[];
  activeTab: string;
  leafId: string;
  onTabClick: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
}

function DockTabBar({ tabs, activeTab, leafId, onTabClick, onTabClose }: DockTabBarProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent, currentIndex: number) => {
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }
      if (nextIndex !== currentIndex) {
        onTabClick(tabs[nextIndex].id);
      }
    },
    [tabs, onTabClick],
  );

  return (
    <div className={styles.TabBar} role="tablist">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const panelId = `dock-panel-${leafId}`;
        const tabElId = `dock-tab-${leafId}-${tab.id}`;

        return (
          <div
            key={tab.id}
            id={tabElId}
            className={styles.Tab}
            role="tab"
            aria-label={tab.title}
            aria-selected={isActive}
            aria-controls={isActive ? panelId : undefined}
            data-ov-active={isActive || undefined}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabClick(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTabClick(tab.id);
              } else {
                handleKeyDown(e, index);
              }
            }}
          >
            {tab.icon && <span className={styles.TabIcon}>{tab.icon}</span>}
            <span className={styles.TabTitle}>{tab.title}</span>
            {tab.closable !== false && onTabClose && (
              <button
                className={styles.TabClose}
                aria-label={`Close ${tab.title}`}
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface DockLeafContainerProps {
  leaf: DockLeaf;
  onTabClick: (leafId: string, tabId: string) => void;
  onTabClose: (leafId: string, tabId: string) => void;
}

function DockLeafContainer({ leaf, onTabClick, onTabClose }: DockLeafContainerProps) {
  const activeTabId = leaf.activeTab ?? leaf.tabs[0]?.id ?? '';
  const activeContent = leaf.tabs.find((t) => t.id === activeTabId)?.content;
  const panelId = `dock-panel-${leaf.id}`;
  const activeTabElId = `dock-tab-${leaf.id}-${activeTabId}`;

  return (
    <div className={styles.Leaf} data-ov-leaf-id={leaf.id}>
      <DockTabBar
        tabs={leaf.tabs}
        activeTab={activeTabId}
        leafId={leaf.id}
        onTabClick={(tabId) => onTabClick(leaf.id, tabId)}
        onTabClose={(tabId) => onTabClose(leaf.id, tabId)}
      />
      <div
        id={panelId}
        className={styles.Panel}
        role="tabpanel"
        aria-labelledby={activeTabElId}
      >
        {activeContent}
      </div>
    </div>
  );
}

interface DockSplitContainerProps {
  node: DockSplit;
  onTabClick: (leafId: string, tabId: string) => void;
  onTabClose: (leafId: string, tabId: string) => void;
  onDividerDrag: (splitId: string, direction: DockDirection, dividerIndex: number, delta: number) => void;
}

function DockSplitContainer({ node, onTabClick, onTabClose, onDividerDrag }: DockSplitContainerProps) {
  const count = node.children.length;
  const sizes = node.sizes ?? Array(count).fill(1);
  const total = sizes.reduce((a, b) => a + b, 0);
  const fractions = sizes.map((s) => `${s / total}fr`);
  const splitId = getSplitId(node);

  const gridStyle: CSSProperties =
    node.direction === 'horizontal'
      ? { gridTemplateColumns: fractions.join(' auto ') }
      : { gridTemplateRows: fractions.join(' auto ') };

  return (
    <div
      className={styles.Split}
      data-ov-direction={node.direction}
      style={gridStyle}
    >
      {node.children.map((child, i) => (
        <DockNodeRenderer
          key={i}
          node={child}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onDividerDrag={onDividerDrag}
          dividerBefore={
            i > 0 ? (
              <DockDivider
                direction={node.direction}
                onDrag={(delta) => onDividerDrag(splitId, node.direction, i - 1, delta)}
              />
            ) : null
          }
        />
      ))}
    </div>
  );
}

interface DockNodeRendererProps {
  node: DockNode;
  onTabClick: (leafId: string, tabId: string) => void;
  onTabClose: (leafId: string, tabId: string) => void;
  onDividerDrag: (splitId: string, direction: DockDirection, dividerIndex: number, delta: number) => void;
  dividerBefore?: ReactNode;
}

function DockNodeRenderer({ node, onTabClick, onTabClose, onDividerDrag, dividerBefore }: DockNodeRendererProps) {
  return (
    <>
      {dividerBefore}
      {node.type === 'leaf' ? (
        <DockLeafContainer leaf={node} onTabClick={onTabClick} onTabClose={onTabClose} />
      ) : (
        <DockSplitContainer node={node} onTabClick={onTabClick} onTabClose={onTabClose} onDividerDrag={onDividerDrag} />
      )}
    </>
  );
}

// ─── Main Component ─────────────────────────────

const DockLayoutRoot = forwardRef<HTMLDivElement, DockLayoutProps>(
  function DockLayoutRoot({ className, layout, onLayoutChange, ...props }, ref) {
    const [internalLayout, setInternalLayout] = useState(layout);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use controlled layout if onLayoutChange is provided, otherwise internal state
    const currentLayout = onLayoutChange ? layout : internalLayout;

    const emitChange = useCallback(
      (newLayout: DockNode) => {
        if (onLayoutChange) {
          onLayoutChange(newLayout);
        } else {
          setInternalLayout(newLayout);
        }
      },
      [onLayoutChange],
    );

    const handleTabClick = useCallback(
      (leafId: string, tabId: string) => {
        const newLayout = updateNodeInTree(currentLayout, leafId, (leaf) => ({
          ...leaf,
          activeTab: tabId,
        }));
        emitChange(newLayout);
      },
      [currentLayout, emitChange],
    );

    const handleTabClose = useCallback(
      (leafId: string, tabId: string) => {
        const newLayout = removeTabFromTree(currentLayout, leafId, tabId);
        if (newLayout) {
          emitChange(newLayout);
        }
      },
      [currentLayout, emitChange],
    );

    const handleDividerDrag = useCallback(
      (splitId: string, direction: DockDirection, dividerIndex: number, delta: number) => {
        const container = containerRef.current;
        if (!container) return;

        // Use direction-aware container dimension
        const containerSize = direction === 'horizontal'
          ? container.offsetWidth
          : container.offsetHeight;

        if (containerSize === 0) return;

        // Find the split by its structural ID
        const path = findSplitPath(currentLayout, splitId);
        if (path == null) return;

        const split = findSplitByIndex(currentLayout, path);
        if (!split) return;

        const count = split.children.length;
        const existingSizes = split.sizes ?? Array(count).fill(1);
        const total = existingSizes.reduce((a, b) => a + b, 0);
        const deltaFraction = (delta / containerSize) * total;

        const newSizes = [...existingSizes];
        const minFraction = 0.05 * total;

        newSizes[dividerIndex] = Math.max(minFraction, newSizes[dividerIndex] + deltaFraction);
        newSizes[dividerIndex + 1] = Math.max(minFraction, newSizes[dividerIndex + 1] - deltaFraction);

        const newLayout = updateSizesByPath(currentLayout, path, newSizes);
        emitChange(newLayout);
      },
      [currentLayout, emitChange],
    );

    // Merge refs
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref],
    );

    return (
      <div ref={setRefs} className={cn(styles.Root, className)} {...props}>
        <DockNodeRenderer
          node={currentLayout}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onDividerDrag={handleDividerDrag}
        />
      </div>
    );
  },
);

DockLayoutRoot.displayName = 'DockLayout';

export const DockLayout = DockLayoutRoot;
