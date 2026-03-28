# Base-UI Component Enhancements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `endDecorator` to Tabs.Tab, create a `useSortableTable` hook + `SortableHeader`, create a `FileTable` compound component, and refactor the file-explorer demo to consume them.

**Architecture:** Three independent additions to `@omniviewdev/base-ui` (Tabs enhancement, sortable-table primitives, FileTable compound), followed by a demo integration task that validates them in the file-explorer showcase. Tasks 1 and 2 have no dependencies on each other. Task 3 depends on Task 2. Task 4 depends on all three.

**Tech Stack:** React 19, CSS Modules, Vitest + @testing-library/react, @base-ui/react (upstream Tabs), react-icons/lu

**Spec:** `docs/superpowers/specs/2026-03-13-base-ui-components-design.md`

---

## File Structure

### Modified files

| File | Responsibility |
|------|---------------|
| `packages/base-ui/src/components/tabs/Tabs.tsx` | Add `endDecorator` prop to `TabsTab` |
| `packages/base-ui/src/components/tabs/Tabs.module.css` | Add `.TabDecorator` class |
| `packages/base-ui/src/components/tabs/index.ts` | No change needed (type re-exported already) |
| `packages/base-ui/src/components/tabs/Tabs.test.tsx` | Add test for `endDecorator` |
| `packages/base-ui/src/components/tabs/Tabs.stories.tsx` | Add story showing badges |
| `packages/base-ui/src/components/index.ts` | Add `sortable-table` and `file-table` exports |
| `apps/showcase/src/demos/file-explorer/components/FilePane.tsx` | Refactor to use `FileTable` |
| `apps/showcase/src/demos/file-explorer/components/TransferPanel.tsx` | Refactor to use `Tabs` + `Progress` |
| `apps/showcase/src/demos/file-explorer/components/TransferPanel.module.css` | Remove hand-rolled tab/progress styles |
| `apps/showcase/src/demos/file-explorer/data.ts` | Move `formatBytes`, `formatDate`, `fileTypeLabel` to base-ui |

### New files

| File | Responsibility |
|------|---------------|
| `packages/base-ui/src/components/sortable-table/useSortableTable.ts` | Headless sorting hook |
| `packages/base-ui/src/components/sortable-table/useSortableTable.test.ts` | Hook tests |
| `packages/base-ui/src/components/sortable-table/SortableHeader.tsx` | Clickable column header with sort indicator |
| `packages/base-ui/src/components/sortable-table/SortableHeader.module.css` | Header styles |
| `packages/base-ui/src/components/sortable-table/SortableHeader.test.tsx` | Header component tests |
| `packages/base-ui/src/components/sortable-table/index.ts` | Public exports |
| `packages/base-ui/src/components/file-table/FileTable.tsx` | Root, Header, Body, Status, Column compounds |
| `packages/base-ui/src/components/file-table/FileTable.module.css` | Table styles |
| `packages/base-ui/src/components/file-table/FileTableContext.tsx` | Shared context |
| `packages/base-ui/src/components/file-table/utils.ts` | formatBytes, formatDate, fileTypeLabel |
| `packages/base-ui/src/components/file-table/FileTable.test.tsx` | Integration tests |
| `packages/base-ui/src/components/file-table/index.ts` | Public exports |

---

## Chunk 1: Tabs.Tab `endDecorator` + useSortableTable

### Task 1: Tabs.Tab `endDecorator`

**Files:**
- Modify: `packages/base-ui/src/components/tabs/Tabs.tsx`
- Modify: `packages/base-ui/src/components/tabs/Tabs.module.css`
- Modify: `packages/base-ui/src/components/tabs/Tabs.test.tsx`
- Modify: `packages/base-ui/src/components/tabs/Tabs.stories.tsx`

- [ ] **Step 1: Write the failing test**

Add to `packages/base-ui/src/components/tabs/Tabs.test.tsx`:

```tsx
it('renders endDecorator in a tab', () => {
  renderWithTheme(
    <Tabs.Root defaultValue="a">
      <Tabs.List aria-label="Sections">
        <Tabs.Tab value="a" endDecorator={<span data-testid="badge">3</span>}>
          Queued
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="a">Content</Tabs.Panel>
    </Tabs.Root>,
  );

  expect(screen.getByTestId('badge')).toBeVisible();
  expect(screen.getByTestId('badge')).toHaveTextContent('3');
  // Decorator is inside the tab button
  expect(screen.getByRole('tab', { name: /Queued/ })).toContainElement(screen.getByTestId('badge'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/base-ui && pnpm vitest run src/components/tabs/Tabs.test.tsx`
Expected: FAIL — `endDecorator` prop not recognized, `badge` testid not found

- [ ] **Step 3: Implement the changes**

In `packages/base-ui/src/components/tabs/Tabs.tsx`, change the `TabsTabProps` type and `TabsTab` component:

```tsx
// Change line 14 from:
export type TabsTabProps = BaseTabs.Tab.Props;
// To:
export type TabsTabProps = BaseTabs.Tab.Props & {
  /** Slot rendered after the tab label (e.g. Badge, icon, count) */
  endDecorator?: ReactNode;
};
```

Add `ReactNode` to the import on line 2:

```tsx
import { forwardRef, type ReactNode } from 'react';
```

Change the `TabsTab` component (lines 44-52) from:

```tsx
const TabsTab = forwardRef<HTMLButtonElement, TabsTabProps>(function TabsTab(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Tab
      ref={ref}
      className={withBaseClassName<BaseTabs.Tab.State>(styles.Tab, className)}
      {...props}
    />
  );
});
```

To:

```tsx
const TabsTab = forwardRef<HTMLButtonElement, TabsTabProps>(function TabsTab(
  { className, endDecorator, children, ...props },
  ref,
) {
  return (
    <BaseTabs.Tab
      ref={ref}
      className={withBaseClassName<BaseTabs.Tab.State>(styles.Tab, className)}
      {...props}
    >
      {children}
      {endDecorator != null && <span className={styles.TabDecorator}>{endDecorator}</span>}
    </BaseTabs.Tab>
  );
});
```

In `packages/base-ui/src/components/tabs/Tabs.module.css`, add after the `.Tab:focus-visible` rule:

```css
.TabDecorator {
  display: inline-flex;
  align-items: center;
  margin-left: var(--ov-space-stack-xs, 4px);
  flex-shrink: 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/base-ui && pnpm vitest run src/components/tabs/Tabs.test.tsx`
