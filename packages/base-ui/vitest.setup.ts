import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

expect.extend(matchers);

if (typeof window !== 'undefined' && !window.PointerEvent) {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
}

afterEach(() => {
  cleanup();
});
