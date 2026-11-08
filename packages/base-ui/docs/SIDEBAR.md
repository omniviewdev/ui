# Collapsible sidebar

Import `Sidebar`, `useSidebar`, `useSidebarTrigger`, `useSidebarController` and the types from `@omniviewdev/base-ui`, and load `@omniviewdev/base-ui/styles.css` once. The sidebar requires the existing `ThemeProvider`.

`Sidebar.Root` reserves only the sidebar width in your layout, not the whole app grid. It has two modes: `expanded`, and a 48px icon `rail` that keeps identity, actions, navigation status and the current location available. An opt-in hover peek overlays the expanded panel above the rail without reflowing the page.

Header, identity and action controls are optional caller-owned content. `Sidebar.Root` does not create a connection card, avatar, search, settings or reorder controls. The library stories demonstrate navigation without a header and a separate custom-header composition. Application-specific actions and their handlers stay in the owning view.

## Anatomy

```tsx
<Layout>
  <Sidebar.Root aria-label="Cluster" expandedWidth="var(--sidebar-width)" shortcut hoverPeek>
    <Sidebar.Header>
      <Avatar />
      <Sidebar.Expanded>name and actions</Sidebar.Expanded>
    </Sidebar.Header>
    <Sidebar.Rail>icon-button column</Sidebar.Rail>
    <Sidebar.Expanded>launcher row</Sidebar.Expanded>
    <Sidebar.Content>
      <Sidebar.Navigation
        items={items}
        itemKey={itemKey}
        getChildren={getChildren}
        getTextValue={getTextValue}
        getIcon={getIcon}
        getBadge={getBadge}
        isItemSelectable={isItemSelectable}
        selectedKey={selectedKey}
        disabledKeys={disabledKeys}
        onAction={onAction}
      >
        <TreeList.Root animateExpansion /* ... */ />
      </Sidebar.Navigation>
    </Sidebar.Content>
    <Sidebar.Footer>
      <Sidebar.Toggle />
    </Sidebar.Footer>
    <Sidebar.Handle />
  </Sidebar.Root>
  <Main />
</Layout>
```

## Root

