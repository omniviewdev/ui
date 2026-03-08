import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { AttachCommit, TabDescriptor } from '../types';
import { DetachGhostTab } from '../DetachGhostTab';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface TabDragSession {
  tab: TabDescriptor;
  sourceInstanceId: string;
  ghostStyle?: React.CSSProperties;
}

export interface DropZoneRegistration {
  instanceId: string;
  getRect: () => DOMRect | null;
  getElement: () => HTMLElement | null;
  onAttach: (commit: AttachCommit) => void;
}

export interface TabDragBrokerValue {
  activeSession: TabDragSession | null;
  beginSession: (session: TabDragSession, clientX: number, clientY: number) => void;
  cancelSession: () => void;
  /** Clears the session without calling onCancel (used when reverting mid-drag). */
  clearSession: () => void;
  registerDropZone: (reg: DropZoneRegistration) => void;
  unregisterDropZone: (instanceId: string) => void;
  hoverInstanceId: string | null;
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
// Provider
// ---------------------------------------------------------------------------

/**
 * Vertical padding added to each drop zone rect for hit-testing.
 * This makes it easier to land on a thin tab strip after dragging vertically.
 */
const ZONE_EXPAND_Y = 60;

export interface TabDragBrokerProviderProps {
  children: ReactNode;
  onCancel?: (session: TabDragSession) => void;
}

function hitTestZone(rect: DOMRect, clientX: number, clientY: number): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top - ZONE_EXPAND_Y &&
    clientY <= rect.bottom + ZONE_EXPAND_Y
  );
}

export function TabDragBrokerProvider({ children, onCancel }: TabDragBrokerProviderProps) {
  const [activeSession, setActiveSession] = useState<TabDragSession | null>(null);
  const [hoverInstanceId, setHoverInstanceId] = useState<string | null>(null);
  const [pointerX, setPointerX] = useState(0);
  const [pointerY, setPointerY] = useState(0);

  const sessionRef = useRef<TabDragSession | null>(null);
  const dropZonesRef = useRef<Map<string, DropZoneRegistration>>(new Map());
  const rafRef = useRef(0);
  const moveListenerRef = useRef<((e: PointerEvent) => void) | null>(null);
  const upListenerRef = useRef<((e: PointerEvent) => void) | null>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  const cleanup = useCallback(() => {
    if (moveListenerRef.current) {
      document.removeEventListener('pointermove', moveListenerRef.current);
      moveListenerRef.current = null;
    }
    if (upListenerRef.current) {
      document.removeEventListener('pointerup', upListenerRef.current);
      upListenerRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
    sessionRef.current = null;
    setActiveSession(null);
    setHoverInstanceId(null);
  }, []);

  const computeInsertIndex = useCallback((zone: DropZoneRegistration, clientX: number): number => {
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
  }, []);

  // Tear down listeners if the provider unmounts during an active session.
  useEffect(() => cleanup, [cleanup]);

  const beginSession = useCallback(
    (session: TabDragSession, clientX: number, clientY: number) => {
      // No-op if a session is already active
      if (sessionRef.current) return;

      sessionRef.current = session;
      setActiveSession(session);
      setPointerX(clientX);
      setPointerY(clientY);

      const onPointerMove = (e: PointerEvent) => {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setPointerX(e.clientX);
          setPointerY(e.clientY);

          let foundId: string | null = null;
          for (const [id, zone] of dropZonesRef.current) {
            if (id === sessionRef.current?.sourceInstanceId) continue;
            const rect = zone.getRect();
            if (!rect) continue;
            if (hitTestZone(rect, e.clientX, e.clientY)) {
              foundId = id;
              break;
            }
          }
          setHoverInstanceId(foundId);
        });
      };

      const onPointerUp = (e: PointerEvent) => {
        cancelAnimationFrame(rafRef.current);

        let committedZone: DropZoneRegistration | null = null;
        for (const [id, zone] of dropZonesRef.current) {
          if (id === sessionRef.current?.sourceInstanceId) continue;
          const rect = zone.getRect();
          if (!rect) continue;
          if (hitTestZone(rect, e.clientX, e.clientY)) {
            committedZone = zone;
            break;
          }
        }

        const currentSession = sessionRef.current;

        if (committedZone && currentSession) {
          const insertIndex = computeInsertIndex(committedZone, e.clientX);
          committedZone.onAttach({
            tab: currentSession.tab,
            sourceInstanceId: currentSession.sourceInstanceId,
            insertIndex,
          });
        } else if (currentSession && onCancelRef.current) {
          onCancelRef.current(currentSession);
        }

        cleanup();
      };

      moveListenerRef.current = onPointerMove;
      upListenerRef.current = onPointerUp;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    },
    [cleanup, computeInsertIndex],
  );

  const cancelSession = useCallback(() => {
    const currentSession = sessionRef.current;
    if (currentSession && onCancelRef.current) {
      onCancelRef.current(currentSession);
    }
    cleanup();
  }, [cleanup]);

  const clearSession = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const registerDropZone = useCallback((reg: DropZoneRegistration) => {
    dropZonesRef.current.set(reg.instanceId, reg);
  }, []);

  const unregisterDropZone = useCallback(
    (instanceId: string) => {
      dropZonesRef.current.delete(instanceId);
      setHoverInstanceId((prev) => (prev === instanceId ? null : prev));
    },
    [],
  );

  const value: TabDragBrokerValue = {
    activeSession,
    beginSession,
    cancelSession,
    clearSession,
    registerDropZone,
    unregisterDropZone,
    hoverInstanceId,
    pointerX,
    pointerY,
  };

  return (
    <TabDragBrokerContext.Provider value={value}>
      {children}
      {activeSession && (
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: pointerX,
              top: pointerY,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 99999,
              ...activeSession.ghostStyle,
            }}
          >
            <DetachGhostTab tab={activeSession.tab} style={activeSession.ghostStyle} />
          </div>,
          document.body,
        )
      )}
    </TabDragBrokerContext.Provider>
  );
}
