import { vi } from 'vitest';
import type {
  RemoteTabDragEvent,
  RemoteTabDropResult,
  TabDragTransport,
} from '../components/editor-tabs/types';

/**
 * In-memory TabDragTransport for tests. `drop` answers with `dropResult`;
 * `emitRemoteEvent` plays the role of another document's session arriving here.
 */
export function createFakeTabDragTransport(dropResult: RemoteTabDropResult = null) {
  const handlers = new Set<(event: RemoteTabDragEvent) => void>();
  const transport = {
    begin: vi.fn<TabDragTransport['begin']>(),
    move: vi.fn<TabDragTransport['move']>(),
    drop: vi.fn<TabDragTransport['drop']>(() => Promise.resolve(dropResult)),
    cancel: vi.fn<TabDragTransport['cancel']>(),
    subscribe: vi.fn<TabDragTransport['subscribe']>((handler) => {
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    }),
  } satisfies TabDragTransport;

  const emitRemoteEvent = (event: RemoteTabDragEvent) => {
    for (const handler of handlers) handler(event);
  };

  return { transport, emitRemoteEvent, getSubscriberCount: () => handlers.size };
}
