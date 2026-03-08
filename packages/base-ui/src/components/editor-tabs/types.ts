import type { ReactNode } from 'react';

export type TabId = string;
export type TabGroupId = string;

export type TabDescriptor = {
  id: TabId;
  title: string;
  icon?: ReactNode;
  dirty?: boolean;
  disabled?: boolean;
  closable?: boolean;
  pinned?: boolean;
  groupId?: TabGroupId | null;
  payload?: unknown;
};

export type TabGroupDescriptor = {
  id: TabGroupId;
  title?: string;
  color?: string;
  fg?: string;
  collapsed?: boolean;
};

export type TabSegments = {
  pinned: TabDescriptor[];
  groups: Array<{ group: TabGroupDescriptor; tabs: TabDescriptor[] }>;
  ungrouped: TabDescriptor[];
};

export type ReorderMeta = {
  id: TabId;
  from: number;
  to: number;
};

export type DetachCommit = {
  id: TabId;
  payload?: unknown;
  screenX: number;
  screenY: number;
};

export type DragMode = 'idle' | 'reorder' | 'detach-armed';
