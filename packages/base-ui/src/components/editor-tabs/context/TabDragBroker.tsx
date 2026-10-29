import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type {
  AttachCommit,
  RemoteTabDragEvent,
  TabDescriptor,
  TabDragPayload,
  TabDragPointer,
  TabDragTransport,
  TabDragType,
} from '../types';
import { DetachGhostTab } from '../DetachGhostTab';
import styles from '../EditorTabs.module.css';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export const DEFAULT_TAB_DRAG_TYPE: TabDragType = 'editor-tab';

/** How a broker session ended, reported once to the session's source. */
export type TabDragOutcome =
  | { type: 'transferred'; targetInstanceId: string }
  | ({ type: 'torn-off' } & TabDragPointer)
  | { type: 'cancelled' };

export interface TabDragSession {
  tab: TabDescriptor;
  sourceInstanceId: string;
  /** Only drop zones of the same type accept the tab. Defaults to `'editor-tab'`. */
  dragType?: TabDragType;
  ghostStyle?: React.CSSProperties;
  /** When true, releasing over no target ends in a `torn-off` outcome; otherwise it is a cancel. */
  allowTearOff?: boolean;
  /**
   * Set by the source strip. Called exactly once with how the session ended,
   * unless the session is dropped with `clearSession`.
   */
  onOutcome?: (outcome: TabDragOutcome) => void;
}

export interface DropZoneRegistration {
  instanceId: string;
  getRect: () => DOMRect | null;
  getElement: () => HTMLElement | null;
  onAttach: (commit: AttachCommit) => void;
  /** Only sessions of the same type can drop here. Defaults to `'editor-tab'`. */
  dragType?: TabDragType;
  /** Vertical padding added to the rect for the second hit-test pass. Defaults to 60. */
  expandY?: number;
}

export interface TabDragBrokerValue {
  activeSession: TabDragSession | null;
  beginSession: (session: TabDragSession, pointer: TabDragPointer) => void;
  /** Ends the session as a cancel: calls `onCancel` and reports a `cancelled` outcome. */
  cancelSession: () => void;
  /** Ends the session without calling onCancel or reporting an outcome. */
  clearSession: () => void;
  registerDropZone: (reg: DropZoneRegistration) => void;
  unregisterDropZone: (instanceId: string) => void;
  /** Zone under the pointer, for a local session or a remote session hovering this document. */
  hoverInstanceId: string | null;
  /** Insertion index within `hoverInstanceId`'s zone. */
  hoverInsertIndex: number | null;
  pointerX: number;
  pointerY: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TabDragBrokerContext = createContext<TabDragBrokerValue | null>(null);

export function useTabDragBroker(): TabDragBrokerValue | null {
  return useContext(TabDragBrokerContext);
}

// ---------------------------------------------------------------------------
// Hit-testing
// ---------------------------------------------------------------------------

/**
 * Default vertical padding added to each drop zone rect in the second hit-test
 * pass. This makes it easier to land on a thin tab strip after dragging vertically.
 */
const DEFAULT_ZONE_EXPAND_Y = 60;

function rectContainsPoint(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  expandY: number,
): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top - expandY &&
    clientY <= rect.bottom + expandY
  );
}

/**
 * Finds the zone accepting `dragType` at the point: raw rects win over rects
 * expanded by the zone's `expandY`.
 */
function findDropZoneAt(
  zones: Iterable<DropZoneRegistration>,
  clientX: number,
  clientY: number,
  dragType: TabDragType,
  excludedInstanceId: string | null,
): DropZoneRegistration | null {
  const candidates: Array<{ zone: DropZoneRegistration; rect: DOMRect }> = [];
  for (const zone of zones) {
    if (zone.instanceId === excludedInstanceId) continue;
    if ((zone.dragType ?? DEFAULT_TAB_DRAG_TYPE) !== dragType) continue;
    const rect = zone.getRect();
    if (!rect) continue;
    candidates.push({ zone, rect });
  }

  const rawHit = candidates.find(({ rect }) => rectContainsPoint(rect, clientX, clientY, 0));
  if (rawHit) return rawHit.zone;

  const expandedHit = candidates.find(({ zone, rect }) =>
    rectContainsPoint(rect, clientX, clientY, zone.expandY ?? DEFAULT_ZONE_EXPAND_Y),
  );
  return expandedHit?.zone ?? null;
}

