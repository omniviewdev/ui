import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
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

function updateSizesInTree(
  root: DockNode,
  splitChildren: DockNode[],
  newSizes: number[],
): DockNode {
  if (root.type === 'leaf') return root;
  if (root.children === splitChildren) {
    return { ...root, sizes: newSizes };
  }
  return {
    ...root,
    children: root.children.map((child) => updateSizesInTree(child, splitChildren, newSizes)),
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
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
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
  onTabClick: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
}

function DockTabBar({ tabs, activeTab, onTabClick, onTabClose }: DockTabBarProps) {
  return (
    <div className={styles.TabBar} role="tablist">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={styles.Tab}
          role="tab"
          aria-label={tab.title}
          aria-selected={tab.id === activeTab}
          data-ov-active={tab.id === activeTab || undefined}
          tabIndex={tab.id === activeTab ? 0 : -1}
          onClick={() => onTabClick(tab.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTabClick(tab.id);
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
      ))}
    </div>
  );
}

interface DockLeafContainerProps {
  leaf: DockLeaf;
  onTabClick: (leafId: string, tabId: string) => void;
  onTabClose: (leafId: string, tabId: string) => void;
}

function DockLeafContainer({ leaf, onTabClick, onTabClose }: DockLeafContainerProps) {
  const activeTabId = leaf.activeTab ?? leaf.tabs[0]?.id;
  const activeContent = leaf.tabs.find((t) => t.id === activeTabId)?.content;

  return (
    <div className={styles.Leaf} data-ov-leaf-id={leaf.id}>
      <DockTabBar
        tabs={leaf.tabs}
        activeTab={activeTabId}
        onTabClick={(tabId) => onTabClick(leaf.id, tabId)}
        onTabClose={(tabId) => onTabClose(leaf.id, tabId)}
      />
      <div className={styles.Panel} role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
}

interface DockSplitContainerProps {
  node: DockSplit;
  onTabClick: (leafId: string, tabId: string) => void;
  onTabClose: (leafId: string, tabId: string) => void;
  onDividerDrag: (splitChildren: DockNode[], dividerIndex: number, delta: number) => void;
}

function DockSplitContainer({ node, onTabClick, onTabClose, onDividerDrag }: DockSplitContainerProps) {
  const count = node.children.length;
  const sizes = node.sizes ?? Array(count).fill(1);
  const total = sizes.reduce((a, b) => a + b, 0);
  const fractions = sizes.map((s) => `${s / total}fr`);

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
                onDrag={(delta) => onDividerDrag(node.children, i - 1, delta)}
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
  onDividerDrag: (splitChildren: DockNode[], dividerIndex: number, delta: number) => void;
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
      (splitChildren: DockNode[], dividerIndex: number, delta: number) => {
        // Find the parent split node containing these children and adjust sizes
        const container = containerRef.current ?? (ref as React.RefObject<HTMLDivElement>)?.current;
        if (!container) return;

        const containerSize =
          // Determine size based on direction by finding the split in the tree
          container.offsetWidth; // Simplified: use container width for horizontal

        const count = splitChildren.length;
        const currentSizes = Array(count).fill(1);

        // Find existing sizes from the tree
        function findSizes(node: DockNode): number[] | null {
          if (node.type === 'leaf') return null;
          if (node.children === splitChildren) return node.sizes ?? Array(count).fill(1);
          for (const child of node.children) {
            const result = findSizes(child);
            if (result) return result;
          }
          return null;
        }

        const existingSizes = findSizes(currentLayout) ?? currentSizes;
        const total = existingSizes.reduce((a, b) => a + b, 0);
        const deltaFraction = (delta / containerSize) * total;

        const newSizes = [...existingSizes];
        const minFraction = 0.05 * total;

        newSizes[dividerIndex] = Math.max(minFraction, newSizes[dividerIndex] + deltaFraction);
        newSizes[dividerIndex + 1] = Math.max(minFraction, newSizes[dividerIndex + 1] - deltaFraction);

        const newLayout = updateSizesInTree(currentLayout, splitChildren, newSizes);
        emitChange(newLayout);
      },
      [currentLayout, emitChange, ref],
    );

    return (
      <div ref={ref ?? containerRef} className={cn(styles.Root, className)} {...props}>
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
