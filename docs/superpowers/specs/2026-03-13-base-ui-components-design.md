# Base-UI Component Enhancements: Tabs, SortableTable, FileTable

**Driver:** The file-explorer showcase demo built three inline/hand-rolled patterns that should be first-class base-ui components. This spec extracts and formalizes them.

**Package:** `@omniviewdev/base-ui`

**Components:**
1. `Tabs.Tab` `endDecorator` enhancement (existing component)
2. `useSortableTable` hook + `SortableHeader` component (new)
3. `FileTable` compound component (new)

---

## 1. Tabs.Tab `endDecorator` Enhancement

### Problem

`Tabs.Tab` currently accepts only `children` (the label). Consumers who want a badge, count, or icon after the label must manually compose it inside children with ad-hoc spacing. The TransferPanel demo hand-rolled its own tab bar because of this gap.

### Design

Add an `endDecorator` prop to `Tabs.Tab` — a `ReactNode` slot rendered after the tab label with proper spacing. Follows the same pattern as `Button`'s `startDecorator`/`endDecorator`.

**Implementation note:** The current `TabsTabProps` is a type alias (`type TabsTabProps = BaseTabs.Tab.Props`). It must be changed to an intersection type that extends the base props:

```tsx
export type TabsTabProps = BaseTabs.Tab.Props & {
  endDecorator?: ReactNode;
};
```

**Rendering (inside TabsTab):** The `endDecorator` must be destructured out before spreading remaining props into `BaseTabs.Tab` to avoid passing unknown DOM attributes:

```tsx
function TabsTab({ endDecorator, children, ...props }: TabsTabProps) {
  return (
    <BaseTabs.Tab className={styles.Tab} {...props}>
      {children}
      {endDecorator && <span className={styles.TabDecorator}>{endDecorator}</span>}
    </BaseTabs.Tab>
  );
}
```

**CSS:**

```css
.TabDecorator {
  display: inline-flex;
  align-items: center;
  margin-left: var(--ov-space-stack-xs, 4px);
  flex-shrink: 0;
}
```

**Usage:**

```tsx
<Tabs.Tab value="queued" endDecorator={<Badge size="sm" color="info">2</Badge>}>
  Queued
</Tabs.Tab>
```

### Scope

- One prop added to `TabsTabProps`
- One CSS class added to `Tabs.module.css`
- ~5 lines changed in `Tabs.tsx`
- No breaking changes — existing tabs without `endDecorator` render identically
- Update Tabs stories to showcase the new prop

### Files

- Modify: `components/tabs/Tabs.tsx`
- Modify: `components/tabs/Tabs.module.css`
- Modify: `components/tabs/index.ts` (if types need re-export)
- Modify: `components/tabs/Tabs.stories.tsx`

---

## 2. `useSortableTable` Hook + `SortableHeader` Component

### Problem

The existing `Table` component provides semantic HTML table rendering with styling (striped, hover, sticky headers), but no sorting behavior. The full `DataTable` wraps TanStack Table with 30+ files and is overkill for simple sorted lists. There's no middle ground.

### Design

A headless hook that manages sort state and returns sorted data. Paired with a small `SortableHeader` component that renders clickable column headers with sort direction indicators.

**Hook API:**

```tsx
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface SortableColumnDef<T> {
  id: string;
  header: ReactNode;
  accessor: (item: T) => string | number | Date | undefined;
  sortable?: boolean;        // default true
  sortFn?: (a: T, b: T) => number;  // custom comparator override
}

interface UseSortableTableOptions<T> {
  data: T[];
  defaultSort?: SortConfig;
  columns: SortableColumnDef<T>[];
}

interface UseSortableTableReturn<T> {
  sortedData: T[];
  sort: SortConfig;
  onSort: (columnId: string) => void;
  columns: SortableColumnDef<T>[];  // pass-through for rendering
}

function useSortableTable<T>(options: UseSortableTableOptions<T>): UseSortableTableReturn<T>;
```

**Sort behavior:**
- Click a header → sort ascending by that column
- Click same header again → toggle to descending
- Click a different header → sort ascending by new column
- Custom `sortFn` on a column overrides default comparison
- Default comparison: strings via `localeCompare`, numbers numerically, dates chronologically, `undefined` sorts last

**SortableHeader component:**

```tsx
interface SortableHeaderProps {
  columnId: string;
  sort: SortConfig;
  onSort: (columnId: string) => void;
  sortable?: boolean;
  children: ReactNode;
}

function SortableHeader({ columnId, sort, onSort, sortable = true, children }: SortableHeaderProps): JSX.Element;
```

Renders a `<button>` wrapping children + a sort indicator icon (inline SVG chevron, not Unicode glyphs — for cross-font consistency). Sets `aria-sort="ascending"` or `aria-sort="descending"` on the parent `<th>` via a callback ref or by expecting the consumer to pass it through. When `sortable` is false, renders a plain `<span>` with no interactive behavior.

