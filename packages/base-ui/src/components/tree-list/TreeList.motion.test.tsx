import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TreeList } from './TreeList';

interface Entry {
  id: string;
  children?: Entry[];
}

const items: Entry[] = [
  { id: 'parent', children: [{ id: 'first' }, { id: 'second' }] },
  { id: 'last' },
];
const itemKey = (item: Entry) => item.id;
const getChildren = (item: Entry) => item.children;
const getTextValue = (item: Entry) => item.id;
const renderItem = (item: Entry) => (
  <TreeList.Item itemKey={item.id} style={{ opacity: 1 }}>
    {item.id}
  </TreeList.Item>
);

function Example({
  expanded,
  entries = items,
  extraExpanded = false,
}: {
  expanded: boolean;
  entries?: Entry[];
  extraExpanded?: boolean;
}) {
  return (
    <TreeList.Root
      items={entries}
      itemKey={itemKey}
      getChildren={getChildren}
      getTextValue={getTextValue}
      renderItem={renderItem}
      expandedKeys={new Set([...(expanded ? ['parent'] : []), ...(extraExpanded ? ['other'] : [])])}
      defaultActiveKey="last"
      animateExpansion
    >
      <TreeList.Viewport data-testid="motion-viewport" />
    </TreeList.Root>
  );
}

function row(id: string) {
  return screen.getByRole('treeitem', { name: id });
}

/** Model native scroll clamping/anchoring, which jsdom does not perform. */
function installGeometry(viewport: HTMLElement, scrollTop: () => number) {
  const frames = new Map<HTMLElement, Keyframe[]>();
  const poses = new Map<HTMLElement, { delta?: number; opacity?: string; clipPath?: string }>();
  const nativeComputedStyle = getComputedStyle;
  const styles = vi.spyOn(globalThis, 'getComputedStyle').mockImplementation((element, pseudo) => {
    const style = nativeComputedStyle(element, pseudo);
    const pose = poses.get(element as HTMLElement);
    if (!pose) return style;
    return new Proxy(style, {
      get(target, property) {
        if (property === 'opacity' && pose.opacity !== undefined) return pose.opacity;
        if (property === 'clipPath' && pose.clipPath !== undefined) return pose.clipPath;
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  });
  const previousAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
  Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 60 });
  Object.defineProperty(viewport, 'scrollTop', { configurable: true, get: scrollTop });
  viewport.style.setProperty('--ov-duration-panel', '160ms');
  viewport.style.setProperty('--ov-ease-standard', 'linear');
  const rects = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      if (this === viewport) return DOMRect.fromRect({ y: 100, width: 240, height: 60 });
      const index = Array.from(viewport.querySelectorAll('[role="treeitem"]')).indexOf(this);
      return DOMRect.fromRect({
        y: 100 + index * 20 - viewport.scrollTop + (poses.get(this)?.delta ?? 0),
        width: 240,
        height: 20,
      });
    });
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value(this: HTMLElement, keyframes: Keyframe[]) {
      frames.set(this, keyframes);
      return {
        cancel: vi.fn(() => poses.delete(this)),
        finished: Promise.withResolvers<void>().promise,
      };
    },
  });
  return {
    frames,
    poses,
    restore() {
      rects.mockRestore();
      styles.mockRestore();
      if (previousAnimate) Object.defineProperty(HTMLElement.prototype, 'animate', previousAnimate);
      else Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    },
  };
}

function startingOffset(frames: Keyframe[] | undefined) {
  return Number(String(frames?.[0]?.transform ?? '').match(/translateY\(([-.\d]+)px\)/)?.[1] ?? 0);
}

describe('TreeList expansion motion across native scrolling', () => {
  it('starts a surviving row at its previous visible position when collapse clamps scrollTop', () => {
    const { rerender } = renderWithTheme(<Example expanded />);
    const viewport = screen.getByTestId('motion-viewport');
    const geometry = installGeometry(viewport, () =>
      Math.max(0, Math.min(20, viewport.querySelectorAll('[role="treeitem"]').length * 20 - 60)),
    );
    try {
      const last = row('last');
      const before = last.getBoundingClientRect().top;
      expect(viewport.scrollTop).toBe(20);
      rerender(<Example expanded={false} />);
      expect(viewport.scrollTop).toBe(0);
      const visualStart =
        last.getBoundingClientRect().top + startingOffset(geometry.frames.get(last));
      expect(visualStart).toBe(before);
    } finally {
      geometry.restore();
    }
  });

  it('keeps anchored rows still and reveals entering rows at the previous visible boundary', () => {
    const entries = [
      ...items,
      ...Array.from({ length: 4 }, (_, index) => ({ id: `tail-${index}` })),
    ];
    const { rerender } = renderWithTheme(<Example expanded={false} entries={entries} />);
    const viewport = screen.getByTestId('motion-viewport');
    const geometry = installGeometry(viewport, () =>
      viewport.querySelectorAll('[role="treeitem"]').length > entries.length ? 40 : 0,
    );
    try {
      const last = row('last');
      const before = last.getBoundingClientRect().top;
      rerender(<Example expanded entries={entries} />);
      expect(viewport.scrollTop).toBe(40);
      expect(last.getBoundingClientRect().top + startingOffset(geometry.frames.get(last))).toBe(
        before,
      );
      const entering = row('second');
      const clip = String(geometry.frames.get(entering)?.[0]?.clipPath);
      const bottomInset = Number(clip.match(/inset\(0px 0px ([-.\d]+)px/)?.[1]);
      expect(entering.getBoundingClientRect().bottom - bottomInset).toBe(before);
    } finally {
      geometry.restore();
    }
  });

  it('preserves a clipped child reveal when another branch expands mid-animation', () => {
    const entries = [
      items[0]!,
      { id: 'other', children: [{ id: 'third' }, { id: 'fourth' }] },
      items[1]!,
    ];
    const { rerender } = renderWithTheme(<Example expanded={false} entries={entries} />);
    const geometry = installGeometry(screen.getByTestId('motion-viewport'), () => 0);
    try {
      rerender(<Example expanded entries={entries} />);
      const first = row('first');
      const second = row('second');
      const following = row('other');
      geometry.poses.set(first, { opacity: '0.75', clipPath: 'inset(0px 0px -10px 0px)' });
      geometry.poses.set(second, { opacity: '0.75', clipPath: 'inset(0px 0px 10px 0px)' });
      geometry.poses.set(following, { delta: -10 });
      geometry.frames.clear();
      rerender(<Example expanded entries={entries} extraExpanded />);
      const childFrame = geometry.frames.get(second)?.[0];
      const opacity = Number(childFrame?.opacity ?? getComputedStyle(second).opacity);
      expect(opacity).toBe(0.75);
      const clip = String(childFrame?.clipPath ?? getComputedStyle(second).clipPath);
      const bottomInset = Number(clip.match(/inset\(0px 0px ([-.\d]+)px/)?.[1] ?? 0);
      const followingStart =
        following.getBoundingClientRect().top + startingOffset(geometry.frames.get(following));
      expect(second.getBoundingClientRect().bottom - bottomInset).toBeLessThanOrEqual(
        followingStart,
      );
    } finally {
      geometry.restore();
    }
  });
});
