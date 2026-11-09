const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** True when the element sits inside an inert subtree and so can no longer hold focus. */
export function isInert(element: Element): boolean {
  return element.closest('[inert]') !== null;
}

export function firstFocusable(container: HTMLElement | null | undefined): HTMLElement | null {
  if (!container) return null;
  for (const element of container.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (!isInert(element)) return element;
  }
  return null;
}

/** The focused element when it lives inside `container`, otherwise null. */
export function focusedWithin(container: HTMLElement | null | undefined): HTMLElement | null {
  if (!container) return null;
  const active = container.ownerDocument.activeElement;
  return active instanceof HTMLElement && container.contains(active) ? active : null;
}
