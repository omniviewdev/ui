import { Component, type ReactNode, type RefObject } from 'react';
import type { FlatNode, Key } from './types';

interface Props {
  viewport: RefObject<HTMLDivElement | null>;
  nodes: readonly FlatNode[];
  expandedKeys: ReadonlySet<Key>;
  enabled: boolean;
  children: ReactNode;
}

interface Snapshot {
  positions: Map<string, number>;
  previousKeys: ReadonlySet<string>;
  visibleKeys: Set<string>;
  scrollTop: number;
  reveals?: Map<string, { opacity: string; clipPath: string }>;
}

interface RowAnimation {
  animation: Animation;
  revealing: boolean;
}

function sameKeys(a: ReadonlySet<Key>, b: ReadonlySet<Key>): boolean {
  if (a.size !== b.size) return false;
  for (const key of a) if (!b.has(key)) return false;
  return true;
}

function sameNodeKeys(a: readonly FlatNode[], b: readonly FlatNode[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index]!.key !== b[index]!.key) return false;
  }
  return true;
}

function panelDuration(element: HTMLElement): number {
  if (element.closest('[data-ov-motion="reduced"]')) return 0;
  const preference = element.closest('[data-ov-motion]')?.getAttribute('data-ov-motion');
  if (preference !== 'normal' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    return 0;
  const value = getComputedStyle(element).getPropertyValue('--ov-duration-panel').trim();
  const duration = Number.parseFloat(value);
  if (!Number.isFinite(duration)) return 0;
  return value.endsWith('ms') ? duration : duration * 1000;
}

/** React's pre-commit snapshot reads the actual visual pose before rows move.
 * This includes interrupted animations and virtualizer size corrections; cached
 * post-commit rectangles cannot reliably distinguish those from a new layout.
 */
export class TreeExpansionMotion extends Component<Props, Record<string, never>, Snapshot | null> {
  private expanded = this.props.expandedKeys;
  private pendingExpansion = false;
  private animations = new Map<HTMLElement, RowAnimation>();
  private stopListening: (() => void) | undefined;
  private snapshot: { nodes: readonly FlatNode[]; positions: Snapshot } | undefined;

  private cancel = () => {
    for (const { animation } of this.animations.values()) animation.cancel();
    this.animations.clear();
    this.snapshot = undefined;
  };

  private listen() {
    const element = this.props.viewport.current;
    if (!this.props.enabled || !element) return;
    const respectPreference = () => {
      if (panelDuration(element) === 0) this.cancel();
    };
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    media?.addEventListener('change', respectPreference);
    const observer = new MutationObserver(respectPreference);
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-ov-motion'],
    });
    this.stopListening = () => {
      media?.removeEventListener('change', respectPreference);
      observer.disconnect();
    };
  }

  componentDidMount() {
    this.listen();
  }

  getSnapshotBeforeUpdate(previous: Props): Snapshot | null {
    this.pendingExpansion ||= !sameKeys(this.expanded, this.props.expandedKeys);
    this.expanded = this.props.expandedKeys;
    const element = this.props.viewport.current;
    if (
      !this.props.enabled ||
      !element ||
      element.closest('[inert]') ||
      element.clientHeight === 0
    ) {
      this.pendingExpansion = false;
      return null;
    }
    if (previous.nodes === this.props.nodes || !this.pendingExpansion) return null;
    this.pendingExpansion = false;
    if (panelDuration(element) === 0) return null;
    const top = element.getBoundingClientRect().top;
    const snapshot: Snapshot = {
      positions: new Map(),
      previousKeys: new Set(previous.nodes.map((node) => String(node.key))),
      visibleKeys: new Set(),
      scrollTop: element.scrollTop,
    };
    for (const row of element.querySelectorAll<HTMLElement>('[role="treeitem"]')) {
      const rect = row.getBoundingClientRect();
      const key = row.dataset.ovItemKey!;
      snapshot.positions.set(key, rect.top - top + element.scrollTop);
      if (rect.bottom > top && rect.top < top + element.clientHeight) snapshot.visibleKeys.add(key);
      if (this.animations.get(row)?.revealing) {
        const style = getComputedStyle(row);
        (snapshot.reveals ??= new Map()).set(key, {
          opacity: style.opacity,
          clipPath: style.clipPath,
        });
      }
    }
    this.snapshot = { nodes: this.props.nodes, positions: snapshot };
    return snapshot;
  }

  componentDidUpdate(previous: Props, _state: Record<string, never>, snapshot: Snapshot | null) {
    if (previous.enabled !== this.props.enabled) {
      this.stopListening?.();
      this.stopListening = undefined;
      this.cancel();
      this.listen();
    }
    if (!snapshot && !sameNodeKeys(previous.nodes, this.props.nodes)) this.cancel();
  }

  /** The viewport publishes flattened rows after the source render commits. */
  flush(nodes: readonly FlatNode[]) {
    if (!this.props.enabled) {
      this.cancel();
      return;
    }
    if (this.snapshot?.nodes !== nodes) return;
    const snapshot = this.snapshot.positions;
    this.snapshot = undefined;
    const element = this.props.viewport.current;
    if (!snapshot || !element || element.closest('[inert]')) return;
    const duration = panelDuration(element);
    if (!duration) {
      this.cancel();
      return;
    }
    const easing =
      getComputedStyle(element).getPropertyValue('--ov-ease-standard').trim() || 'ease';
    const viewportTop = element.getBoundingClientRect().top;
    const scrollShift = element.scrollTop - snapshot.scrollTop;
    const ranges = new Map<string, { first: number; end: number; index: number }>();
    for (let first = 0; first < nodes.length;) {
      if (snapshot.previousKeys.has(String(nodes[first]!.key))) {
        first += 1;
        continue;
      }
      let end = first + 1;
      while (end < nodes.length && !snapshot.previousKeys.has(String(nodes[end]!.key))) end += 1;
      for (let index = first; index < end; index += 1)
        ranges.set(String(nodes[index]!.key), { first, end, index });
      first = end;
    }
    const geometry = new Map<string, { row: HTMLElement; rect: DOMRect; top: number }>();
    for (const row of element.querySelectorAll<HTMLElement>('[role="treeitem"]')) {
      this.animations.get(row)?.animation.cancel();
      this.animations.delete(row);
      const rect = row.getBoundingClientRect();
      geometry.set(row.dataset.ovItemKey!, {
        row,
        rect,
        top: rect.top - viewportTop + element.scrollTop,
      });
    }
    for (const [key, { row, rect, top }] of geometry) {
      if (
        typeof row.animate !== 'function' ||
        (!snapshot.visibleKeys.has(key) &&
          (rect.bottom <= viewportTop || rect.top >= viewportTop + element.clientHeight))
      )
        continue;
      const before = snapshot.positions.get(key);
      const range = ranges.get(key);
      const reveal = snapshot.reveals?.get(key);
      if (before === undefined && !range) continue;
      const delta = before === undefined ? 0 : before - top + scrollShift;
      if (!range && !reveal && Math.abs(delta) < 0.5) continue;
      const style = getComputedStyle(row);
      const base = style.transform === 'none' ? '' : style.transform;
      let from: Keyframe = { transform: `translateY(${delta}px) ${base}`, opacity: style.opacity };
      let to: Keyframe = { transform: base || 'none', opacity: style.opacity };
      if (range) {
        const followingKey = nodes[range.end]?.key;
        const following =
          followingKey === undefined ? undefined : geometry.get(String(followingKey));
        const first = geometry.get(String(nodes[range.first]!.key));
        const start = first?.top ?? top - (range.index - range.first) * rect.height;
        const end = following?.top ?? start + (range.end - range.first) * rect.height;
        const previousFollowing =
          followingKey === undefined ? undefined : snapshot.positions.get(String(followingKey));
        const boundary = previousFollowing === undefined ? start : previousFollowing + scrollShift;
        // Reveal children only in the space opened by the moving following row.
        // A simple fade at their final positions would overlap that row.
        from = {
          transform: base || 'none',
          opacity: 0,
          clipPath: `inset(0px 0px ${top + rect.height - boundary}px 0px)`,
        };
        to = {
          transform: base || 'none',
          opacity: style.opacity,
          clipPath: `inset(0px 0px ${top + rect.height - end}px 0px)`,
        };
      } else if (reveal) {
        // Keep partially revealed children clipped while their following row is still moving.
        from.opacity = reveal.opacity;
        from.clipPath = reveal.clipPath;
        to.clipPath = style.clipPath && style.clipPath !== 'none' ? style.clipPath : 'inset(0px)';
      }
      const animation = row.animate([from, to], { duration, easing });
      this.animations.set(row, {
        animation,
        revealing: range !== undefined || reveal !== undefined,
      });
      void animation.finished.then(
        () => {
          if (this.animations.get(row)?.animation === animation) this.animations.delete(row);
        },
        () => {},
      );
    }
    for (const [row, { animation }] of this.animations) {
      if (!row.isConnected) {
        animation.cancel();
        this.animations.delete(row);
      }
    }
  }

  componentWillUnmount() {
    this.stopListening?.();
    this.cancel();
  }

  render() {
    return this.props.children;
  }
}
