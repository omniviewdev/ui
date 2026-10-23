import { useLayoutEffect } from 'react';

/** Recover only focus lost by DOM removal/movement, never retain virtual rows. */
export function useTableFocusRecovery(container: HTMLDivElement | null) {
  useLayoutEffect(() => {
    if (!container) return;
    const document = container.ownerDocument;
    const table = container.querySelector(':scope > table');
    let focused:
      | {
          element: HTMLElement;
          owner: Element | null;
          rowId?: string;
          blurred?: boolean;
        }
      | undefined;

    function trackFocus(event: FocusEvent) {
      const element = event.target;
      if (!(element instanceof HTMLElement) || !container!.contains(element)) {
        focused = undefined;
        return;
      }
      // An inner table owns its own rows, but removing an outer detail still
      // needs the outer row's fallback. Do not confuse equal nested row IDs.
      let row = element.closest('tr');
      while (row && row.closest('table') !== table) {
        row = row.parentElement?.closest('tr') ?? null;
      }
      focused = {
        element,
        owner: element.closest('[data-ov-table-container]'),
        rowId:
          row?.getAttribute('data-ov-detail-for') ??
          row?.getAttribute('data-ov-row-id') ??
          undefined,
      };
    }

    function clearBlur(event: FocusEvent) {
      if (event.relatedTarget || event.target !== focused?.element) return;
      const previous = focused;
      previous.blurred = true;
      // Record blur synchronously: a mutation may already be queued. Only an
      // actual removal/move of this element may override a connected blur.
      queueMicrotask(() => {
        if (
          focused === previous &&
          previous.element.isConnected &&
          document.activeElement !== previous.element
        ) {
          focused = undefined;
        }
      });
    }

    const observer = new MutationObserver((mutations) => {
      if (!focused || !container.isConnected) return;
      const { element, rowId, owner, blurred } = focused;
      // The innermost mounted DataTable owns its own recovery, irrespective of
      // observer delivery order. Outer fallback is only for removing that owner.
      if (owner && owner !== container && owner.isConnected && container.contains(owner)) return;
      const active = document.activeElement;
      if (active === element || (active && active !== document.body)) return;
      if (element.isConnected && container.contains(element)) {
        if (blurred) {
          let moved = false;
          for (const mutation of mutations) {
            for (const node of mutation.removedNodes) {
              if (node.contains(element)) {
                moved = true;
                break;
              }
            }
            if (moved) break;
          }
          if (!moved) {
            focused = undefined;
            return;
          }
        }
        element.focus({ preventScroll: true });
        if (document.activeElement === element) return;
      }
      // Only mounted rows are inspected. No data/model scan or scroll-to-row.
      const row =
        rowId === undefined
          ? undefined
          : container.querySelectorAll<HTMLTableRowElement>(
              ':scope > table > tbody > tr[data-ov-row-id]',
            );
      focused = undefined;
      for (const candidate of row ?? []) {
        if (candidate.dataset.ovRowId !== rowId) continue;
        for (const toggle of candidate.querySelectorAll<HTMLButtonElement>(
          'button[data-ov-expansion-toggle]:not(:disabled)',
        )) {
          if (toggle.closest('table') !== table || toggle.closest('[inert]')) continue;
          toggle.focus({ preventScroll: true });
          if (document.activeElement === toggle) return;
        }
        break;
      }
      container.focus({ preventScroll: true });
    });
    document.addEventListener('focusin', trackFocus);
    document.addEventListener('focusout', clearBlur);
    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', trackFocus);
      document.removeEventListener('focusout', clearBlur);
    };
  }, [container]);
}
