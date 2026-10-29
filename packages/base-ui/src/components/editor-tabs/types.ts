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
  /** Set to false to keep this tab reorder-only even when the strip is detachable. Defaults to true. */
  detachable?: boolean;
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

/**
 * Release point of a tear-off. Screen coordinates are not global in every
 * webview (WebKitGTK reports them relative to the native window), so hosts that
 * place native windows can use the client point with their own window bounds.
 */
export type DetachCommit = {
  id: TabId;
  payload?: unknown;
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
};

export type AttachCommit = {
  tab: TabDescriptor;
  sourceInstanceId: string;
  insertIndex: number;
};

/** Identifies which strips can exchange tabs. Strips only accept sessions of their own type. */
export type TabDragType = string;

/** Source-side notice that a dragged tab now lives in another strip (local or in another document). */
export type TabTransferCommit = { id: TabId; targetInstanceId: string };

export type TabDragScreenPoint = { screenX: number; screenY: number };

/** Pointer position in both this document's client space and screen space. */
export type TabDragPointer = TabDragScreenPoint & { clientX: number; clientY: number };

/** Serializable form of a drag session that can cross documents. `tab.icon` is always undefined. */
export type TabDragPayload = {
  /** Icon stripped; the payload must be JSON-serializable. */
  tab: TabDescriptor;
  sourceInstanceId: string;
  dragType: TabDragType;
  ghostStyle?: Record<string, string>;
};

export type RemoteTabDropResult = { targetInstanceId: string } | null;

export type RemoteTabDragEvent =
  | {
      type: 'hover';
      sessionId: string;
      payload: TabDragPayload;
      clientX: number;
      clientY: number;
    }
  | { type: 'leave'; sessionId: string }
  | {
      type: 'drop';
      sessionId: string;
      payload: TabDragPayload;
      clientX: number;
      clientY: number;
      respond: (result: RemoteTabDropResult) => void;
    }
  | { type: 'end'; sessionId: string };

/**
 * Connects brokers in separate documents. The source side receives the pointer
 * in both client and screen space; the host decides which one maps reliably to
 * its other documents.
 */
export interface TabDragTransport {
  // Source side (this document owns the pointer):
  begin(sessionId: string, payload: TabDragPayload, pointer: TabDragPointer): void;
  move(sessionId: string, pointer: TabDragPointer): void;
  /** Ask other documents to accept the tab at `pointer`. */
  drop(sessionId: string, pointer: TabDragPointer): Promise<RemoteTabDropResult>;
  cancel(sessionId: string): void;
  // Target side: remote sessions over this document, coordinates already in this document's client space.
  subscribe(handler: (event: RemoteTabDragEvent) => void): () => void;
}

export type DragMode = 'idle' | 'reorder' | 'detach-armed';
