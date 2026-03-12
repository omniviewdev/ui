import { bench, describe } from 'vitest';
import { styleDataAttributes } from './styleProps';

describe('styleDataAttributes', () => {
  bench('with default values', () => {
    styleDataAttributes({});
  });

  bench('with explicit values', () => {
    styleDataAttributes({ variant: 'solid', color: 'brand', size: 'lg' });
  });

  bench('with partial values', () => {
    styleDataAttributes({ variant: 'outline' });
  });
});
