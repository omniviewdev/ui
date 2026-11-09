import { createContext, type RefObject } from 'react';

/**
 * Undefined preserves a portal's default owner. An owning target mounts before nested
 * portal children, so floating content resolves its ref within the accessible overlay
 * without rerendering the overlay when the target mounts.
 */
export const OverlayPortalContainerContext = createContext<
  RefObject<HTMLElement | null> | undefined
>(undefined);
