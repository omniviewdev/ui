import { describe, expect } from 'vitest';
import { useLayoutEffect } from 'react';
import { benchRender, benchRerender } from './bench-render';

// Run through the actual benchmark runner, not mocked bench registrations.
// Assertions here test the harness; these are not component performance samples.
const options = { iterations: 2, time: 0, warmupIterations: 1, warmupTime: 0 };
const active = new Set<string>();
let mounts = 0;
let unmounts = 0;
let updates = 0;

function Probe({ id, value }: { id: string; value: string }) {
  useLayoutEffect(() => {
    expect(active.size).toBe(0);
    active.add(id);
    mounts++;
    return () => {
      active.delete(id);
      unmounts++;
    };
  }, [id]);

  return <span data-rerender-probe={id}>{value}</span>;
}

describe('benchRerender lifecycle regression', () => {
  for (const id of ['first', 'second']) {
    benchRerender(
      id,
      { initialProps: { value: 'initial' }, updatedProps: { value: 'updated' } },
      ({ value }) => {
        const node = document.querySelector(`[data-rerender-probe="${id}"]`);
        if (value === 'updated') {
          // Setup must have committed before the measured callback starts.
          expect(active.has(id)).toBe(true);
          expect(node?.textContent).toBe('initial');
          updates++;
        } else if (node) {
          // Each iteration restores the same mounted component's initial props.
          expect(node.textContent).toBe('updated');
        } else {
          expect(active.size).toBe(0);
        }
        return <Probe id={id} value={value} />;
      },
      options,
    );
  }

  benchRender(
    'fixtures are unmounted before the next benchmark',
    () => {
      expect(updates).toBeGreaterThan(0);
      expect(mounts).toBeGreaterThan(0);
      expect(unmounts).toBe(mounts);
      expect(active.size).toBe(0);
      expect(document.querySelector('[data-rerender-probe]')).toBeNull();
      return <span>clean</span>;
    },
    options,
  );
});
