import type { SidebarActions, SidebarMode, SidebarSnapshot } from './types';

const DISCONNECTED: SidebarSnapshot = {
  id: '',
  mode: 'expanded',
  peeking: false,
  collapsed: false,
  shortcut: false,
};

const NO_ACTIONS: SidebarActions = {
  setMode: () => {},
  toggle: () => {},
};

/**
 * Observes and controls one `Sidebar.Root` from anywhere, including outside its subtree.
 * Create one with `Sidebar.createController()` or `useSidebarController()`, pass it to
 * `Sidebar.Root`, then hand it to triggers and `useSidebar`. Until a root mounts it reports
 * an expanded, disconnected sidebar and ignores actions.
 */
export class SidebarController {
  private snapshot: SidebarSnapshot = DISCONNECTED;
  private actions: SidebarActions = NO_ACTIONS;
  private readonly listeners = new Set<() => void>();

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  readonly getSnapshot = (): SidebarSnapshot => this.snapshot;

  readonly setMode = (mode: SidebarMode): void => {
    this.actions.setMode(mode);
  };

  readonly toggle = (): void => {
    this.actions.toggle();
  };

  /** @internal Called by `Sidebar.Root` after every committed state change. */
  publish(snapshot: SidebarSnapshot, actions: SidebarActions): void {
    if (this.snapshot === snapshot && this.actions === actions) return;
    this.snapshot = snapshot;
    this.actions = actions;
    this.emit();
  }

  /** @internal Called when the owning `Sidebar.Root` unmounts. */
  reset(): void {
    if (this.snapshot === DISCONNECTED) return;
    this.snapshot = DISCONNECTED;
    this.actions = NO_ACTIONS;
    this.emit();
  }

  private emit(): void {
    for (const listener of [...this.listeners]) listener();
  }
}

export function createSidebarController(): SidebarController {
  return new SidebarController();
}