Expected: All 3 tests PASS

- [ ] **Step 5: Update the story**

In `packages/base-ui/src/components/tabs/Tabs.stories.tsx`, add a new story after `Playground`:

```tsx
export const WithBadges: Story = {
  render: (args) => (
    <Tabs.Root {...args} defaultValue="queued" style={{ width: 520 }}>
      <Tabs.List aria-label="Transfer status">
        <Tabs.Tab value="queued" endDecorator={<span style={{ fontSize: 10, background: 'var(--ov-color-info-soft)', color: 'var(--ov-color-info)', padding: '0 4px', borderRadius: 999, fontWeight: 600 }}>2</span>}>
          Queued
        </Tabs.Tab>
        <Tabs.Tab value="failed" endDecorator={<span style={{ fontSize: 10, background: 'var(--ov-color-danger-soft)', color: 'var(--ov-color-danger)', padding: '0 4px', borderRadius: 999, fontWeight: 600 }}>1</span>}>
          Failed
        </Tabs.Tab>
        <Tabs.Tab value="completed" endDecorator={<span style={{ fontSize: 10, background: 'var(--ov-color-success-soft)', color: 'var(--ov-color-success)', padding: '0 4px', borderRadius: 999, fontWeight: 600 }}>5</span>}>
          Completed
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="queued">Queued transfers</Tabs.Panel>
      <Tabs.Panel value="failed">Failed transfers</Tabs.Panel>
      <Tabs.Panel value="completed">Completed transfers</Tabs.Panel>
    </Tabs.Root>
  ),
};
```

- [ ] **Step 6: Run full type check**

Run: `pnpm tsc --noEmit --project packages/base-ui/tsconfig.json`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add packages/base-ui/src/components/tabs/
git commit -m "feat(tabs): add endDecorator prop to Tabs.Tab"
```

---

### Task 2: `useSortableTable` Hook

**Files:**
- Create: `packages/base-ui/src/components/sortable-table/useSortableTable.ts`
- Create: `packages/base-ui/src/components/sortable-table/useSortableTable.test.ts`
- Create: `packages/base-ui/src/components/sortable-table/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/base-ui/src/components/sortable-table/useSortableTable.test.ts`:

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSortableTable } from './useSortableTable';
import type { SortableColumnDef } from './useSortableTable';

interface TestItem {
  id: string;
  name: string;
  size: number;
  date: string;
}

const items: TestItem[] = [
  { id: '1', name: 'banana', size: 200, date: '2026-01-02' },
  { id: '2', name: 'apple', size: 100, date: '2026-01-03' },
  { id: '3', name: 'cherry', size: 150, date: '2026-01-01' },
];

const columns: SortableColumnDef<TestItem>[] = [
  { id: 'name', header: 'Name', accessor: (i) => i.name },
  { id: 'size', header: 'Size', accessor: (i) => i.size },
  { id: 'date', header: 'Date', accessor: (i) => i.date },
];

describe('useSortableTable', () => {
  it('sorts ascending by default sort key', () => {
    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns,
        defaultSort: { key: 'name', direction: 'asc' },
      }),
    );

    expect(result.current.sortedData.map((i) => i.name)).toEqual([
      'apple', 'banana', 'cherry',
    ]);
    expect(result.current.sort).toEqual({ key: 'name', direction: 'asc' });
  });

  it('toggles direction when clicking same column', () => {
    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns,
        defaultSort: { key: 'name', direction: 'asc' },
      }),
    );

    act(() => result.current.onSort('name'));

    expect(result.current.sort.direction).toBe('desc');
    expect(result.current.sortedData.map((i) => i.name)).toEqual([
      'cherry', 'banana', 'apple',
    ]);
  });

  it('switches to ascending when clicking a different column', () => {
    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns,
        defaultSort: { key: 'name', direction: 'desc' },
      }),
    );

    act(() => result.current.onSort('size'));

    expect(result.current.sort).toEqual({ key: 'size', direction: 'asc' });
    expect(result.current.sortedData.map((i) => i.size)).toEqual([100, 150, 200]);
  });

  it('sorts numerically for number accessors', () => {
    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns,
        defaultSort: { key: 'size', direction: 'desc' },
      }),
    );

    expect(result.current.sortedData.map((i) => i.size)).toEqual([200, 150, 100]);
  });

  it('uses custom sortFn when provided', () => {
    const customColumns: SortableColumnDef<TestItem>[] = [
      {
        id: 'name',
        header: 'Name',
        accessor: (i) => i.name,
        sortFn: (a, b) => b.name.length - a.name.length, // sort by length desc
      },
    ];

    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns: customColumns,
        defaultSort: { key: 'name', direction: 'asc' },
      }),
    );

    // 'cherry' (6) > 'banana' (6) > 'apple' (5) — custom sort by length
    expect(result.current.sortedData[2].name).toBe('apple');
  });

  it('sorts undefined values last', () => {
    const itemsWithUndefined = [
      ...items,
      { id: '4', name: 'date-less', size: 0, date: '' },
    ];
    const colsWithUndef: SortableColumnDef<typeof itemsWithUndefined[0]>[] = [
      { id: 'date', header: 'Date', accessor: (i) => i.date || undefined },
    ];

    const { result } = renderHook(() =>
      useSortableTable({
        data: itemsWithUndefined,
        columns: colsWithUndef,
        defaultSort: { key: 'date', direction: 'asc' },
      }),
    );

    // undefined should be last
    expect(result.current.sortedData[result.current.sortedData.length - 1].id).toBe('4');
  });

  it('skips sorting for non-sortable columns', () => {
    const colsNonSortable: SortableColumnDef<TestItem>[] = [
      { id: 'name', header: 'Name', accessor: (i) => i.name, sortable: false },
    ];

    const { result } = renderHook(() =>
      useSortableTable({
        data: items,
        columns: colsNonSortable,
        defaultSort: { key: 'name', direction: 'asc' },
      }),
    );

    act(() => result.current.onSort('name'));

    // Should not change — column is non-sortable
    expect(result.current.sort).toEqual({ key: 'name', direction: 'asc' });
  });

  it('defaults to first sortable column when no defaultSort given', () => {
    const { result } = renderHook(() =>
      useSortableTable({ data: items, columns }),
    );

    expect(result.current.sort.key).toBe('name');
    expect(result.current.sort.direction).toBe('asc');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/base-ui && pnpm vitest run src/components/sortable-table/useSortableTable.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the hook**

Create `packages/base-ui/src/components/sortable-table/useSortableTable.ts`:

```tsx
import { useMemo, useState, useCallback, type ReactNode } from 'react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface SortableColumnDef<T> {
  id: string;
  header: ReactNode;
  accessor: (item: T) => string | number | Date | undefined;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

