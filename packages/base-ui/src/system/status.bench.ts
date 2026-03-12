import { bench, describe } from 'vitest';
import { statusToColor } from './status';

describe('statusToColor', () => {
  bench('maps known status', () => {
    statusToColor('success');
  });

  bench('maps with case conversion', () => {
    statusToColor('RUNNING');
  });

  bench('maps unknown status to neutral', () => {
    statusToColor('some-unknown-status');
  });

  bench('iterates through multiple statuses', () => {
    const statuses = [
      'success',
      'healthy',
      'warning',
      'error',
      'pending',
      'unknown',
      'critical',
      'idle',
    ];
    for (const s of statuses) {
      statusToColor(s);
    }
  });
});
