import { forwardRef, useCallback, useMemo, useState, type HTMLAttributes } from 'react';
import styles from './ObjectInspector.module.css';

export type InspectorFormat = 'json' | 'yaml';

export interface ObjectInspectorProps extends HTMLAttributes<HTMLDivElement> {
  data: unknown;
  format?: InspectorFormat;
  defaultExpanded?: boolean | number;
  searchable?: boolean;
  copyable?: boolean;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function getType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  return String(value);
}

function shouldExpand(defaultExpanded: boolean | number, depth: number): boolean {
  if (typeof defaultExpanded === 'boolean') return defaultExpanded;
  return depth < defaultExpanded;
}

function matchesSearch(key: string, value: unknown, query: string): boolean {
  const q = query.toLowerCase();
  if (key.toLowerCase().includes(q)) return true;
  if (typeof value === 'string' && value.toLowerCase().includes(q)) return true;
  if (typeof value === 'number' && String(value).includes(q)) return true;
  if (typeof value === 'boolean' && String(value).includes(q)) return true;
  return false;
}

/** Check if a value is a non-null object that can be tracked by WeakSet. */
function isObjectRef(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}

interface TreeNodeProps {
  nodeKey: string;
  value: unknown;
  depth: number;
  defaultExpanded: boolean | number;
  searchQuery: string;
  isLast: boolean;
  /** Ancestor object references for circular reference detection. */
  ancestors: WeakSet<object>;
}

function TreeNode({
  nodeKey,
  value,
  depth,
  defaultExpanded,
  searchQuery,
  isLast,
  ancestors,
}: TreeNodeProps) {
  const type = getType(value);
  const isExpandable = type === 'object' || type === 'array';

  // Detect circular references by checking if this value is already an ancestor
  const isCircular = isExpandable && isObjectRef(value) && ancestors.has(value);

  const [expanded, setExpanded] = useState(
    () => isExpandable && !isCircular && shouldExpand(defaultExpanded, depth),
  );

  // Create a new ancestors set that includes this value for children.
  // WeakSet doesn't support iteration, so we use a duck-typed wrapper
  // that checks both the parent set and the current value.
  const childAncestors = useMemo(() => {
    if (!isExpandable || !isObjectRef(value) || isCircular) return ancestors;
    return {
      has: (v: object) => v === value || ancestors.has(v),
    } as WeakSet<object>;
  }, [isExpandable, value, isCircular, ancestors]);

  const entries = useMemo(() => {
    if (!isExpandable || value === null || value === undefined || isCircular) return [];
    return Object.entries(value as Record<string, unknown>);
  }, [isExpandable, value, isCircular]);

  const toggle = useCallback(() => {
    if (isExpandable && !isCircular) setExpanded((prev) => !prev);
  }, [isExpandable, isCircular]);

  const isHighlighted = searchQuery && matchesSearch(nodeKey, value, searchQuery);

  const preview = isCircular
    ? '[Circular]'
    : isExpandable
      ? type === 'array'
        ? `Array(${(value as unknown[]).length})`
        : `{${entries.length}}`
      : null;

  return (
    <div className={styles.Node} data-depth={depth}>
      <div
        className={cn(styles.Row, isHighlighted && styles.RowHighlight)}
        style={{ paddingLeft: depth * 16 }}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        tabIndex={0}
        role="treeitem"
        aria-expanded={isExpandable && !isCircular ? expanded : undefined}
        data-testid={`inspector-node-${nodeKey}`}
      >
        {isExpandable && !isCircular ? (
          <span className={cn(styles.Chevron, expanded && styles.ChevronExpanded)}>&#9656;</span>
        ) : (
          <span className={styles.ChevronSpacer} />
        )}
        <span className={styles.Key}>{nodeKey}</span>
        <span className={styles.Colon}>: </span>
        {isExpandable ? (
          <span className={styles.Preview}>{preview}</span>
        ) : (
          <span className={styles.Value} data-type={type}>
            {formatValue(value)}
          </span>
        )}
        {!isLast && !expanded && <span className={styles.Comma}>,</span>}
      </div>
      {expanded &&
        entries.map(([k, v], i) => (
          <TreeNode
            key={k}
            nodeKey={k}
            value={v}
            depth={depth + 1}
            defaultExpanded={defaultExpanded}
            searchQuery={searchQuery}
            isLast={i === entries.length - 1}
            ancestors={childAncestors}
          />
        ))}
    </div>
  );
}

/** Shared empty WeakSet used as the initial ancestors set. */
const EMPTY_ANCESTORS = new WeakSet<object>();

export const ObjectInspector = forwardRef<HTMLDivElement, ObjectInspectorProps>(
  function ObjectInspector(
    {
      data,
      format = 'json',
      defaultExpanded = 1,
      searchable = false,
      copyable = false,
      className,
      ...props
    },
    ref,
  ) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleCopy = useCallback(async () => {
      try {
        let text: string;
        if (format === 'yaml') {
          text = toYaml(data);
        } else {
          text = safeJsonStringify(data);
        }
        await navigator.clipboard.writeText(text);
      } catch {
        // Clipboard API may not be available (e.g., insecure context)
      }
    }, [data, format]);

    // Root starts with an empty ancestors set — the root node itself
    // is not its own ancestor, but its children will see it as one
    const rootAncestors = EMPTY_ANCESTORS;

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        data-testid="object-inspector"
        data-format={format}
        {...props}
      >
        {(searchable || copyable) && (
          <div className={styles.Toolbar}>
            {searchable && (
              <input
                className={styles.SearchInput}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keys/values…"
                aria-label="Search object"
                data-testid="inspector-search"
              />
            )}
            {copyable && (
              <button
                className={styles.CopyButton}
                onClick={handleCopy}
                data-testid="inspector-copy"
                type="button"
              >
                Copy
              </button>
            )}
          </div>
        )}
        <div className={styles.Tree} role="tree" data-testid="inspector-tree">
          <TreeNode
            nodeKey="root"
            value={data}
            depth={0}
            defaultExpanded={defaultExpanded}
            searchQuery={searchQuery}
            isLast
            ancestors={rootAncestors}
          />
        </div>
      </div>
    );
  },
);

ObjectInspector.displayName = 'ObjectInspector';

/** JSON.stringify with circular reference safety. */
function safeJsonStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    },
    2,
  );
}

/** Simple YAML serializer (no dependency) */
function toYaml(value: unknown, indent: number = 0, seen?: WeakSet<object>): string {
  const prefix = '  '.repeat(indent);
  if (value === null) return 'null';
  if (value === undefined) return 'null';
  if (typeof value === 'string')
    return value.includes('\n')
      ? `|\n${prefix}  ${value.split('\n').join(`\n${prefix}  `)}`
      : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  // Circular reference guard for objects/arrays
  if (typeof value === 'object') {
    const tracking = seen ?? new WeakSet<object>();
    if (tracking.has(value as object)) return '[Circular]';
    tracking.add(value as object);

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return value
        .map((item) => `${prefix}- ${toYaml(item, indent + 1, tracking).trimStart()}`)
        .join('\n');
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        const serialized = toYaml(v, indent + 1, tracking);
        if (
          typeof v === 'object' &&
          v !== null &&
          (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)
        ) {
          return `${prefix}${k}:\n${serialized}`;
        }
        return `${prefix}${k}: ${serialized}`;
      })
      .join('\n');
  }

  return String(value);
}