function computeInsertIndex(zone: DropZoneRegistration, clientX: number): number {
  const el = zone.getElement();
  if (!el) return 0;

  const tabEls = el.querySelectorAll<HTMLElement>('[data-tab-id]');
  if (tabEls.length === 0) return 0;

  const sorted = Array.from(tabEls).sort(
    (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
  );

  for (let i = 0; i < sorted.length; i++) {
    const tabRect = sorted[i]!.getBoundingClientRect();
    const midpoint = tabRect.left + tabRect.width / 2;
    if (clientX < midpoint) return i;
  }
  return sorted.length;
}

function isPointInsideViewport(clientX: number, clientY: number): boolean {
  return (
    clientX >= 0 && clientY >= 0 && clientX <= window.innerWidth && clientY <= window.innerHeight
  );
}

function toTabDragPointer(event: PointerEvent): TabDragPointer {
  return {
    clientX: event.clientX,
    clientY: event.clientY,
    screenX: event.screenX,
    screenY: event.screenY,
  };
}

// ---------------------------------------------------------------------------
// Transport payload
// ---------------------------------------------------------------------------

function toGhostStyleRecord(
  style: React.CSSProperties | undefined,
): Record<string, string> | undefined {
  if (!style) return undefined;
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined || value === null) continue;
    record[key] = String(value);
  }
  return record;
}