export interface UseSortableTableOptions<T> {
  data: T[];
  defaultSort?: SortConfig;
  columns: SortableColumnDef<T>[];
}

export interface UseSortableTableReturn<T> {
  sortedData: T[];
  sort: SortConfig;
  onSort: (columnId: string) => void;
  columns: SortableColumnDef<T>[];
}

function defaultCompare(a: unknown, b: unknown): number {
  // undefined / null sort last
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b));
}

export function useSortableTable<T>(
  options: UseSortableTableOptions<T>,
): UseSortableTableReturn<T> {
  const { data, columns, defaultSort } = options;

  const firstSortable = columns.find((c) => c.sortable !== false);
  const initialSort: SortConfig = defaultSort ?? {
    key: firstSortable?.id ?? columns[0]?.id ?? '',
    direction: 'asc',
  };

  const [sort, setSort] = useState<SortConfig>(initialSort);

  const onSort = useCallback(
    (columnId: string) => {
      const col = columns.find((c) => c.id === columnId);
      if (!col || col.sortable === false) return;

      setSort((prev) => {
        if (prev.key === columnId) {
          return { key: columnId, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
        }
        return { key: columnId, direction: 'asc' };
      });
    },
    [columns],
  );

  const sortedData = useMemo(() => {
    const col = columns.find((c) => c.id === sort.key);
    if (!col) return data;

    const sorted = [...data].sort((a, b) => {
      if (col.sortFn) return col.sortFn(a, b);
      const va = col.accessor(a);
      const vb = col.accessor(b);
      return defaultCompare(va, vb);
    });

    if (sort.direction === 'desc') sorted.reverse();
    return sorted;
  }, [data, sort, columns]);

  return { sortedData, sort, onSort, columns };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/base-ui && pnpm vitest run src/components/sortable-table/useSortableTable.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Create the index**

Create `packages/base-ui/src/components/sortable-table/index.ts`:

```tsx
export { useSortableTable } from './useSortableTable';
export type {
  SortConfig,
  SortableColumnDef,
  UseSortableTableOptions,
  UseSortableTableReturn,
} from './useSortableTable';
export { SortableHeader } from './SortableHeader';
export type { SortableHeaderProps } from './SortableHeader';
```

Note: `SortableHeader` will be created in the next step. The index will have a TS error until then.

- [ ] **Step 6: Commit**

```bash
git add packages/base-ui/src/components/sortable-table/useSortableTable.ts \
  packages/base-ui/src/components/sortable-table/useSortableTable.test.ts \
  packages/base-ui/src/components/sortable-table/index.ts
git commit -m "feat(sortable-table): add useSortableTable hook"
```

---

### Task 3: `SortableHeader` Component

**Files:**
- Create: `packages/base-ui/src/components/sortable-table/SortableHeader.tsx`
- Create: `packages/base-ui/src/components/sortable-table/SortableHeader.module.css`
- Create: `packages/base-ui/src/components/sortable-table/SortableHeader.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `packages/base-ui/src/components/sortable-table/SortableHeader.test.tsx`:

```tsx
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { SortableHeader } from './SortableHeader';

describe('SortableHeader', () => {
  it('renders children text', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="name"
                sort={{ key: 'name', direction: 'asc' }}
                onSort={() => {}}
              >
                Name
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByText('Name')).toBeVisible();
  });

  it('shows ascending indicator when column is active ascending', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="name"
                sort={{ key: 'name', direction: 'asc' }}
                onSort={() => {}}
              >
                Name
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByLabelText('Sorted ascending')).toBeInTheDocument();
  });

  it('shows descending indicator when column is active descending', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="name"
                sort={{ key: 'name', direction: 'desc' }}
                onSort={() => {}}
              >
                Name
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByLabelText('Sorted descending')).toBeInTheDocument();
  });

  it('does not show indicator for inactive column', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="size"
                sort={{ key: 'name', direction: 'asc' }}
                onSort={() => {}}
              >
                Size
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.queryByLabelText(/Sorted/)).not.toBeInTheDocument();
  });

  it('calls onSort when clicked', () => {
    const onSort = vi.fn();
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="name"
                sort={{ key: 'size', direction: 'asc' }}
                onSort={onSort}
              >
                Name
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('renders non-interactive span when sortable is false', () => {
    renderWithTheme(
      <table>
        <thead>
          <tr>
            <th>
              <SortableHeader
                columnId="icon"
                sort={{ key: 'name', direction: 'asc' }}
                onSort={() => {}}
                sortable={false}
              >
                Icon
              </SortableHeader>
            </th>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/base-ui && pnpm vitest run src/components/sortable-table/SortableHeader.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement SortableHeader**

Create `packages/base-ui/src/components/sortable-table/SortableHeader.tsx`:

```tsx
import { useCallback, type ReactNode } from 'react';
import type { SortConfig } from './useSortableTable';
import styles from './SortableHeader.module.css';

export interface SortableHeaderProps {
  columnId: string;
  sort: SortConfig;
  onSort: (columnId: string) => void;
  sortable?: boolean;
  children: ReactNode;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' }) {
  const label = direction === 'asc' ? 'Sorted ascending' : 'Sorted descending';
  return (
    <svg
      className={styles.SortIcon}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      {direction === 'asc' ? (
        <path d="M5 2L8.5 7H1.5L5 2Z" />
      ) : (
        <path d="M5 8L1.5 3H8.5L5 8Z" />
      )}
    </svg>
  );
}

export function SortableHeader({
  columnId,
  sort,
  onSort,
  sortable = true,
  children,
}: SortableHeaderProps) {
  const isActive = sort.key === columnId;

  const handleClick = useCallback(() => {
    onSort(columnId);
  }, [onSort, columnId]);

  if (!sortable) {
    return <span className={styles.Root}>{children}</span>;
  }

  return (
    <button
      type="button"
      className={styles.Root}
      data-ov-sortable="true"
      data-ov-active={isActive ? 'true' : undefined}
      onClick={handleClick}
    >
      {children}
      {isActive && <SortIcon direction={sort.direction} />}
    </button>
  );
}
```

Create `packages/base-ui/src/components/sortable-table/SortableHeader.module.css`:

```css
.Root {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: inherit;
}

.Root[data-ov-sortable='true'] {
  cursor: pointer;
  user-select: none;
}

.Root[data-ov-sortable='true']:hover {
  color: var(--ov-color-fg-default);
}

.Root[data-ov-sortable='true']:focus-visible {
  outline: 1px solid var(--ov-color-state-focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

.SortIcon {
  flex-shrink: 0;
  opacity: 0.7;
}

.Root[data-ov-active='true'] .SortIcon {
  opacity: 1;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/base-ui && pnpm vitest run src/components/sortable-table/`
Expected: All 14 tests PASS (8 hook + 6 header)

- [ ] **Step 5: Add barrel export**

In `packages/base-ui/src/components/index.ts`, add:

```ts
export * from './sortable-table';
```

- [ ] **Step 6: Run full type check**

Run: `pnpm tsc --noEmit --project packages/base-ui/tsconfig.json`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add packages/base-ui/src/components/sortable-table/ \
  packages/base-ui/src/components/index.ts
git commit -m "feat(sortable-table): add useSortableTable hook and SortableHeader component"
```

---

## Chunk 2: FileTable Compound Component

### Task 4: FileTable Utilities

**Files:**
- Create: `packages/base-ui/src/components/file-table/utils.ts`

- [ ] **Step 1: Create utility functions**

Create `packages/base-ui/src/components/file-table/utils.ts`:

```tsx
/** Format bytes to human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format ISO date to short date string */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

/** Derive file type label from a file node */
export function fileTypeLabel(node: { type: string; extension?: string }): string {
  if (node.type === 'folder') return 'Directory';
  if (!node.extension) return 'File';
  const map: Record<string, string> = {
    ts: 'ts-file', tsx: 'tsx-file', js: 'js-file', jsx: 'jsx-file',
    json: 'json-file', yaml: 'yaml-file', yml: 'yaml-file',
    css: 'css-file', html: 'html-file', md: 'markdown',
    png: 'image', jpg: 'image', webp: 'image', svg: 'svg-file',
    ico: 'icon', woff2: 'font', gz: 'archive', txt: 'text-file',
    cjs: 'js-file', gitignore: 'config',
  };
  return map[node.extension] ?? `${node.extension}-file`;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/base-ui/src/components/file-table/utils.ts
git commit -m "feat(file-table): add formatting utilities"
```

---

### Task 5: FileTable Context + Compound Component

**Files:**
- Create: `packages/base-ui/src/components/file-table/FileTableContext.tsx`
- Create: `packages/base-ui/src/components/file-table/FileTable.tsx`
- Create: `packages/base-ui/src/components/file-table/FileTable.module.css`
- Create: `packages/base-ui/src/components/file-table/index.ts`

- [ ] **Step 1: Create the context**

Create `packages/base-ui/src/components/file-table/FileTableContext.tsx`:

```tsx
import { createContext, useContext, type ReactNode } from 'react';
import type { SortConfig } from '../sortable-table/useSortableTable';

export interface FileTableItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: string;
  extension?: string;
  children?: FileTableItem[];
}

export interface FileTableColumnConfig {
  id: string;
  header: ReactNode;
  accessor: (item: any) => ReactNode;
  sortAccessor?: (item: any) => string | number | Date | undefined;
  sortFn?: (a: any, b: any) => number;
  width?: number | string;
  sortable?: boolean;
  mono?: boolean;
  align?: 'left' | 'right';
}

export interface FileTableContextValue {
  items: FileTableItem[];
  sortedItems: FileTableItem[];
  sort: SortConfig;
  onSort: (columnId: string) => void;
  selectedId?: string;
  onSelect?: (item: FileTableItem) => void;
  onNavigate?: (folder: FileTableItem) => void;
  showParent?: boolean;
  onNavigateUp?: () => void;
  extraColumns: FileTableColumnConfig[];
  setExtraColumns: (cols: FileTableColumnConfig[]) => void;
  rowActions?: (item: FileTableItem) => ReactNode;
}

const FileTableContext = createContext<FileTableContextValue | null>(null);

export function FileTableProvider({
  value,
  children,
}: {
  value: FileTableContextValue;
  children: ReactNode;
}) {
  return <FileTableContext.Provider value={value}>{children}</FileTableContext.Provider>;
}

export function useFileTableContext(): FileTableContextValue {
  const ctx = useContext(FileTableContext);
  if (!ctx) throw new Error('FileTable compound components must be used inside FileTable.Root');
  return ctx;
}
```

- [ ] **Step 2: Create the compound component**

Create `packages/base-ui/src/components/file-table/FileTable.tsx`:

```tsx
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  Children,
  isValidElement,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { LuFolder, LuFile } from 'react-icons/lu';
import { useSortableTable } from '../sortable-table/useSortableTable';
import type { SortConfig, SortableColumnDef } from '../sortable-table/useSortableTable';
import { SortableHeader } from '../sortable-table/SortableHeader';
import {
  FileTableProvider,
  useFileTableContext,
  type FileTableItem,
  type FileTableColumnConfig,
} from './FileTableContext';
import { formatBytes, formatDate, fileTypeLabel } from './utils';
import styles from './FileTable.module.css';

// ---------------------------------------------------------------------------
// FileTable.Column — config-only, renders null
// ---------------------------------------------------------------------------

export interface FileTableColumnProps<T extends FileTableItem = FileTableItem> {
  id: string;
  header: ReactNode;
  accessor: (item: T) => ReactNode;
  sortAccessor?: (item: T) => string | number | Date | undefined;
  sortFn?: (a: T, b: T) => number;
  width?: number | string;
  sortable?: boolean;
  mono?: boolean;
  align?: 'left' | 'right';
}

export function FileTableColumn<T extends FileTableItem = FileTableItem>(
  _props: FileTableColumnProps<T>,
): null {
  return null;
}

// Marker for React.Children scanning
FileTableColumn.displayName = 'FileTableColumn';

// ---------------------------------------------------------------------------
// FileTable.Header — collects Column children, registers extra columns
// ---------------------------------------------------------------------------

export interface FileTableHeaderProps {
  children?: ReactNode;
}

export function FileTableHeader({ children }: FileTableHeaderProps) {
  const ctx = useFileTableContext();

  // Extract column configs from FileTableColumn children
  useEffect(() => {
    const cols: FileTableColumnConfig[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === FileTableColumn) {
        cols.push(child.props as FileTableColumnConfig);
      }
    });
    ctx.setExtraColumns(cols);
  }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

  // Built-in columns
  const builtInHeaders = [
    { id: '__icon', sortable: false, width: '28px' },
    { id: 'name', label: 'Filename', sortable: true },
    { id: '__actions', sortable: false, width: '28px' },
    { id: 'size', label: 'Size', sortable: true, width: '80px' },
    { id: 'type', label: 'Type', sortable: true, width: '80px' },
    { id: 'modified', label: 'Last Modified', sortable: true, width: '120px' },
  ] as const;

  return (
    <thead>
      <tr>
        {builtInHeaders.map((col) => (
          <th key={col.id} style={col.width ? { width: col.width } : undefined}>
            {'label' in col ? (
              <SortableHeader
                columnId={col.id}
                sort={ctx.sort}
                onSort={ctx.onSort}
                sortable={col.sortable}
              >
                {col.label}
              </SortableHeader>
            ) : null}
          </th>
        ))}
        {ctx.extraColumns.map((col) => (
          <th
            key={col.id}
            style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : undefined}
          >
            <SortableHeader
              columnId={col.id}
              sort={ctx.sort}
              onSort={ctx.onSort}
              sortable={col.sortable ?? false}
            >
              {col.header}
            </SortableHeader>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ---------------------------------------------------------------------------
// FileTable.Body — renders rows
// ---------------------------------------------------------------------------

export interface FileTableBodyProps {
  rowActions?: (item: FileTableItem) => ReactNode;
}

export function FileTableBody({ rowActions }: FileTableBodyProps) {
  const ctx = useFileTableContext();
  const actions = rowActions ?? ctx.rowActions;

  return (
    <tbody>
      {/* ".." parent row */}
      {ctx.showParent && (
        <tr
          className={styles.ParentRow}
          onDoubleClick={ctx.onNavigateUp}
        >
          <td />
          <td>..</td>
          <td />
          <td />
          <td />
          <td />
          {ctx.extraColumns.map((col) => <td key={col.id} />)}
        </tr>
      )}
      {ctx.sortedItems.map((item) => (
        <tr
          key={item.id}
          data-ov-selected={ctx.selectedId === item.id ? 'true' : undefined}
          onClick={() => ctx.onSelect?.(item)}
          onDoubleClick={() => {
            if (item.type === 'folder') ctx.onNavigate?.(item);
          }}
        >
          <td>
            <span className={styles.FileIcon} data-ov-filetype={item.type}>
              {item.type === 'folder' ? <LuFolder size={14} /> : <LuFile size={14} />}
            </span>
          </td>
          <td>{item.name}</td>
          <td>
            {actions && (
              <span className={styles.RowActions}>
                {actions(item)}
              </span>
            )}
          </td>
          <td className={styles.SizeCell}>
            {item.size != null ? formatBytes(item.size) : item.type === 'folder' ? '—' : '0 B'}
          </td>
          <td className={styles.TypeCell}>{fileTypeLabel(item)}</td>
          <td className={styles.DateCell}>{item.modified ? formatDate(item.modified) : '—'}</td>
          {ctx.extraColumns.map((col) => (
            <td
              key={col.id}
              className={col.mono ? styles.MonoCell : undefined}
              style={col.align ? { textAlign: col.align } : undefined}
            >
              {col.accessor(item)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ---------------------------------------------------------------------------
// FileTable.Status — auto-computed counts
// ---------------------------------------------------------------------------

export function FileTableStatus() {
  const { items } = useFileTableContext();

  const counts = useMemo(() => {
    const files = items.filter((n) => n.type === 'file').length;
    const folders = items.filter((n) => n.type === 'folder').length;
    const size = items.reduce((sum, n) => sum + (n.size ?? 0), 0);
    return { files, folders, size };
  }, [items]);

  return (
    <div className={styles.Status}>
      <span>Files: {counts.files}</span>
      <span>Folders: {counts.folders}</span>
      <span>Size: {formatBytes(counts.size)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileTable.Root — manages state, provides context
// ---------------------------------------------------------------------------

export interface FileTableRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: FileTableItem[];
  onNavigate?: (folder: FileTableItem) => void;
  onSelect?: (item: FileTableItem) => void;
  selectedId?: string;
  showParent?: boolean;
  onNavigateUp?: () => void;
  defaultSort?: SortConfig;
  children: ReactNode;
}

export const FileTableRoot = forwardRef<HTMLDivElement, FileTableRootProps>(
  function FileTableRoot(
    {
      items,
      onNavigate,
      onSelect,
      selectedId,
      showParent,
      onNavigateUp,
      defaultSort,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const [extraColumns, setExtraColumns] = useState<FileTableColumnConfig[]>([]);

    // Build sortable column defs from built-in + extra columns
    const sortableColumns = useMemo<SortableColumnDef<FileTableItem>[]>(() => {
      const builtIn: SortableColumnDef<FileTableItem>[] = [
        { id: 'name', header: 'Filename', accessor: (i) => i.name },
        { id: 'size', header: 'Size', accessor: (i) => i.size ?? 0 },
        { id: 'type', header: 'Type', accessor: (i) => i.extension ?? '' },
        { id: 'modified', header: 'Modified', accessor: (i) => i.modified ?? '' },
      ];

      const extra: SortableColumnDef<FileTableItem>[] = extraColumns
        .filter((c) => c.sortable)
        .map((c) => ({
          id: c.id,
          header: c.header,
          accessor: c.sortAccessor ?? (() => undefined),
          sortFn: c.sortFn,
        }));

      return [...builtIn, ...extra];
    }, [extraColumns]);

    const { sortedData: rawSorted, sort, onSort } = useSortableTable({
      data: items,
      columns: sortableColumns,
      defaultSort: defaultSort ?? { key: 'name', direction: 'asc' },
    });

    // Apply folder-first ordering on top of sort
    const sortedItems = useMemo(() => {
      return [...rawSorted].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return 0; // preserve sort order within same type
      });
    }, [rawSorted]);

    const ctxValue = useMemo(
      () => ({
        items,
        sortedItems,
        sort,
        onSort,
        selectedId,
        onSelect,
        onNavigate,
        showParent,
        onNavigateUp,
        extraColumns,
        setExtraColumns,
      }),
      [items, sortedItems, sort, onSort, selectedId, onSelect, onNavigate, showParent, onNavigateUp, extraColumns],
    );

    return (
      <FileTableProvider value={ctxValue}>
        <div ref={ref} className={`${styles.Root}${className ? ` ${className}` : ''}`} {...rest}>
          <div className={styles.TableWrap}>
            <table className={styles.Table}>
              {children}
            </table>
          </div>
        </div>
      </FileTableProvider>
    );
  },
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

type FileTableCompound = typeof FileTableRoot & {
  Root: typeof FileTableRoot;
  Header: typeof FileTableHeader;
  Body: typeof FileTableBody;
  Status: typeof FileTableStatus;
  Column: typeof FileTableColumn;
};

export const FileTable = Object.assign(FileTableRoot, {
  Root: FileTableRoot,
  Header: FileTableHeader,
  Body: FileTableBody,
  Status: FileTableStatus,
  Column: FileTableColumn,
}) as FileTableCompound;
```

- [ ] **Step 3: Create the CSS**

Create `packages/base-ui/src/components/file-table/FileTable.module.css`:

```css
.Root {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.TableWrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.Table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
}

.Table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--ov-color-bg-surface-raised);
  text-align: left;
  padding: 4px 8px;
  font-weight: var(--ov-font-weight-semibold, 600);
  color: var(--ov-color-fg-muted);
  border-bottom: 1px solid var(--ov-color-border-default);
  white-space: nowrap;
  font-size: 11px;
}

.Table td {
  padding: 2px 8px;
  border-bottom: 1px solid var(--ov-color-border-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.Table tbody tr {
  cursor: pointer;
}

.Table tbody tr:hover td {
  background: var(--ov-color-state-hover);
}

.Table tbody tr[data-ov-selected='true'] td {
  background: var(--ov-color-state-selected, rgba(99, 102, 241, 0.12));
}

/* ─── Cells ─── */

.FileIcon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.FileIcon[data-ov-filetype='folder'] {
  color: var(--ov-color-warning, #e0a54a);
}

.FileIcon[data-ov-filetype='file'] {
  color: var(--ov-color-fg-subtle);
}

.SizeCell {
  text-align: right;
  color: var(--ov-color-fg-muted);
  font-family: var(--ov-font-mono, monospace);
  font-size: 11px;
}

.TypeCell {
  color: var(--ov-color-fg-muted);
}

.DateCell {
  color: var(--ov-color-fg-muted);
  font-size: 11px;
}

.MonoCell {
  font-family: var(--ov-font-mono, monospace);
  font-size: 11px;
}

.ParentRow {
  color: var(--ov-color-fg-muted);
}

.RowActions {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 100ms;
}

.Table tbody tr:hover .RowActions {
  opacity: 1;
}

/* ─── Status ─── */

.Status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 12px;
  border-top: 1px solid var(--ov-color-border-default);
  background: var(--ov-color-bg-surface-raised);
  flex-shrink: 0;
  font-size: 11px;
  color: var(--ov-color-fg-muted);
}
```

- [ ] **Step 4: Create the index**

Create `packages/base-ui/src/components/file-table/index.ts`:

```tsx
export { FileTable, FileTableColumn, FileTableRoot, FileTableHeader, FileTableBody, FileTableStatus } from './FileTable';
export type { FileTableRootProps, FileTableColumnProps, FileTableBodyProps, FileTableHeaderProps } from './FileTable';
export type { FileTableItem } from './FileTableContext';
export { formatBytes, formatDate, fileTypeLabel } from './utils';
```

- [ ] **Step 5: Add barrel export**

In `packages/base-ui/src/components/index.ts`, add:

```ts
export * from './file-table';
```

- [ ] **Step 6: Run type check**

Run: `pnpm tsc --noEmit --project packages/base-ui/tsconfig.json`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add packages/base-ui/src/components/file-table/ \
  packages/base-ui/src/components/index.ts
git commit -m "feat(file-table): add FileTable compound component"
```

---

### Task 6: FileTable Tests

**Files:**
- Create: `packages/base-ui/src/components/file-table/FileTable.test.tsx`

- [ ] **Step 1: Write integration tests**

Create `packages/base-ui/src/components/file-table/FileTable.test.tsx`:

```tsx
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { FileTable } from './FileTable';
import type { FileTableItem } from './FileTableContext';

const items: FileTableItem[] = [
  { id: 'f1', name: 'src', type: 'folder', modified: '2026-03-10T14:00:00Z' },
  { id: 'f2', name: 'package.json', type: 'file', size: 862, modified: '2026-03-10T12:00:00Z', extension: 'json' },
  { id: 'f3', name: 'README.md', type: 'file', size: 510, modified: '2026-03-09T10:00:00Z', extension: 'md' },
  { id: 'f4', name: 'public', type: 'folder', modified: '2026-03-01T09:00:00Z' },
];

function renderTable(props?: Partial<React.ComponentProps<typeof FileTable.Root>>) {
  return renderWithTheme(
    <FileTable.Root items={items} {...props}>
      <FileTable.Header />
      <FileTable.Body />
      <FileTable.Status />
    </FileTable.Root>,
  );
}

describe('FileTable', () => {
  it('renders all items', () => {
    renderTable();
    expect(screen.getByText('src')).toBeVisible();
    expect(screen.getByText('package.json')).toBeVisible();
    expect(screen.getByText('README.md')).toBeVisible();
    expect(screen.getByText('public')).toBeVisible();
  });

  it('sorts folders before files', () => {
    renderTable();
    const rows = screen.getAllByRole('row');
    // row 0 = header, row 1 & 2 = folders, row 3 & 4 = files
    expect(rows[1]).toHaveTextContent('public');  // p before s
    expect(rows[2]).toHaveTextContent('src');
  });

  it('renders status with correct counts', () => {
    renderTable();
    expect(screen.getByText('Files: 2')).toBeVisible();
    expect(screen.getByText('Folders: 2')).toBeVisible();
  });

  it('calls onSelect when row is clicked', () => {
    const onSelect = vi.fn();
    renderTable({ onSelect });
    fireEvent.click(screen.getByText('package.json'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'f2' }));
  });

  it('calls onNavigate when folder is double-clicked', () => {
    const onNavigate = vi.fn();
    renderTable({ onNavigate });
    fireEvent.doubleClick(screen.getByText('src'));
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' }));
  });

  it('does not call onNavigate when file is double-clicked', () => {
    const onNavigate = vi.fn();
    renderTable({ onNavigate });
    fireEvent.doubleClick(screen.getByText('package.json'));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('renders ".." row when showParent is true', () => {
    const onNavigateUp = vi.fn();
    renderTable({ showParent: true, onNavigateUp });
    expect(screen.getByText('..')).toBeVisible();
    fireEvent.doubleClick(screen.getByText('..'));
    expect(onNavigateUp).toHaveBeenCalled();
  });

  it('does not render ".." row when showParent is false', () => {
    renderTable({ showParent: false });
    expect(screen.queryByText('..')).not.toBeInTheDocument();
  });

  it('renders extra columns', () => {
    renderWithTheme(
      <FileTable.Root items={items}>
        <FileTable.Header>
          <FileTable.Column id="custom" header="Custom" accessor={(i) => i.id} />
        </FileTable.Header>
        <FileTable.Body />
      </FileTable.Root>,
    );

    expect(screen.getByText('Custom')).toBeVisible();
    // The column values should render
    expect(screen.getByText('f1')).toBeVisible();
  });

  it('highlights selected row via data attribute', () => {
    renderTable({ selectedId: 'f2' });
    const row = screen.getByText('package.json').closest('tr');
    expect(row).toHaveAttribute('data-ov-selected', 'true');
  });

  it('toggles sort direction on header click', () => {
    renderTable();
    const nameHeader = screen.getByRole('button', { name: /Filename/ });

    // Default ascending — folders first, then alphabetical
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('public');

    // Click to toggle descending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    // Folders still first (folder-first is always applied), but reversed within groups
    expect(rows[1]).toHaveTextContent('src');
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd packages/base-ui && pnpm vitest run src/components/file-table/FileTable.test.tsx`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add packages/base-ui/src/components/file-table/FileTable.test.tsx
git commit -m "test(file-table): add FileTable integration tests"
```

---

## Chunk 3: Demo Integration

### Task 7: Refactor TransferPanel to use Tabs + Progress

**Files:**
- Modify: `apps/showcase/src/demos/file-explorer/components/TransferPanel.tsx`
- Modify: `apps/showcase/src/demos/file-explorer/components/TransferPanel.module.css`

- [ ] **Step 1: Refactor TransferPanel**

Replace the hand-rolled tab bar with `Tabs` + `endDecorator` badges, and replace the hand-rolled progress bar with the `Progress` component.

Rewrite `apps/showcase/src/demos/file-explorer/components/TransferPanel.tsx`:

```tsx
import { useMemo } from 'react';
import { LuArrowUp, LuArrowDown } from 'react-icons/lu';
import { Tabs, Badge, Progress, formatBytes } from '@omniviewdev/base-ui';
import type { Transfer } from '../types';
import styles from './TransferPanel.module.css';

export interface TransferPanelProps {
  transfers: Transfer[];
}

function statusColor(status: Transfer['status']): 'info' | 'danger' | 'success' | 'neutral' {
  switch (status) {
    case 'processing': return 'info';
    case 'failed': return 'danger';
    case 'completed': return 'success';
    default: return 'neutral';
  }
}

function TransferTable({ transfers }: { transfers: Transfer[] }) {
  if (transfers.length === 0) {
    return <div className={styles.empty}>No transfers</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Source</th>
            <th>Direction</th>
            <th>Destination</th>
            <th>Size</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Remaining</th>
            <th>Speed</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id}>
              <td title={t.source}>{t.source}</td>
              <td>
                <span className={styles.directionIcon} data-dir={t.direction}>
                  {t.direction === 'upload' ? <LuArrowUp size={12} /> : <LuArrowDown size={12} />}
                  {t.direction === 'upload' ? 'Upload' : 'Download'}
                </span>
              </td>
              <td title={t.destination}>{t.destination}</td>
              <td>{formatBytes(t.size)}</td>
              <td>{t.priority}</td>
              <td>
                <span className={styles.statusLabel} data-status={t.status}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
              </td>
              <td>{t.remaining ?? '—'}</td>
              <td>{t.speed ?? '—'}</td>
              <td className={styles.progressCell}>
                <Progress value={t.progress} color={statusColor(t.status)} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TransferPanel({ transfers }: TransferPanelProps) {
  const counts = useMemo(() => ({
    queued: transfers.filter((t) => t.status === 'queued' || t.status === 'processing').length,
    failed: transfers.filter((t) => t.status === 'failed').length,
    completed: transfers.filter((t) => t.status === 'completed').length,
  }), [transfers]);

  const queued = useMemo(() => transfers.filter((t) => t.status === 'queued' || t.status === 'processing'), [transfers]);
  const failed = useMemo(() => transfers.filter((t) => t.status === 'failed'), [transfers]);
  const completed = useMemo(() => transfers.filter((t) => t.status === 'completed'), [transfers]);

  return (
    <div className={styles.root}>
      <Tabs.Root defaultValue="queued" variant="flat" size="sm">
        <Tabs.List className={styles.tabList} aria-label="Transfer status">
          <Tabs.Tab value="queued" endDecorator={<Badge size="sm" color="info">{counts.queued}</Badge>}>
            Queued
          </Tabs.Tab>
          <Tabs.Tab value="failed" endDecorator={<Badge size="sm" color="danger">{counts.failed}</Badge>}>
            Failed Transfers
          </Tabs.Tab>
          <Tabs.Tab value="completed" endDecorator={<Badge size="sm" color="success">{counts.completed}</Badge>}>
            Completed Transfers
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Panel value="queued" className={styles.tabPanel}>
          <TransferTable transfers={queued} />
        </Tabs.Panel>
        <Tabs.Panel value="failed" className={styles.tabPanel}>
          <TransferTable transfers={failed} />
        </Tabs.Panel>
        <Tabs.Panel value="completed" className={styles.tabPanel}>
          <TransferTable transfers={completed} />
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
```

- [ ] **Step 2: Simplify the CSS**

Rewrite `apps/showcase/src/demos/file-explorer/components/TransferPanel.module.css` — remove all the hand-rolled tab/badge/progress styles, keep only the layout and table styles:

```css
.root {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--ov-color-bg-surface);
  border-top: 1px solid var(--ov-color-border-default);
}

.tabList {
  padding: 0 12px;
}

.tabPanel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.tableWrap {
  height: 100%;
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  font-family: var(--ov-font-sans);
}

.table th {
  position: sticky;
  top: 0;
  background: var(--ov-color-bg-surface-raised);
  text-align: left;
  padding: 4px 8px;
  font-weight: var(--ov-font-weight-semibold, 600);
  color: var(--ov-color-fg-muted);
  border-bottom: 1px solid var(--ov-color-border-subtle);
  white-space: nowrap;
}

.table td {
  padding: 3px 8px;
  border-bottom: 1px solid var(--ov-color-border-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.table tr:hover td {
  background: var(--ov-color-state-hover);
}

.directionIcon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.directionIcon[data-dir='upload'] {
  color: var(--ov-color-info, #5b9bd5);
}

.directionIcon[data-dir='download'] {
  color: var(--ov-color-success, #6abf69);
}

.progressCell {
  min-width: 100px;
}

.statusLabel {
  font-size: 11px;
}

.statusLabel[data-status='processing'] { color: var(--ov-color-info, #5b9bd5); }
.statusLabel[data-status='completed'] { color: var(--ov-color-success, #6abf69); }
.statusLabel[data-status='failed'] { color: var(--ov-color-danger, #dc5050); }
.statusLabel[data-status='queued'] { color: var(--ov-color-fg-muted); }

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ov-color-fg-subtle);
  font-size: var(--ov-font-size-sm, 12px);
}
```

- [ ] **Step 3: Verify the build**

Run: `pnpm tsc --noEmit --project apps/showcase/tsconfig.json`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/src/demos/file-explorer/components/TransferPanel.tsx \
  apps/showcase/src/demos/file-explorer/components/TransferPanel.module.css
git commit -m "refactor(file-explorer): use Tabs + Progress in TransferPanel"
```

---

### Task 8: Refactor FilePane to use FileTable

**Files:**
- Modify: `apps/showcase/src/demos/file-explorer/components/FilePane.tsx`
- Modify: `apps/showcase/src/demos/file-explorer/components/FilePane.module.css`
- Modify: `apps/showcase/src/demos/file-explorer/data.ts`

- [ ] **Step 1: Update data.ts imports**

In `apps/showcase/src/demos/file-explorer/data.ts`, replace the local `formatBytes`, `formatDate`, `fileTypeLabel` with imports from base-ui. Remove the local function definitions and add re-exports:

At the top of the file, add:
```tsx
// Re-export formatting utilities from base-ui for backward compat
export { formatBytes, formatDate, fileTypeLabel } from '@omniviewdev/base-ui';
```

Remove the local `formatBytes`, `formatDate`, and `fileTypeLabel` function definitions from data.ts (keep `countNodes`, `timeAgo` which are demo-specific).

- [ ] **Step 2: Refactor FilePane to use FileTable**

Replace the inline `<table>` section in `apps/showcase/src/demos/file-explorer/components/FilePane.tsx` with `FileTable`. The tree, breadcrumbs, header, and action bar remain as-is — only the table and status sections change.

Key changes in FilePane.tsx:
- Import `FileTable` and `IconButton` from `@omniviewdev/base-ui`
- Remove inline sort state (`sortKey`, `sortAsc`, `handleSort`, `sortItems`, `renderTh`)
- Remove inline `tableItems` and `counts` computations
- Replace the `<div className={styles.tableSection}>` block and `<div className={styles.statusBar}>` block with:

```tsx
<FileTable.Root
  items={currentDir.children ?? []}
  onNavigate={handleRowDoubleClick}
  onSelect={(item) => setSelectedFile(item.id)}
  selectedId={selectedFile ?? undefined}
  showParent={currentPath.length > 1}
  onNavigateUp={handleGoUp}
  className={styles.tableSection}
>
  <FileTable.Header>
    {isRemote && (
      <FileTable.Column
        id="owner"
        header="Owner / Group"
        accessor={(item) => `${(item as any).owner ?? 'sftpclient'} / ${(item as any).group ?? 'sftp'}`}
        width={100}
      />
    )}
    {isRemote && (
      <FileTable.Column
        id="permissions"
        header="Permissions"
        accessor={(item) => item.permissions ?? 'rwxr-xr-x'}
        mono
        width={90}
      />
    )}
  </FileTable.Header>
  <FileTable.Body
    rowActions={(item) => (
      <IconButton
        variant="ghost"
        size="sm"
        dense
        aria-label={isRemote ? 'Download' : 'Upload'}
        onClick={(e) => {
          e.stopPropagation();
          handleAction(`${isRemote ? 'Download' : 'Upload'}: ${item.name}`);
        }}
      >
        {isRemote ? <LuDownload size={12} /> : <LuUpload size={12} />}
      </IconButton>
    )}
  />
  <FileTable.Status />
</FileTable.Root>
```

- [ ] **Step 3: Simplify FilePane.module.css**

Remove the inline table styles from `FilePane.module.css`:
- Remove `.fileTable`, `.fileTable th`, `.fileTable td`, `.fileTable tbody tr`, etc.
- Remove `.colIcon`, `.colName`, `.colTransfer`, `.colSize`, `.colType`, `.colModified`, `.colOwner`, `.colPermissions`
- Remove `.fileIcon`, `.transferBtn`, `.parentRow`, `.nameCell`, `.sizeCell`, `.typeCell`, `.dateCell`, `.ownerCell`
- Remove `.sortIcon`
- Remove `.statusBar`
- Keep `.tableSection` but simplify it to just `flex: 1; min-height: 0;`

- [ ] **Step 4: Verify the build**

Run: `pnpm tsc --noEmit --project apps/showcase/tsconfig.json`
Expected: No errors

- [ ] **Step 5: Verify visually**

Run: `cd apps/showcase && pnpm dev`
Open the file explorer demo and verify:
- File table renders with sortable headers
- Folder-first sorting works
- ".." navigation works
- Row selection highlights
- Transfer actions show on hover
- Remote pane shows Owner/Group and Permissions columns
- Status bar shows correct counts

- [ ] **Step 6: Commit**

```bash
git add apps/showcase/src/demos/file-explorer/
git commit -m "refactor(file-explorer): use FileTable component in FilePane"
```

---

## Chunk 4: Final Verification

### Task 9: Run All Tests + Type Check

- [ ] **Step 1: Run base-ui tests**

Run: `cd packages/base-ui && pnpm vitest run`
Expected: All tests PASS

- [ ] **Step 2: Run full type check**

Run: `pnpm tsc --noEmit --project packages/base-ui/tsconfig.json && pnpm tsc --noEmit --project apps/showcase/tsconfig.json`
Expected: No errors for both

- [ ] **Step 3: Final commit if any fixes were needed**

If any fixes were made during verification, commit them.