**Keyboard accessibility:** The `<button>` element provides native keyboard interaction (Enter/Space to toggle sort). Focus styling uses the standard `--ov-color-state-focus-ring` token.

**Sort state:** One column is always sorted — there is no "unsorted" third-click state. This is intentional: file tables and simple data lists always have an active sort order. Consumers who need unsorted state should use DataTable instead.

**CSS:**

```css
.SortableHeader {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  user-select: none;
}

.SortableHeader:hover {
  color: var(--ov-color-fg-default);
}

.SortIndicator {
  font-size: 10px;
  flex-shrink: 0;
}
```

**Usage with existing Table:**

```tsx
const { sortedData, sort, onSort, columns } = useSortableTable({
  data: items,
  defaultSort: { key: 'name', direction: 'asc' },
  columns: [
    { id: 'name', header: 'Name', accessor: (item) => item.name },
    { id: 'size', header: 'Size', accessor: (item) => item.size },
  ],
});

<Table hoverable stickyHeader>
  <Table.Head>
    <Table.Row>
      {columns.map((col) => (
        <Table.HeaderCell key={col.id}>
          <SortableHeader columnId={col.id} sort={sort} onSort={onSort}>
            {col.header}
          </SortableHeader>
        </Table.HeaderCell>
      ))}
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {sortedData.map((item) => (
      <Table.Row key={item.id}>...</Table.Row>
    ))}
  </Table.Body>
</Table>
```

### Scope

- New hook: `useSortableTable`
- New component: `SortableHeader`
- No dependency on DataTable or TanStack
- Composes cleanly with existing `Table` compound component

### Files

```
components/sortable-table/
  useSortableTable.ts         — hook implementation
  SortableHeader.tsx          — header component
  SortableHeader.module.css   — styles
  index.ts                    — exports
```

---

## 3. `FileTable` Compound Component

### Problem

File browser tables (Finder list view, VS Code explorer, sFTP clients) share a common pattern: file/folder icons, name sorting with folders first, size/type/date columns, row selection, double-click navigation, and a status bar. The file-explorer demo built this inline. It should be a reusable component.

### Design

A compound component that renders a file/folder listing table with built-in columns and behaviors, plus slots for consumer-defined extra columns and row actions.

**Data contract:**

```tsx
interface FileTableItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;              // bytes
  modified?: string;          // ISO date string
  extension?: string;         // e.g. "tsx", "json"
  children?: FileTableItem[]; // for navigation (not rendered as rows)
}
```

Consumers can extend this interface with additional fields accessed via custom column `accessor` functions.

**Compound API:**

```tsx
<FileTable.Root
  items={currentDir.children}
  onNavigate={(folder) => setCurrentDir(folder)}
  onSelect={(item) => setSelected(item)}
  selectedId={selected?.id}
  showParent={currentPath.length > 1}
  onNavigateUp={() => goUp()}
  defaultSort={{ key: 'name', direction: 'asc' }}
>
  <FileTable.Header>
    {/* Extra columns appended after built-in ones */}
    <FileTable.Column id="owner" header="Owner / Group" accessor={(f) => f.owner} />
    <FileTable.Column id="perms" header="Permissions" accessor={(f) => f.permissions} mono />
  </FileTable.Header>

  <FileTable.Body
    rowActions={(item) => (
      <IconButton size="sm" variant="ghost" onClick={() => download(item)}>
        <LuDownload size={12} />
      </IconButton>
    )}
  />

  <FileTable.Status />
</FileTable.Root>
```

### FileTable.Root Props

```tsx
interface FileTableRootProps<T extends FileTableItem> {
  items: T[];
  onNavigate?: (folder: T) => void;       // double-click folder
  onSelect?: (item: T) => void;           // single-click row
  selectedId?: string;                     // controlled selection
  showParent?: boolean;                    // render ".." row
  onNavigateUp?: () => void;              // ".." handler
  defaultSort?: SortConfig;
  children: ReactNode;
}
```

### Built-in Columns

Rendered automatically in this order:

| Column | Width | Content | Sortable |
|--------|-------|---------|----------|
| Icon | 28px | `LuFolder` (amber) for folders, `LuFile` (subtle) for files | No |
| Name | flex | File/folder name | Yes |
| Actions | 28px | Slot from `rowActions` — visible on hover only | No |
| Size | 80px | Formatted bytes, right-aligned, mono | Yes |
| Type | 80px | "Directory" or extension-derived label | Yes |
| Modified | 120px | Formatted date | Yes |

Extra columns from `FileTable.Column` are appended after Modified.

### Built-in Behaviors

- **Folder-first sorting** — folders always sort above files regardless of sort direction
- **".." parent row** — rendered when `showParent` is true; double-click triggers `onNavigateUp`
- **Double-click navigation** — double-clicking a folder row calls `onNavigate(folder)`
- **Row selection** — click to select, highlighted via `[data-ov-selected]`
- **Hover actions** — `rowActions` column fades in on row hover (opacity transition)
- **Icon rendering** — `LuFolder` with amber color token for folders, `LuFile` with subtle color for files
- **Built-in formatting** — `formatBytes()` for size, `formatDate()` for modified, `fileTypeLabel()` for type