function createTabDragPayload(session: TabDragSession, dragType: TabDragType): TabDragPayload {
  return {
    tab: { ...session.tab, icon: undefined },
    sourceInstanceId: session.sourceInstanceId,
    dragType,
    ghostStyle: toGhostStyleRecord(session.ghostStyle),
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface TabDragBrokerProviderProps {
  children: ReactNode;
  onCancel?: (session: TabDragSession) => void;
  /** Connects this document's broker to brokers in other documents (e.g. other OS windows). */
  transport?: TabDragTransport;
}

/** A session started in this document. `dropping` = released, waiting for `transport.drop`. */
interface SourceSession {
  id: string;
  session: TabDragSession;
  dragType: TabDragType;
  phase: 'dragging' | 'dropping' | 'settled';
}

interface RemoteHover {
  sessionId: string;
  payload: TabDragPayload;
}

export function TabDragBrokerProvider({
  children,
  onCancel,
  transport,
}: TabDragBrokerProviderProps) {
  const [activeSession, setActiveSession] = useState<TabDragSession | null>(null);
  const [isSourcePointerInsideViewport, setIsSourcePointerInsideViewport] = useState(true);
  const [remoteHover, setRemoteHover] = useState<RemoteHover | null>(null);
  const [hoverInstanceId, setHoverInstanceId] = useState<string | null>(null);
  const [hoverInsertIndex, setHoverInsertIndex] = useState<number | null>(null);
  const [pointerX, setPointerX] = useState(0);
  const [pointerY, setPointerY] = useState(0);

  const sourceSessionRef = useRef<SourceSession | null>(null);
  const remoteSessionIdRef = useRef<string | null>(null);
  const dropZonesRef = useRef<Map<string, DropZoneRegistration>>(new Map());
  const rafRef = useRef(0);
  const moveListenerRef = useRef<((e: PointerEvent) => void) | null>(null);
  const upListenerRef = useRef<((e: PointerEvent) => void) | null>(null);
  const keyDownListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const isMountedRef = useRef(false);
  const onCancelRef = useRef(onCancel);
  const transportRef = useRef(transport);
  useLayoutEffect(() => {
    onCancelRef.current = onCancel;
    transportRef.current = transport;
  }, [onCancel, transport]);

  const removeSourceListeners = useCallback(() => {
    if (moveListenerRef.current) {
      document.removeEventListener('pointermove', moveListenerRef.current);
      moveListenerRef.current = null;
    }
    if (upListenerRef.current) {
      document.removeEventListener('pointerup', upListenerRef.current);
      upListenerRef.current = null;
    }
    if (keyDownListenerRef.current) {
      document.removeEventListener('keydown', keyDownListenerRef.current);
      keyDownListenerRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
  }, []);

  /** Stops tracking the pointer and clears the source ghost and hover state. */
  const resetSourceDragState = useCallback(() => {
    removeSourceListeners();
    setActiveSession(null);
    setHoverInstanceId(null);
    setHoverInsertIndex(null);
  }, [removeSourceListeners]);

  /** Ends a source session, reporting the outcome exactly once. `null` ends it silently. */
  const settleSourceSession = useCallback(
    (source: SourceSession, outcome: TabDragOutcome | null) => {
      if (source.phase === 'settled') return;
      source.phase = 'settled';
      if (sourceSessionRef.current === source) sourceSessionRef.current = null;
      if (!outcome) return;
      if (outcome.type === 'cancelled') onCancelRef.current?.(source.session);
      source.session.onOutcome?.(outcome);
    },
    [],
  );

  const settleWithoutTarget = useCallback(
    (source: SourceSession, pointer: TabDragPointer) => {
      settleSourceSession(
        source,
        source.session.allowTearOff
          ? { type: 'torn-off', ...pointer }
          : { type: 'cancelled' },
      );
    },
    [settleSourceSession],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      removeSourceListeners();
      const source = sourceSessionRef.current;
      // A pending drop is left to resolve; its result is ignored once unmounted.
      if (source?.phase === 'dragging') {
        transportRef.current?.cancel(source.id);
        settleSourceSession(source, null);
      }
    };
  }, [removeSourceListeners, settleSourceSession]);

  const cancelSession = useCallback(() => {
    const source = sourceSessionRef.current;
    if (source?.phase !== 'dragging') return;
    transportRef.current?.cancel(source.id);
    resetSourceDragState();
    settleSourceSession(source, { type: 'cancelled' });
  }, [resetSourceDragState, settleSourceSession]);

  const clearSession = useCallback(() => {
    const source = sourceSessionRef.current;
    if (source?.phase !== 'dragging') return;
    transportRef.current?.cancel(source.id);
    resetSourceDragState();
    settleSourceSession(source, null);
  }, [resetSourceDragState, settleSourceSession]);

  const beginSession = useCallback(
    (session: TabDragSession, pointer: TabDragPointer) => {
      // No-op while a session is dragging or its drop is pending.
      if (sourceSessionRef.current) return;

      const dragType = session.dragType ?? DEFAULT_TAB_DRAG_TYPE;
      const source: SourceSession = {
        id: `tab-drag-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
        session,
        dragType,
        phase: 'dragging',
      };
      sourceSessionRef.current = source;
      setActiveSession(session);
      setPointerX(pointer.clientX);
      setPointerY(pointer.clientY);
      setIsSourcePointerInsideViewport(isPointInsideViewport(pointer.clientX, pointer.clientY));
      transportRef.current?.begin(source.id, createTabDragPayload(session, dragType), pointer);

      const findLocalTargetZone = (clientX: number, clientY: number) =>
        isPointInsideViewport(clientX, clientY)
          ? findDropZoneAt(
              dropZonesRef.current.values(),
              clientX,
              clientY,
              dragType,
              session.sourceInstanceId,
            )
          : null;

      const onPointerMove = (e: PointerEvent) => {
        transportRef.current?.move(source.id, toTabDragPointer(e));
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setPointerX(e.clientX);
          setPointerY(e.clientY);
          setIsSourcePointerInsideViewport(isPointInsideViewport(e.clientX, e.clientY));
          const zone = findLocalTargetZone(e.clientX, e.clientY);
          setHoverInstanceId(zone?.instanceId ?? null);
          setHoverInsertIndex(zone ? computeInsertIndex(zone, e.clientX) : null);
        });
      };

      const onPointerUp = (e: PointerEvent) => {
        // Removing the listeners first makes any further pointerup a no-op.
        resetSourceDragState();
        const pointer = toTabDragPointer(e);
        const transportAtRelease = transportRef.current;

        const zone = findLocalTargetZone(e.clientX, e.clientY);
        if (zone) {
          transportAtRelease?.cancel(source.id);
          zone.onAttach({
            tab: session.tab,
            sourceInstanceId: session.sourceInstanceId,
            insertIndex: computeInsertIndex(zone, e.clientX),
          });
          settleSourceSession(source, { type: 'transferred', targetInstanceId: zone.instanceId });
          return;
        }

        if (!transportAtRelease) {
          settleWithoutTarget(source, pointer);
          return;
        }

        source.phase = 'dropping';
        void transportAtRelease.drop(source.id, pointer).then(
          (result) => {
            if (!isMountedRef.current) {
              settleSourceSession(source, null);
              return;
            }
            if (result) {
              settleSourceSession(source, {
                type: 'transferred',
                targetInstanceId: result.targetInstanceId,
              });
            } else {
              settleWithoutTarget(source, pointer);
            }
          },
          (error: unknown) => {
            settleSourceSession(source, isMountedRef.current ? { type: 'cancelled' } : null);
            throw error;
          },
        );
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') cancelSession();
      };

      moveListenerRef.current = onPointerMove;
      upListenerRef.current = onPointerUp;
      keyDownListenerRef.current = onKeyDown;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('keydown', onKeyDown);
    },
    [cancelSession, resetSourceDragState, settleSourceSession, settleWithoutTarget],
  );

  // -------------------------------------------------------------------------
  // Target side: sessions from other documents, delivered by the transport.
  // -------------------------------------------------------------------------

  const clearRemoteHover = useCallback((sessionId: string) => {
    if (remoteSessionIdRef.current !== sessionId) return;
    remoteSessionIdRef.current = null;
    setRemoteHover(null);
    setHoverInstanceId(null);
    setHoverInsertIndex(null);
  }, []);

  const handleRemoteEvent = useCallback(
    (event: RemoteTabDragEvent) => {
      switch (event.type) {
        case 'hover': {
          const zone = findDropZoneAt(
            dropZonesRef.current.values(),
            event.clientX,
            event.clientY,
            event.payload.dragType,
            null,
          );
          remoteSessionIdRef.current = event.sessionId;
          setRemoteHover({ sessionId: event.sessionId, payload: event.payload });
          setPointerX(event.clientX);
          setPointerY(event.clientY);
          setHoverInstanceId(zone?.instanceId ?? null);
          setHoverInsertIndex(zone ? computeInsertIndex(zone, event.clientX) : null);
          return;
        }
        case 'leave':
        case 'end':
          clearRemoteHover(event.sessionId);
          return;
        case 'drop': {
          clearRemoteHover(event.sessionId);
          const zone = findDropZoneAt(
            dropZonesRef.current.values(),
            event.clientX,
            event.clientY,
            event.payload.dragType,
            null,
          );
          if (!zone) {
            event.respond(null);
            return;
          }
          zone.onAttach({
            tab: event.payload.tab,
            sourceInstanceId: event.payload.sourceInstanceId,
            insertIndex: computeInsertIndex(zone, event.clientX),
          });
          event.respond({ targetInstanceId: zone.instanceId });
          return;
        }
      }
    },
    [clearRemoteHover],
  );

  useEffect(() => {
    if (!transport) return;
    return transport.subscribe(handleRemoteEvent);
  }, [transport, handleRemoteEvent]);

  const registerDropZone = useCallback((reg: DropZoneRegistration) => {
    dropZonesRef.current.set(reg.instanceId, reg);
  }, []);

  const unregisterDropZone = useCallback((instanceId: string) => {
    dropZonesRef.current.delete(instanceId);
    setHoverInstanceId((prev) => (prev === instanceId ? null : prev));
  }, []);

  const value: TabDragBrokerValue = {
    activeSession,
    beginSession,
    cancelSession,
    clearSession,
    registerDropZone,
    unregisterDropZone,
    hoverInstanceId,
    hoverInsertIndex,
    pointerX,
    pointerY,
  };

  // The ghost lives in the document whose viewport contains the pointer.
  const ghost =
    activeSession && isSourcePointerInsideViewport
      ? { tab: activeSession.tab, style: activeSession.ghostStyle }
      : remoteHover
        ? {
            tab: remoteHover.payload.tab,
            style: remoteHover.payload.ghostStyle as React.CSSProperties | undefined,
          }
        : null;

  return (
    <TabDragBrokerContext.Provider value={value}>
      {children}
      {ghost &&
        createPortal(
          <div
            className={styles.DragBrokerGhost}
            data-tab-drag-ghost=""
            style={
              {
                '--_tab-drag-x': `${pointerX}px`,
                '--_tab-drag-y': `${pointerY}px`,
                ...ghost.style,
              } as React.CSSProperties
            }
          >
            <DetachGhostTab tab={ghost.tab} style={ghost.style} />
          </div>,
          document.body,
        )}
    </TabDragBrokerContext.Provider>
  );
}
