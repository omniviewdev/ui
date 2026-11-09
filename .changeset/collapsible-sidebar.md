---
'@omniviewdev/base-ui': minor
---

Add the collapsible `Sidebar` (`Sidebar.Root`, `Header`, `Content`, `Footer`, `Expanded`, `Rail`, `Navigation`, `Trigger`, `Handle`, `Toggle`) with `useSidebar`, `useSidebarTrigger` and `useSidebarController`.

`Sidebar.Root` reserves only the sidebar width. Mode is `expanded` or a 48px icon `rail`, controlled or uncontrolled; `onModeChange` fires only for explicit changes, never for a hover peek. Opt-in `hoverPeek` overlays the expanded panel after 280ms of intent without reflowing the page, and pinning it open is an explicit expansion. `shortcut` registers Cmd/Ctrl+B, ignored inside inputs, editors and every descendant of an editing surface, with exactly one visible sidebar answering each keypress. A `controller` lets triggers and `useSidebar` outside the sidebar subtree observe and control it.

`Sidebar.Navigation` keeps the consumer's expanded presentation (for example a virtualized `TreeList`) mounted, with scroll, expansion and edit state intact, and projects the same data into a rail: label tooltips on keyboard focus and hover, a single tab stop, Menu flyouts with arbitrary-depth in-place expansion and bounded scrolling, descendant selection cues, status badges, and an explicit "Open" row for groups that are also destinations. Closed flyouts render no nested nodes. Hidden presentations are inert and move focus to the equivalent row when they hide.

All motion is native CSS on the shared panel and interactive duration and easing tokens (width reservation, panel width, grid-row slot collapse, cross-fade), so it reverses from its current value when interrupted and follows reduced motion through the existing token contract. No animation dependency.

Add opt-in `TreeList` `animateExpansion`: native Web Animations for visible row entry and repositioning when branches expand or collapse, in flat and virtualized trees. It reverses from the exact current pose when interrupted, is disabled while reordering, and honors the shared duration and easing tokens and reduced motion (system and `data-ov-motion`).

Accept native CSS width units and unitless zero, preserve focused rail controls by suppressing hover peek while the sidebar owns focus, and compensate tree animation snapshots for native scroll clamping and anchoring.
