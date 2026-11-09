import { createContext, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { createSidebarController, type SidebarController } from './controller';
import { useIsApplePlatform } from './shortcut';
import type { SidebarActions, SidebarSnapshot, SidebarState, SidebarTriggerState } from './types';

/** Internal per-root value: public state plus layout facts the parts need. */
export interface SidebarContextValue extends SidebarSnapshot, SidebarActions {
  hoverPeek: boolean;
  /** The panel element. Edge handles portal into it so they can straddle its clipped edge. */
  panelElement: HTMLElement | null;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebarContext(part: string): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) throw new Error(`${part} must be rendered inside <Sidebar.Root>`);
  return context;
}

const subscribeToNothing = () => () => {};
const noSnapshot = (): SidebarSnapshot | null => null;

interface SidebarSource {
  snapshot: SidebarSnapshot;
  actions: SidebarActions;
}

/** Reads the nearest root, or the given controller when the caller sits outside the root. */
function useSidebarSource(controller?: SidebarController): SidebarSource {
  const context = useContext(SidebarContext);
  const external = useSyncExternalStore<SidebarSnapshot | null>(
    controller ? controller.subscribe : subscribeToNothing,
    controller ? controller.getSnapshot : noSnapshot,
    controller ? controller.getSnapshot : noSnapshot,
  );
  const snapshot = controller ? external : context;
  const actions = controller ?? context;
  const source = useMemo(
    () => (snapshot && actions ? { snapshot, actions } : null),
    [snapshot, actions],
  );
  if (!source) {
    throw new Error('useSidebar must be used inside <Sidebar.Root> or be given a controller');
  }
  return source;
}

/**
 * Sidebar state and actions for consumer-owned controls. Inside `Sidebar.Root` no argument is
 * needed; elsewhere pass the controller that was given to the root.
 */
export function useSidebar(controller?: SidebarController): SidebarState {
  const { snapshot, actions } = useSidebarSource(controller);
  const { id, mode, collapsed, peeking } = snapshot;
  const { setMode, toggle } = actions;
  return useMemo(
    () => ({ id, mode, collapsed, peeking, setMode, toggle }),
    [id, mode, collapsed, peeking, setMode, toggle],
  );
}

/** Stable controller for consumers that keep it in component state. */
export function useSidebarController(): SidebarController {
  const [controller] = useState(createSidebarController);
  return controller;
}

/** Everything a button needs to behave like the built-in trigger, handle and toggle. */
export function useSidebarTrigger(controller?: SidebarController): SidebarTriggerState {
  const { snapshot, actions } = useSidebarSource(controller);
  const apple = useIsApplePlatform();
  const { id, mode, collapsed, peeking, shortcut } = snapshot;
  const { setMode, toggle } = actions;
  return useMemo(() => {
    const expanded = mode === 'expanded';
    const label = expanded ? 'Collapse sidebar' : peeking ? 'Pin open sidebar' : 'Expand sidebar';
    const text = expanded ? 'Collapse' : peeking ? 'Pin open' : 'Expand';
    return {
      id,
      mode,
      collapsed,
      peeking,
      setMode,
      toggle,
      label,
      text,
      expanded,
      shortcut,
      props: {
        type: 'button' as const,
        'aria-label': label,
        'aria-expanded': expanded,
        'aria-controls': id || undefined,
        'aria-keyshortcuts': shortcut ? (apple ? 'Meta+B' : 'Control+B') : undefined,
        onClick: toggle,
      },
    };
  }, [id, mode, collapsed, peeking, shortcut, apple, setMode, toggle]);
}
