import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

if (typeof window !== 'undefined' && !window.PointerEvent) {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
}

afterEach(() => {
  cleanup();
});
