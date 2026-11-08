import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react';
import type { useRender } from '@base-ui/react/use-render';
import type { Key } from '../tree-list/types';
import type { SidebarController } from './controller';

/** `expanded` reserves the full sidebar width; `rail` reserves only the icon rail. */
export type SidebarMode = 'expanded' | 'rail';

/** Immutable state published by a mounted `Sidebar.Root`. */
export interface SidebarSnapshot {
  readonly id: string;
  readonly mode: SidebarMode;
  /** True while a hover peek overlays the expanded panel above the rail. Never a saved mode. */
  readonly peeking: boolean;
  /** `mode === 'rail' && !peeking`: the presentation that shows only icons. */
  readonly collapsed: boolean;
  /** Whether Cmd/Ctrl+B is registered for this sidebar. */
  readonly shortcut: boolean;
}

export interface SidebarActions {
  /** Explicit mode change. Pins the sidebar open when called with `expanded` while peeking. */
  setMode: (mode: SidebarMode) => void;
  /** `expanded` becomes `rail`; `rail` (including a peek) becomes `expanded`. */
  toggle: () => void;
}

export interface SidebarState extends SidebarActions {
  id: string;
  mode: SidebarMode;
  collapsed: boolean;
  peeking: boolean;
}

export interface SidebarRootProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Controlled mode. `onModeChange` fires only for explicit changes, never for a hover peek. */
  mode?: SidebarMode;
  defaultMode?: SidebarMode;
  onModeChange?: (mode: SidebarMode) => void;
  /** Number = px. Strings may be any CSS length or var()/calc()/clamp()/min()/max() expression. */
  expandedWidth?: number | string;
  railWidth?: number | string;
  /** Opt in to overlaying the expanded panel after a short hover intent over the rail. */
  hoverPeek?: boolean;
  /** Register Cmd/Ctrl+B. Ignored inside editors, inputs and hidden or inert sidebars. */
  shortcut?: boolean;
  /** Lets triggers and `useSidebar` outside this subtree observe and control the sidebar. */
  controller?: SidebarController;
  children?: ReactNode;
}

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Slot whose children are shown only in one presentation; the other presentation is inert. */
export interface SidebarSlotProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface SidebarTriggerProps extends useRender.ComponentProps<'button'> {
  controller?: SidebarController;
}

export type SidebarHandleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;

export interface SidebarToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Show the Cmd/Ctrl+B hint. Defaults to whether the sidebar registered the shortcut. */
  showShortcut?: boolean;
}

/** Props to spread onto a consumer-owned button so it behaves like `Sidebar.Trigger`. */
export interface SidebarTriggerBindings {
  type: 'button';
  'aria-label': string;
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  'aria-keyshortcuts': string | undefined;
  onClick: () => void;
}

export interface SidebarTriggerState extends SidebarState {
  /** Accessible action name: Collapse sidebar, Expand sidebar or Pin open sidebar. */
  label: string;
  /** Visible short action text: Collapse, Expand or Pin open. */
  text: string;
  /** Whether the saved mode is `expanded`. */
  expanded: boolean;
  /** Whether Cmd/Ctrl+B is registered. */
  shortcut: boolean;
  /** Spread these onto a custom button. */
  props: SidebarTriggerBindings;
}

export interface SidebarNavigationProps<TItem> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'color' | 'onSelect'
> {
  items: readonly TItem[];
  itemKey: (item: TItem) => Key;
  /** Children when loaded; empty or undefined means a destination. */
  getChildren: (item: TItem) => readonly TItem[] | undefined;
  getTextValue: (item: TItem) => string;
  /** Missing icons on rail rows fall back to the label's initial. */
  getIcon?: (item: TItem) => ReactNode;
  /** Status node for rail icons and flyout rows. Nodes that render null reserve no space. */
  getBadge?: (item: TItem) => ReactNode;
  /** Label before the first item of a section; renders a named, non-interactive rail divider. */
  getSectionLabel?: (item: TItem) => string | undefined;
  /** Defaults to items without children. Selectable groups get an explicit "Open" flyout row. */
  isItemSelectable?: (item: TItem) => boolean;
  /** Label for the explicit group destination row. Defaults to `Open {text}`. */
  getOpenLabel?: (item: TItem) => string;
  selectedKey?: Key | null;
  disabledKeys?: Iterable<Key>;
  /** Fires for rail destinations only; never for opening or closing a group. */
  onAction?: (key: Key, item: TItem) => void;
  /** Labels the rail list. */
  'aria-label'?: string;
  ref?: Ref<HTMLDivElement>;
  /** The expanded presentation, typically a TreeList. It stays mounted while collapsed. */
  children?: ReactNode;
}
