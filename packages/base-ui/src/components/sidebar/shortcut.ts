import { useSyncExternalStore } from 'react';

/**
 * Surfaces that own Cmd/Ctrl+B themselves. `closest()` also covers every descendant, so the
 * hidden textarea of Monaco, the helper textarea of xterm and nodes inside a contenteditable
 * subtree are all treated as editing.
 */
const EDITABLE_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
  '[role="searchbox"]',
  '[role="combobox"]',
  '[role="spinbutton"]',
  '[data-ov-editor]',
  '.monaco-editor',
  '.cm-editor',
  '.xterm',
].join(',');

const subscribeToNothing = () => () => {};

export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
}

/** Hydration-safe platform check for labels. */
export function useIsApplePlatform(): boolean {
  return useSyncExternalStore(subscribeToNothing, isApplePlatform, () => false);
}

export function isEditableElement(target: EventTarget | null | undefined): boolean {
  return target instanceof Element && target.closest(EDITABLE_SELECTOR) !== null;
}

interface ShortcutEntry {
  getElement: () => HTMLElement | null;
  toggle: () => void;
}

const entries = new Set<ShortcutEntry>();
let lastInteractedRoot: Element | null = null;
let installed = false;

function isAvailable(element: HTMLElement): boolean {
  if (!element.isConnected) return false;
  if (element.closest('[inert], [hidden], [aria-hidden="true"]')) return false;
  // jsdom and older engines do not implement checkVisibility; treat them as visible.
  return typeof element.checkVisibility === 'function' ? element.checkVisibility() : true;
}

function eventOrigin(event: Event): EventTarget | null {
  const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
  return path[0] ?? event.target;
}

function inDocumentOrder(a: HTMLElement, b: HTMLElement): number {
  if (a === b) return 0;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/**
 * Exactly one sidebar answers a keypress: the innermost one containing the event, else the
 * one the user last interacted with, else the first visible one in document order.
 */
function resolveEntry(event: KeyboardEvent): ShortcutEntry | undefined {
  const candidates: Array<{ entry: ShortcutEntry; element: HTMLElement }> = [];
  for (const entry of entries) {
    const element = entry.getElement();
    if (element && isAvailable(element)) candidates.push({ entry, element });
  }
  candidates.sort((a, b) => inDocumentOrder(a.element, b.element));
  if (candidates.length <= 1) return candidates[0]?.entry;

  const origin = eventOrigin(event);
  if (origin instanceof Node) {
    const containing = candidates.filter(({ element }) => element.contains(origin));
    const innermost = containing.find(({ element }) =>
      containing.every((other) => other.element === element || !element.contains(other.element)),
    );
    if (innermost) return innermost.entry;
  }

  const interacted = lastInteractedRoot;
  if (interacted?.isConnected) {
    const recent = candidates.find(({ element }) => element.contains(interacted));
    if (recent) return recent.entry;
  }
  return candidates[0]?.entry;
}

function trackInteraction(event: Event) {
  const origin = eventOrigin(event);
  if (!(origin instanceof Element)) return;
  const root = origin.closest('[data-ov-sidebar-root]');
  if (root) lastInteractedRoot = root;
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.repeat || event.isComposing) return;
  if (event.altKey || event.shiftKey) return;
  if (typeof event.key !== 'string' || event.key.toLowerCase() !== 'b') return;
  const apple = isApplePlatform();
  const primary = apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  if (!primary) return;
  if (isEditableElement(eventOrigin(event))) return;
  if (isEditableElement(event.target) || isEditableElement(document.activeElement)) return;
  const entry = resolveEntry(event);
  if (!entry) return;
  event.preventDefault();
  entry.toggle();
}

function install() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('pointerdown', trackInteraction, true);
  document.addEventListener('focusin', trackInteraction, true);
}

function uninstall() {
  if (!installed) return;
  installed = false;
  lastInteractedRoot = null;
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('pointerdown', trackInteraction, true);
  document.removeEventListener('focusin', trackInteraction, true);
}

/** Registers a sidebar for Cmd/Ctrl+B. Returns the unregister function. */
export function registerSidebarShortcut(entry: ShortcutEntry): () => void {
  entries.add(entry);
  install();
  return () => {
    entries.delete(entry);
    if (entries.size === 0) uninstall();
  };
}
