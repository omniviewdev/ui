import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
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
  if (typeof value === 'string') return JSON.stringify(value);
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

/** Subset of WeakSet used for ancestor tracking (read-only checks). */
interface AncestorSet {
  has(value: object): boolean;
}

/**
 * Check if any descendant of `value` matches `query`. Results are cached
 * per object+query in `cache` to avoid O(n²) re-scanning from each TreeNode.
 */
function subtreeMatches(
  value: unknown,
  query: string,
  ancestors: AncestorSet,
  cache: WeakMap<object, boolean>,
): boolean {
  if (!query) return false;
  const type = getType(value);
  if (type !== 'object' && type !== 'array') return false;
  if (value === null || value === undefined) return false;
  if (isObjectRef(value) && ancestors.has(value)) return false;

  // Return cached result if available
  if (isObjectRef(value) && cache.has(value)) return cache.get(value)!;

  const childAncestors: AncestorSet = {
    has: (v: object) => v === value || ancestors.has(v),
  };
  let result = false;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (matchesSearch(k, v, query) || subtreeMatches(v, query, childAncestors, cache)) {
      result = true;
      break;
    }
  }

  if (isObjectRef(value)) cache.set(value, result);
  return result;
}

interface TreeNodeProps {
  nodeKey: string;
  value: unknown;
  depth: number;
  defaultExpanded: boolean | number;
  searchQuery: string;
  isLast: boolean;
  /** Ancestor object references for circular reference detection. */
  ancestors: AncestorSet;
  /** Per-query cache for subtreeMatches results (shared across all nodes). */
  searchCache: WeakMap<object, boolean>;
}

function TreeNode({
  nodeKey,
  value,
  depth,
  defaultExpanded,
  searchQuery,
  isLast,
  ancestors,
  searchCache,
}: TreeNodeProps) {
  const type = getType(value);
  const isExpandable = type === 'object' || type === 'array';

  // Detect circular references by checking if this value is already an ancestor
  const isCircular = isExpandable && isObjectRef(value) && ancestors.has(value);

  const [expanded, setExpanded] = useState(
    () => isExpandable && !isCircular && shouldExpand(defaultExpanded, depth),
  );

  // Track whether the node was force-expanded by search so we can restore
  // the exact pre-search state when the search is cleared.
  const searchExpandedRef = useRef(false);
  const preSearchExpandedRef = useRef(false);

  // Auto-expand when search matches a descendant
  const hasDescendantMatch = useMemo(
    () => searchQuery ? subtreeMatches(value, searchQuery, ancestors, searchCache) : false,
    [searchQuery, value, ancestors, searchCache],
  );

  // Force expand when search finds matches in descendants
  useEffect(() => {
    if (searchQuery && hasDescendantMatch && isExpandable && !isCircular && !expanded) {
      // Only snapshot pre-search state the first time we force-open
      if (!searchExpandedRef.current) {
        preSearchExpandedRef.current = expanded;
      }
      searchExpandedRef.current = true;
      setExpanded(true);
    }
    // Restore pre-search state when search clears OR node stops matching
    if (searchExpandedRef.current && (!searchQuery || !hasDescendantMatch)) {
      searchExpandedRef.current = false;
      setExpanded(preSearchExpandedRef.current);
    }
  }, [searchQuery, hasDescendantMatch, isExpandable, isCircular, expanded]);

  // Create a new ancestors set that includes this value for children.
  // WeakSet doesn't support iteration, so we use a duck-typed wrapper
  // that checks both the parent set and the current value.
  const childAncestors = useMemo(() => {
    if (!isExpandable || !isObjectRef(value) || isCircular) return ancestors;
    return {
      has: (v: object) => v === value || ancestors.has(v),
    };
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
        style={{ '--_inspector-depth-indent': `${depth * 16}px` } as CSSProperties}
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
            searchCache={searchCache}
          />
        ))}
    </div>
  );
}

/** Shared empty WeakSet used as the initial ancestors set. */
const EMPTY_ANCESTORS: AncestorSet = new WeakSet<object>();

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

    // Per-query cache for subtreeMatches — invalidated when query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const searchCache = useMemo(() => new WeakMap<object, boolean>(), [searchQuery]);

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
            searchCache={searchCache}
          />
        </div>
      </div>
    );
  },
);

ObjectInspector.displayName = 'ObjectInspector';

/** JSON.stringify with circular reference safety (ancestor-stack approach). */
function safeJsonStringify(value: unknown): string {
  // Use an ancestor stack so shared (but non-cyclic) references serialize fully.
  // JSON.stringify calls the replacer with `this` bound to the object that
  // contains the current key. We track ancestors by pushing on enter and
  // popping when we leave.
  const stack: object[] = [];
  return JSON.stringify(
    value,
    function (this: unknown, _key: string, val: unknown) {
      if (typeof val !== 'object' || val === null) return val;

      // Trim the stack: `this` is the parent container. Pop until the
      // top of the stack IS the parent (or the stack is empty).
      while (stack.length > 0 && stack[stack.length - 1] !== this) {
        stack.pop();
      }

      if (stack.includes(val as object)) return '[Circular]';
      stack.push(val as object);
      return val;
    },
    2,
  );
}

/** Check if a YAML scalar needs quoting. */
function needsYamlQuoting(s: string): boolean {
  if (s === '') return true;
  if (/^[\s]/.test(s) || /[\s]$/.test(s)) return true;
  // Starts with indicator characters or reserved values
  if (/^[-?:,[\]{}#&*!|>'"%@`]/.test(s)) return true;
  // Contains colon+space, hash+space, or other flow indicators
  if (/[:\s]#|:\s|[{}[\],]/.test(s)) return true;
  // YAML boolean/null literals (case-insensitive)
  if (/^(true|false|yes|no|on|off|null|~)$/i.test(s)) return true;
  // Looks like a number
  if (/^[+-]?(\d+\.?\d*|\.inf|\.nan)$/i.test(s)) return true;
  return false;
}

/** Quote a YAML scalar with double quotes, escaping special chars. */
function quoteYaml(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r') + '"';
}

/** Safely serialize a string as a YAML scalar. */
function yamlScalar(s: string, indent: number): string {
  const prefix = '  '.repeat(indent);
  // Multi-line strings use block scalar
  if (s.includes('\n')) {
    return `|\n${prefix}  ${s.split('\n').join(`\n${prefix}  `)}`;
  }
  return needsYamlQuoting(s) ? quoteYaml(s) : s;
}

/** Simple YAML serializer (no dependency, ancestor-stack approach) */
function toYaml(value: unknown, indent: number = 0, ancestors?: object[]): string {
  const prefix = '  '.repeat(indent);
  if (value === null) return 'null';
  if (value === undefined) return 'null';
  if (typeof value === 'string') return yamlScalar(value, indent);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (typeof value === 'object') {
    const stack = ancestors ?? [];
    if (stack.includes(value)) return '"[Circular]"';
    const childStack = [...stack, value];

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return value
        .map((item) => `${prefix}- ${toYaml(item, indent + 1, childStack).trimStart()}`)
        .join('\n');
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        const safeKey = needsYamlQuoting(k) ? quoteYaml(k) : k;
        const serialized = toYaml(v, indent + 1, childStack);
        if (
          typeof v === 'object' &&
          v !== null &&
          (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)
        ) {
          return `${prefix}${safeKey}:\n${serialized}`;
        }
        return `${prefix}${safeKey}: ${serialized}`;
      })
      .join('\n');
  }

  return String(value);
}