- `mode`, `defaultMode` (`expanded`) and `onModeChange`. `onModeChange` fires only for explicit changes: `setMode`, `toggle`, a trigger, the handle, the toggle or the shortcut. It never fires for a peek, and a peek never becomes the saved mode. Persist the mode in your own settings layer.
- `expandedWidth` (240) and `railWidth` (48). A number is px. A string may be a CSS length or a `var()`, `calc()`, `clamp()`, `min()`, `max()` or `env()` expression, so a responsive variable such as `var(--sidebar-width)` works. Anything else falls back to the default. Prefer px or variables: a percentage resolves against the animating panel.
- `hoverPeek` (`false`): after 280ms of hover intent over the rail the panel overlays the content, and it closes 220ms after the pointer leaves or on Escape, even when focus remains in page content. Escape already handled by focused content, or used during IME composition, is left alone. Dismissal preserves outside focus and never changes the saved mode. Touch pointers never peek. While peeking, the toggle and handle are labelled "Pin open sidebar", and `setMode('expanded')` pins.
- `shortcut` (`false`): registers Cmd+B on Apple platforms and Ctrl+B elsewhere. Shift and Alt variants, repeats and IME composition are ignored. The shortcut does nothing inside `input`, `textarea`, `select`, `contenteditable`, `role="textbox"`, `searchbox`, `combobox`, `spinbutton`, `[data-ov-editor]`, Monaco, CodeMirror and xterm, or inside any descendant of those. Sidebars that are hidden, inert or inside `aria-hidden` are skipped, and exactly one sidebar answers each keypress: the innermost one containing the event, otherwise the one last interacted with, otherwise the first in document order.
- `controller`: see [Controllers](#controllers).
- `aria-label` defaults to "Sidebar". `id` is generated when omitted and is the `aria-controls` target of every trigger.

`className`, `style`, `id`, `aria-*` and `data-*` land on the slot element (`<nav>`). Its layout defaults (`display`, `position`, `flex`, `block-size`, `min-inline-size`) sit in `:where()` with zero specificity, so a consumer class, such as a media query that hides the sidebar on narrow windows, always wins. State is also exposed as `data-ov-sidebar-mode`, `data-ov-sidebar-collapsed` and `data-ov-sidebar-peeking`.

## State and triggers

`useSidebar(controller?)` returns `{ id, mode, collapsed, peeking, setMode, toggle }`. `collapsed` is `mode === 'rail' && !peeking`, which is exactly when only icons are shown. `toggle()` collapses from expanded and expands from a rail or a peek.

`useSidebarTrigger(controller?)` adds `label` ("Collapse sidebar", "Expand sidebar" or "Pin open sidebar"), `text`, `expanded`, `shortcut` and `props` to spread on your own button. `props` carries `type`, `aria-label`, `aria-expanded`, `aria-controls`, `aria-keyshortcuts` and `onClick`.

- `Sidebar.Trigger` renders a `<button>`, or composes your own with the Base UI `render` prop: `<Sidebar.Trigger render={<IconButton variant="ghost" size="sm">icon</IconButton>} />`. A render element's own children win over the default panel icon.
- `Sidebar.Handle` is the edge handle. Place it anywhere under the root; it is portaled to the panel edge so the clip cannot hide it. Hover or keyboard focus reveals it.
- `Sidebar.Toggle` is the footer row: icon, "Collapse", "Expand" or "Pin open", and a shortcut hint when the shortcut is registered. In the rail it is icon only, with a tooltip.

Handle, toggle, custom triggers and the shortcut all act on the same state.

## Controllers

Triggers outside the root subtree, such as a button in the page toolbar, register through a controller:

```tsx
const sidebar = useSidebarController(); // or Sidebar.createController()

<Sidebar.Root controller={sidebar} /* ... */ />
<Sidebar.Trigger controller={sidebar} render={<IconButton>icon</IconButton>} />
const { toggle } = useSidebar(sidebar);
```

Until a root mounts, a controller reports an expanded, disconnected sidebar and ignores actions. Inside the root no controller is needed.

## Slots

- `Sidebar.Header`: a bordered identity card that loses its border in the rail. The first child is the lead (an avatar, 24px by default). Set `--ov-sidebar-lead-size` on the header or an ancestor to change the size; the lead keeps its x position and ends up centered on the rail.
- `Sidebar.Expanded` and `Sidebar.Rail`: content for one presentation. The other side is `inert` and `aria-hidden="true"` (both, because jsdom and Testing Library do not understand `inert`), fades, and collapses its block size. Hidden content stays mounted. Inside the header an `Expanded` slot flexes inline beside the lead. A `Rail` slot lays its children out as a centered icon column within the rail width.
- `Sidebar.Content` and `Sidebar.Footer`: only the navigation scrolls, so the footer and toggle stay visible in short windows.
- The panel interior is always laid out at the expanded width and the panel clips it, so nothing reflows or re-wraps while it animates.

When a slot or navigation layer becomes inert while it holds focus, focus moves to the equivalent control: the rail row that contains the selection, the tree, or otherwise the first available control.

## Navigation

`Sidebar.Navigation` keeps your expanded presentation mounted and projects the same data into a rail. Nothing in it knows about a domain.

- `items`, `itemKey`, `getChildren`, `getTextValue`: the data. `getChildren` returning an empty array or `undefined` makes a destination.
- `getIcon` and `getBadge`: optional. A missing icon falls back to the label's initial. A badge node that renders nothing reserves no space.
- `getSectionLabel`: optional label on the first item of a section. The rail renders a named separator before that item, preserving categories without adding a keyboard stop. The expanded presentation continues to own its section headings.
- `isItemSelectable`: defaults to items without children. Return `true` for a group that is also a destination.
- `getOpenLabel`: the explicit destination row of such a group. Defaults to `Open {text}`.
- `selectedKey`, `disabledKeys` and `onAction(key, item)`. `onAction` fires for destinations only, never for opening or closing a group, so your own expansion state is untouched.
- `aria-label`: labels the rail list. Defaults to "Navigation".
- `children`: the expanded presentation, usually a virtualized `TreeList`. It stays mounted, keeps its scroll, expansion and edit state, and sits in a bounded flex column with `min-height: 0` so the tree scrolls its own viewport. Pair it with `animateExpansion` for native row motion. Reordering and editing stay in the tree; call `useSidebar().setMode('expanded')` before starting them.

The rail shows one row per top-level item and has a single tab stop (Up, Down, Home and End move between rows).

- Leaves show a label tooltip and act through `onAction`. Tooltips also appear on keyboard focus for groups. Under `hoverPeek`, hover shows neither a tooltip nor a flyout.
- Groups open a flyout on hover intent (160ms), click, Enter, Space or ArrowRight. All group triggers share one Base UI `Menu` and one popup. Hovering another group changes that popup's anchor and content, including after click or keyboard activation, instead of layering independent overlays. Diagonal pointer paths toward it keep it open; Escape and ArrowLeft close it and return focus to the current rail row, and moving focus away dismisses it.
- The flyout is bounded to the viewport gutters and scrolls. Nested groups expand in place at any depth, and a nested row collapses with ArrowLeft before the flyout closes. The path to `selectedKey` starts expanded. A selectable group lists an explicit first row marked `aria-current="page"` when it is selected.
- Children mount only while their group is expanded, and a closed flyout renders nothing, so large catalogs stay cheap.
- The rail icon takes the accent color when its row is, or contains, the selection. Badges appear at the icon corner and at the end of flyout rows; aggregate group status in `getBadge`.
- Expanding the sidebar, or starting a peek, closes any open flyout.

## Motion

Every transition is native CSS on the shared tokens, with no timers and no animation dependency:

- `--ov-duration-panel` (160ms): slot width, panel width, header chrome, slot collapse, handle icon and flyout.
- `--ov-duration-interactive` (90ms): label and layer fades. A layer that appears waits 0.55 of that duration so the other side fades first.
- Reduced motion zeroes both tokens through the existing contract (`prefers-reduced-motion` and `data-ov-motion`).

Because only CSS properties transition, interrupting a collapse or expansion reverses from the current value. `TreeList` `animateExpansion` uses native Web Animations for visible row entry and repositioning with the same tokens.

## Testing notes

- The root is `role="navigation"` named by `aria-label`.
- The handle and toggle are buttons named "Collapse sidebar", "Expand sidebar" or "Pin open sidebar", with `aria-expanded` true only for the expanded mode.
- The rail list is `role="list"` named by the navigation `aria-label`. Rows are buttons named by `getTextValue`; groups have `aria-haspopup="menu"`, and the current leaf has `aria-current="page"`.
- A flyout is `role="menu"` named by its group, with `menuitem` rows. Nested groups carry `aria-expanded`.
- Hidden presentations are excluded from `getByRole` by `aria-hidden`; assert `inert` through `toHaveAttribute('inert')`.

For HTTPS-proxied Storybook previews, set `STORYBOOK_ALLOWED_HOSTS` to the comma-separated trusted hostnames and `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` to the proxy hostname. Keep the dev server bound to `127.0.0.1` behind a tailnet-only HTTPS proxy. Unlisted hosts remain blocked; neither setting disables host validation globally.

## Not covered

Persistence of the saved mode belongs to the consumer. A mobile drawer, right-to-left layout and screen-reader speech were not verified.