### FileTable.Column Props

```tsx
interface FileTableColumnProps<T extends FileTableItem> {
  id: string;
  header: ReactNode;
  /** Renders the cell content. Returns ReactNode for display. */
  accessor: (item: T) => ReactNode;
  /** Returns a sortable primitive. Required when sortable is true. */
  sortAccessor?: (item: T) => string | number | Date | undefined;
  width?: number | string;
  sortable?: boolean;           // default false for custom columns
  sortFn?: (a: T, b: T) => number;  // alternative to sortAccessor for custom comparators
  mono?: boolean;
  align?: 'left' | 'right';
}
```

**Note on accessor vs sortAccessor:** The `accessor` returns `ReactNode` for cell rendering (e.g. styled text, icons). When `sortable` is true, `sortAccessor` (or `sortFn`) must be provided to extract a comparable primitive. If `sortable` is true and neither `sortAccessor` nor `sortFn` is provided, a dev-mode console warning is emitted and the column is treated as unsortable.

### FileTable.Status

Auto-computes and renders a status bar from `items`:

```
Files: 4  Folders: 3  Size: 6.39 KB
```

Styled as a small flex row below the table, matching the existing StatusBar aesthetic.

### Internal Architecture

- `FileTable.Root` creates a context holding items, sort state (via `useSortableTable`), selection, and callbacks
- **Column collection:** `FileTable.Column` is a config-only element (renders `null`). `FileTable.Header` uses `React.Children.map` to extract `FileTable.Column` elements by checking `child.type === FileTableColumn`. It reads their props and merges them with the built-in column definitions array. This is the same pattern used by libraries like Recharts and React Table v7.
- `FileTable.Body` renders a `<table>` element styled with the same design tokens as the existing `Table` component (reusing `--ov-color-*`, `--ov-font-*` tokens directly rather than wrapping `Table` compound, to avoid nesting compound component contexts). Columns are rendered from the merged built-in + extra column definitions.
- `FileTable.Status` reads item counts from context
- Built-in utility functions (`formatBytes`, `formatDate`, `fileTypeLabel`) are exported for consumer use

**Generics:** `FileTable.Root` is generic over `<T extends FileTableItem>`, and the type is inferred from the `items` prop. `FileTable.Column` and `FileTable.Body` receive `T` via context. In practice, consumers who extend `FileTableItem` with extra fields should define their items array with the extended type — TypeScript will infer the generic from `items` and propagate it to the accessor functions.

### Files

```
components/file-table/
  FileTable.tsx             — Root, Header, Body, Status, Column components
  FileTable.module.css      — table styles, icon colors, hover actions
  FileTableContext.tsx       — shared context (items, sort, selection, callbacks)
  utils.ts                  — formatBytes, formatDate, fileTypeLabel
  index.ts                  — exports
```

### What FileTable Does NOT Do

- No tree view — that's a layout concern for the consuming component
- No breadcrumbs — same
- No action bar (edit, delete, new folder) — that's consumer UI
- No drag-and-drop — potential future enhancement, not in scope
- No virtualization — items are direct children of folders, typically < 100 rows. If needed, consumers can use DataTable instead.

---

## 4. Demo Integration

After the three components are built, update the file-explorer demo's `FilePane` to consume them:

- Replace the inline `<table>` with `<FileTable.Root>`
- Replace the hand-rolled TransferPanel tab bar with `<Tabs.Root>` + `endDecorator` badges
- Replace the hand-rolled transfer progress bar with the existing `<Progress>` component

This validates that the components work in practice and removes ~150 lines of inline rendering from the demo.

---

## Dependency Order

1. **Tabs `endDecorator`** — standalone, no dependencies
2. **`useSortableTable` + `SortableHeader`** — standalone, no dependencies
3. **`FileTable`** — depends on `useSortableTable`, existing `Table` tokens, and icon library
4. **Demo integration** — depends on all three above

Items 1 and 2 can be built in parallel.

---

## Public Exports

Add to `packages/base-ui/src/components/index.ts`:

```ts
export * from './sortable-table';
export * from './file-table';
```

**Exported from `sortable-table/index.ts`:**
- `useSortableTable` (hook)
- `SortableHeader` (component)
- Types: `SortConfig`, `SortableColumnDef`, `UseSortableTableOptions`, `UseSortableTableReturn`

**Exported from `file-table/index.ts`:**
- `FileTable` (compound: Root, Header, Body, Status, Column)
- Types: `FileTableItem`, `FileTableRootProps`, `FileTableColumnProps`
- Utilities: `formatBytes`, `formatDate`, `fileTypeLabel`

**Modified exports from `tabs/index.ts`:**
- `TabsTabProps` type (updated to include `endDecorator`)
