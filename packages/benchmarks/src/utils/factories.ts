/**
 * Shared data factories for benchmark tests.
 * Pre-generate data outside the benchmark loop so construction cost isn't measured.
 */

// ── Row data (DataTable, BasicList, SelectableList, RowList) ──

export interface Row {
  id: number;
  name: string;
  status: string;
  value: number;
}

export function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'inactive',
    value: (i * 7 + 13) % 1000,
  }));
}

// ── Tree node data (TreeList) ──

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export function makeTreeNodes(count: number, depth: number = 2): TreeNode[] {
  let created = 0;
  const roots: TreeNode[] = [];
  const queue: { node: TreeNode; depth: number }[] = [];

  // Create root-level nodes
  while (created < count) {
    const node: TreeNode = {
      id: `node-${created}`,
      label: `Node ${created}`,
    };
    created++;
    roots.push(node);
    if (depth > 0) queue.push({ node, depth: 1 });
  }

  // Breadth-first: attach children until budget exhausted
  while (queue.length > 0 && created < count) {
    const { node, depth: d } = queue.shift()!;
    const children: TreeNode[] = [];
    const childCount = Math.min(2, count - created);
    for (let i = 0; i < childCount; i++) {
      const child: TreeNode = {
        id: `node-${created}`,
        label: `Node ${created}`,
      };
      created++;
      children.push(child);
      if (d < depth) queue.push({ node: child, depth: d + 1 });
    }
    node.children = children;
  }

  return roots;
}

// ── Option data (Select, Autocomplete, Combobox, MultiSelect) ──

export interface Option {
  value: string;
  label: string;
}

export function makeOptions(count: number): Option[] {
  return Array.from({ length: count }, (_, i) => ({
    value: `option-${i}`,
    label: `Option ${i}`,
  }));
}

// ── Column definitions (DataTable, RowList) ──

export interface Column<T = Row> {
  id: string;
  header: string;
  accessorKey: keyof T;
}

export function makeColumns(): Column[] {
  return [
    { id: 'id', header: 'ID', accessorKey: 'id' },
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'status', header: 'Status', accessorKey: 'status' },
    { id: 'value', header: 'Value', accessorKey: 'value' },
  ];
}

// ── Tag data (TagInput, FilterBar) ──

export function makeTags(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `tag-${i}`);
}

// ── Command items (CommandList) ──

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
}

export function makeCommandItems(count: number): CommandItem[] {
  const groups = ['File', 'Edit', 'View', 'Navigate', 'Run'];
  return Array.from({ length: count }, (_, i) => ({
    id: `cmd-${i}`,
    label: `Command ${i}`,
    group: groups[i % groups.length],
    keywords: [`keyword-${i}`],
  }));
}

// ── Tab data (EditorTabs) ──

export interface TabItem {
  id: string;
  label: string;
  closable?: boolean;
}

export function makeTabs(count: number): TabItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `tab-${i}`,
    label: `Tab ${i}`,
    closable: true,
  }));
}

export interface EditorTabItem {
  id: string;
  title: string;
  closable?: boolean;
}

export function makeEditorTabs(count: number, prefix = ''): EditorTabItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}tab-${i}`,
    title: `File ${prefix}${i}.ts`,
    closable: true,
  }));
}
