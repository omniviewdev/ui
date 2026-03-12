import { bench, describe } from 'vitest';
import { cn, withBaseClassName } from './classnames';

describe('cn', () => {
  bench('joins two class names', () => {
    cn('foo', 'bar');
  });

  bench('joins five class names', () => {
    cn('alpha', 'beta', 'gamma', 'delta', 'epsilon');
  });

  bench('filters falsy values', () => {
    cn('keep', false, null, undefined, 'also-keep', '', false);
  });

  bench('handles all falsy inputs', () => {
    cn(false, null, undefined);
  });
});

describe('withBaseClassName', () => {
  bench('merges string className with base', () => {
    withBaseClassName('base', 'extra');
  });

  bench('merges function className with base', () => {
    const resolver = withBaseClassName('base', (state: { active: boolean }) =>
      state.active ? 'active' : undefined,
    );
    if (typeof resolver === 'function') {
      resolver({ active: true });
    }
  });
});
