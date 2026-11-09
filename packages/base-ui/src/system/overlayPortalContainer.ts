import { createContext } from 'react';

/**
 * Undefined preserves a portal's default owner. Null waits for the owning overlay to mount;
 * an element keeps nested floating content in that overlay's stacking context.
 */
export const OverlayPortalContainerContext = createContext<HTMLElement | null | undefined>(
  undefined,
);
