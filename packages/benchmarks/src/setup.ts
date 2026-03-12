import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// react-syntax-highlighter imports refractor (ESM-only) via require().
// In CodSpeed's forked runner process the CJS require() of ESM fails.
// No benchmark uses CodeBlock, so stub the module out entirely.
vi.mock('react-syntax-highlighter/dist/esm/prism-light', () => ({
  default: () => null,
}));
vi.mock('react-syntax-highlighter/dist/cjs/prism-light', () => ({
  default: () => null,
}));
