# Performance Benchmarking & React Compiler Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a Vitest-based benchmarking framework with CodSpeed CI integration, enable React Compiler, and provide structured JSON output for agent-driven optimization sprints.

**Architecture:** A new `packages/benchmarks` internal package with shared utilities (`benchRender`, `benchRerender`, `benchMountMany`) that wrap Vitest's `bench()`. CodSpeed runs in CI on every PR. CDP tracing available for deep profiling. Taskfile automates local setup. React Compiler enabled across all packages via `babel-plugin-react-compiler`.

**Tech Stack:** Vitest 4.x bench mode, @codspeed/vitest-plugin, babel-plugin-react-compiler, Playwright (browser benchmarks), @testing-library/react, Taskfile v3.

**Spec:** `docs/superpowers/specs/2026-03-11-performance-benchmarking-design.md`

---

## File Map

### New Files

| File | Purpose |
|------|---------|
| `packages/benchmarks/package.json` | Internal benchmark package definition |
| `packages/benchmarks/tsconfig.json` | TypeScript config extending root |
| `packages/benchmarks/vitest.config.ts` | JSDOM benchmark config with CodSpeed |
| `packages/benchmarks/vitest.config.browser.ts` | Playwright Chromium benchmark config |
| `packages/benchmarks/.gitignore` | Ignore traces/ and results/ |
| `packages/benchmarks/src/setup.ts` | Global benchmark setup |
| `packages/benchmarks/src/utils/env.ts` | Environment detection (CI, TRACE, DETERMINISTIC) |
| `packages/benchmarks/src/utils/bench-options.ts` | Benchmark iteration/flag config |
| `packages/benchmarks/src/utils/bench-render.ts` | Core benchRender/benchRerender/benchMountMany |
| `packages/benchmarks/src/utils/bench-render.test.ts` | Tests for bench utilities |
| `packages/benchmarks/src/utils/trace.ts` | CDP tracing utilities (stub + env integration) |
| `packages/benchmarks/src/base-ui/Button.bench.tsx` | Button benchmark |
| `packages/benchmarks/src/base-ui/Checkbox.bench.tsx` | Checkbox benchmark |
| `packages/benchmarks/src/base-ui/Box.bench.tsx` | Box benchmark (simple component baseline) |
| `packages/benchmarks/src/base-ui/DataTable.bench.tsx` | DataTable benchmark (compound component, scaled) |
| `packages/benchmarks/src/editors/CodeEditor.bench.tsx` | CodeEditor benchmark |
| `packages/benchmarks/scripts/generate-report.js` | JSON comparison report generator |
| `packages/benchmarks/README.md` | Developer onboarding guide |
| `Taskfile.yml` | Local setup automation |
| `.github/workflows/codspeed.yml` | CodSpeed CI workflow |

> **Phase 2 (Competitive Benchmarking)** is out of scope for this plan. It will be implemented in a separate plan after Phase 1 is working and baseline measurements exist. See the spec's "Phase 2: Competitive Benchmarking" section.

### Modified Files

| File | Change |
|------|--------|
| `package.json` (root) | Add bench scripts |
| `pnpm-workspace.yaml` | Already includes `packages/*` — no change needed |
| `packages/base-ui/vite.config.ts` | Add React Compiler plugin |
| `packages/ai-ui/vite.config.ts` | Add React Compiler plugin |
| `packages/editors/vite.config.ts` | Add React Compiler plugin |

---

## Chunk 1: Benchmarks Package Scaffolding

### Task 1: Create benchmarks package.json

**Files:**
- Create: `packages/benchmarks/package.json`

- [ ] **Step 1: Create the package.json**

```json
{
  "name": "@omniview/benchmarks",
  "version": "0.0.1",
  "private": true,
  "description": "Performance benchmarks for Omniview UI components.",
  "type": "module",
  "scripts": {
    "bench": "vitest bench --run",
    "bench:browser": "vitest bench --config vitest.config.browser.ts --run"
  },
  "devDependencies": {
    "@codspeed/vitest-plugin": "^4.0.0",
    "@omniview/base-ui": "workspace:*",
    "@omniview/editors": "workspace:*",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "babel-plugin-react-compiler": "latest",
    "jsdom": "^25.0.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.9.2",
    "vite": "^5.4.14",
    "vitest": "^4.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `packages/benchmarks/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vitest.config.ts", "vitest.config.browser.ts"]
}
```

- [ ] **Step 3: Create .gitignore**

Create `packages/benchmarks/.gitignore`:

```
traces/
results/
```

- [ ] **Step 4: Install dependencies**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm install`

Expected: Clean install with new @omniview/benchmarks workspace package resolved.

- [ ] **Step 5: Commit**

```bash
git add packages/benchmarks/package.json packages/benchmarks/tsconfig.json packages/benchmarks/.gitignore
git commit -m "feat(benchmarks): scaffold benchmarks package"
```

---

### Task 2: Create Vitest benchmark configs

**Files:**
- Create: `packages/benchmarks/vitest.config.ts`
- Create: `packages/benchmarks/vitest.config.browser.ts`
- Create: `packages/benchmarks/src/setup.ts`

- [ ] **Step 1: Create the JSDOM vitest config**

Create `packages/benchmarks/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const isCI = !!process.env.CI;
const isDeterministic = !!process.env.DETERMINISTIC;

const defaultExecArgv = [
  '--expose-gc',
  '--hash-seed=1',
  '--random-seed=1',
  '--max-old-space-size=4096',
];

const deterministicExecArgv = [
  '--no-opt',
  '--predictable',
  '--predictable-gc-schedule',
  '--expose-gc',
  '--no-concurrent-sweeping',
  '--hash-seed=1',
  '--random-seed=1',
  '--max-old-space-size=4096',
];

export default defineConfig(async () => {
  // Conditionally import CodSpeed plugin only in CI to avoid requiring it locally
  const plugins = [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ];

  if (isCI) {
    const { default: codspeed } = await import('@codspeed/vitest-plugin');
    plugins.push(codspeed());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@omniview/base-ui': path.resolve(__dirname, '../base-ui/src/index.ts'),
        '@omniview/editors': path.resolve(__dirname, '../editors/src/index.ts'),
      },
    },
    test: {
      benchmark: {
        include: ['src/**/*.bench.{ts,tsx}'],
      },
      environment: 'jsdom',
      setupFiles: ['./src/setup.ts'],
      pool: 'forks',
      fileParallelism: false,
      poolOptions: {
        forks: {
          execArgv: isDeterministic ? deterministicExecArgv : defaultExecArgv,
        },
      },
    },
  };
});
```

- [ ] **Step 2: Create the browser vitest config**

Create `packages/benchmarks/vitest.config.browser.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const isCI = !!process.env.CI;

export default defineConfig(async () => {
  const plugins = [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ];

  if (isCI) {
    const { default: codspeed } = await import('@codspeed/vitest-plugin');
    plugins.push(codspeed());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@omniview/base-ui': path.resolve(__dirname, '../base-ui/src/index.ts'),
        '@omniview/editors': path.resolve(__dirname, '../editors/src/index.ts'),
      },
    },
    test: {
      benchmark: {
        include: ['src/**/*.bench.{ts,tsx}'],
      },
      browser: {
        enabled: true,
        provider: 'playwright',
        instances: [
          {
            browser: 'chromium',
            launch: {
              args: [
                '--enable-precise-memory-info',
                '--js-flags=--expose-gc',
              ],
            },
          },
        ],
      },
      setupFiles: ['./src/setup.ts'],
      fileParallelism: false,
      testTimeout: 60_000,
    },
  };
});
```

- [ ] **Step 3: Create setup file**

Create `packages/benchmarks/src/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Verify config loads**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm --filter @omniview/benchmarks bench`

Expected: Vitest starts, finds no benchmark files matching pattern, exits cleanly with 0 tests. This validates the config loads without errors.

- [ ] **Step 5: Commit**

```bash
git add packages/benchmarks/vitest.config.ts packages/benchmarks/vitest.config.browser.ts packages/benchmarks/src/setup.ts
git commit -m "feat(benchmarks): add vitest bench configs for JSDOM and browser"
```

---

### Task 3: Add root-level bench scripts

**Files:**
- Modify: `~/Repos/omniviewdev/ui/main/package.json` (scripts section)

- [ ] **Step 1: Add bench scripts to root package.json**

Add these entries to the `"scripts"` object in the root `package.json`:

```json
"bench": "vitest bench --config packages/benchmarks/vitest.config.ts --run",
"bench:browser": "vitest bench --config packages/benchmarks/vitest.config.browser.ts --run",
"bench:trace": "TRACE=true pnpm bench:browser",
"bench:deterministic": "DETERMINISTIC=true pnpm bench",
"bench:json": "mkdir -p packages/benchmarks/results && vitest bench --config packages/benchmarks/vitest.config.ts --run --reporter=json > packages/benchmarks/results/latest.json"
```

- [ ] **Step 2: Verify script runs from root**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm bench`

Expected: Same clean exit as Task 2 Step 4 — Vitest loads, no benchmarks found.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "feat(benchmarks): add bench scripts to root package.json"
```

---

## Chunk 2: Shared Benchmark Utilities

### Task 4: Create environment detection utility

**Files:**
- Create: `packages/benchmarks/src/utils/env.ts`

- [ ] **Step 1: Write env.ts**

```ts
export const isCI = !!process.env.CI;
export const isTrace = !!process.env.TRACE;
export const isDeterministic = !!process.env.DETERMINISTIC;
```

- [ ] **Step 2: Commit**

```bash
git add packages/benchmarks/src/utils/env.ts
git commit -m "feat(benchmarks): add environment detection utility"
```

---

### Task 5: Create benchmark options utility

**Files:**
- Create: `packages/benchmarks/src/utils/bench-options.ts`

- [ ] **Step 1: Write bench-options.ts**

```ts
import type { BenchOptions } from 'vitest';

export interface BenchRenderOptions extends BenchOptions {
  /** Number of warmup iterations before measurement. Default: 5 */
  warmupIterations?: number;
}

const DEFAULT_OPTIONS: BenchRenderOptions = {
  iterations: 100,
  warmupIterations: 5,
};

export function resolveOptions(options?: BenchRenderOptions): BenchRenderOptions {
  return { ...DEFAULT_OPTIONS, ...options };
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/benchmarks/src/utils/bench-options.ts
git commit -m "feat(benchmarks): add benchmark options utility"
```

---

### Task 6: Create core bench-render utilities

**Files:**
- Create: `packages/benchmarks/src/utils/bench-render.ts`

This is the most important file — it provides the 3 core functions that make writing benchmarks trivial.

- [ ] **Step 1: Write bench-render.ts**

```ts
import { bench } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createElement, type ReactElement } from 'react';
import { ThemeProvider } from '@omniview/base-ui';
import { resolveOptions, type BenchRenderOptions } from './bench-options';

/**
 * Wraps a ReactElement in the ThemeProvider needed for @omniview components.
 */
function wrapWithTheme(element: ReactElement): ReactElement {
  return createElement(ThemeProvider, { persist: false }, element);
}

/**
 * Benchmark a component's mount + unmount cycle.
 *
 * Each iteration: render() → cleanup(). Measures full mount cost.
 *
 * @example
 * benchRender('mount', () => <Button>Click</Button>);
 */
export function benchRender(
  name: string,
  renderFn: () => ReactElement,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);

  bench(
    name,
    () => {
      render(wrapWithTheme(renderFn()));
      cleanup();
    },
    opts,
  );
}

/**
 * Benchmark a component's re-render (prop change reconciliation) cost.
 *
 * Renders once with initialProps, then each iteration: rerender with
 * updatedProps → rerender back to initialProps. Cleanup runs once after.
 *
 * @example
 * benchRerender('variant change',
 *   { initialProps: { variant: 'solid' }, updatedProps: { variant: 'outlined' } },
 *   (props) => <Button {...props}>Click</Button>,
 * );
 */
export function benchRerender<P extends Record<string, unknown>>(
  name: string,
  config: { initialProps: P; updatedProps: P },
  renderFn: (props: P) => ReactElement,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);
  const { initialProps, updatedProps } = config;

  let rerenderFn: ((ui: ReactElement) => void) | undefined;

  bench(
    name,
    () => {
      if (!rerenderFn) {
        throw new Error('benchRerender: setup did not run');
      }
      rerenderFn(wrapWithTheme(renderFn(updatedProps)));
      rerenderFn(wrapWithTheme(renderFn(initialProps)));
    },
    {
      ...opts,
      setup: () => {
        cleanup();
        const result = render(wrapWithTheme(renderFn(initialProps)));
        rerenderFn = result.rerender;
      },
      teardown: () => {
        cleanup();
        rerenderFn = undefined;
      },
    },
  );
}

/**
 * Benchmark mounting many instances of a component simultaneously.
 *
 * Each iteration: render a wrapper with `count` children → cleanup.
 * Measures scaling behavior for "thousands of components in a table" scenarios.
 *
 * @example
 * benchMountMany('mount 1000', 1000, (i) => <Button key={i}>Item {i}</Button>);
 */
export function benchMountMany(
  name: string,
  count: number,
  factory: (index: number) => ReactElement,
  options?: BenchRenderOptions,
): void {
  const opts = resolveOptions(options);

  // Pre-build the children array once to avoid measuring array construction
  const children = Array.from({ length: count }, (_, i) => factory(i));
  const wrapper = createElement('div', null, ...children);

  bench(
    name,
    () => {
      render(wrapWithTheme(wrapper));
      cleanup();
    },
    opts,
  );
}
```

- [ ] **Step 2: Create an index barrel for utils**

Create `packages/benchmarks/src/utils/index.ts`:

```ts
export { benchRender, benchRerender, benchMountMany } from './bench-render';
export { resolveOptions, type BenchRenderOptions } from './bench-options';
export { isCI, isTrace, isDeterministic } from './env';
```

- [ ] **Step 3: Commit**

```bash
git add packages/benchmarks/src/utils/bench-render.ts packages/benchmarks/src/utils/index.ts
git commit -m "feat(benchmarks): add benchRender, benchRerender, benchMountMany utilities"
```

---

### Task 6b: Create CDP trace utility (stub)

**Files:**
- Create: `packages/benchmarks/src/utils/trace.ts`

CDP tracing requires a Playwright browser session with CDP access. This task creates the utility with the environment detection wired up. The actual CDP protocol calls are implemented when browser benchmarks are set up — the stub provides the interface and no-ops gracefully in JSDOM.

- [ ] **Step 1: Write trace.ts**

```ts
import { isTrace } from './env';

/**
 * CDP trace categories for performance profiling.
 * Used when running benchmarks with TRACE=true in browser mode.
 */
export const TRACE_CATEGORIES = [
  'v8.execute',
  'v8.compile',
  'blink.console',
  'blink.user_timing',
  'benchmark',
  'cc',
  'gpu',
  'viz',
  'disabled-by-default-v8.cpu_profiler',
];

export interface TraceSession {
  stop(): Promise<string | null>;
}

/**
 * Start a CDP trace session. Returns a session object with a stop() method
 * that saves the trace file and returns the path.
 *
 * No-ops in JSDOM or when TRACE is not set.
 * Full CDP implementation requires Playwright browser context — see
 * vitest.config.browser.ts for browser-based benchmark setup.
 */
export async function startTrace(name: string): Promise<TraceSession> {
  if (!isTrace || typeof window === 'undefined') {
    return { stop: async () => null };
  }

  // CDP tracing is available in browser mode via Playwright's CDP session.
  // This will be wired up when browser benchmarks are actively used for profiling.
  // For now, use performance.mark/measure for basic timing.
  const markName = `bench:${name}`;
  performance.mark(`${markName}:start`);

  return {
    stop: async () => {
      performance.mark(`${markName}:end`);
      performance.measure(markName, `${markName}:start`, `${markName}:end`);
      return null;
    },
  };
}
```

- [ ] **Step 2: Add trace to utils barrel export**

Add to `packages/benchmarks/src/utils/index.ts`:

```ts
export { startTrace, TRACE_CATEGORIES, type TraceSession } from './trace';
```

- [ ] **Step 3: Commit**

```bash
git add packages/benchmarks/src/utils/trace.ts packages/benchmarks/src/utils/index.ts
git commit -m "feat(benchmarks): add CDP trace utility stub with performance.mark fallback"
```

---

### Task 6c: Write tests for bench-render utilities

**Files:**
- Create: `packages/benchmarks/src/utils/bench-render.test.ts`

- [ ] **Step 1: Write the test file**

These tests verify the utilities integrate correctly with Vitest's bench API and @testing-library/react:

```ts
import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';

// We can't easily unit-test bench() calls (they need the bench runner),
// so we test the helper functions' internal logic by testing their
// integration behavior — render/cleanup cycles work correctly.

import { render, cleanup, screen } from '@testing-library/react';
import { ThemeProvider } from '@omniview/base-ui';

describe('bench-render utilities integration', () => {
  it('render + cleanup cycle works for simple component', () => {
    const element = createElement(
      ThemeProvider,
      { persist: false },
      createElement('button', { 'data-testid': 'btn' }, 'Click'),
    );
    render(element);
    expect(screen.getByTestId('btn')).toBeDefined();
    cleanup();
    expect(screen.queryByTestId('btn')).toBeNull();
  });

  it('rerender cycle works for prop changes', () => {
    const element = createElement(
      ThemeProvider,
      { persist: false },
      createElement('button', { 'data-testid': 'btn' }, 'Initial'),
    );
    const { rerender } = render(element);

    const updated = createElement(
      ThemeProvider,
      { persist: false },
      createElement('button', { 'data-testid': 'btn' }, 'Updated'),
    );
    rerender(updated);
    expect(screen.getByTestId('btn').textContent).toBe('Updated');
    cleanup();
  });

  it('mount many renders N children', () => {
    const children = Array.from({ length: 100 }, (_, i) =>
      createElement('span', { key: i, 'data-testid': `item-${i}` }, `Item ${i}`),
    );
    const wrapper = createElement(
      ThemeProvider,
      { persist: false },
      createElement('div', { 'data-testid': 'wrapper' }, ...children),
    );
    render(wrapper);
    expect(screen.getByTestId('wrapper').children.length).toBe(100);
    cleanup();
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm vitest run --config packages/benchmarks/vitest.config.ts -- --filter "bench-render"`

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/benchmarks/src/utils/bench-render.test.ts
git commit -m "test(benchmarks): add integration tests for bench-render utilities"
```

---

## Chunk 3: First Component Benchmarks

### Task 7: Button benchmark (validation)

**Files:**
- Create: `packages/benchmarks/src/base-ui/Button.bench.tsx`

- [ ] **Step 1: Write Button benchmark**

```tsx
import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { Button } from '@omniview/base-ui';

describe('Button', () => {
  benchRender('mount', () => <Button>Click</Button>);

  benchRender('mount with decorators', () => (
    <Button startDecorator={<span>+</span>} endDecorator={<span>→</span>}>
      Action
    </Button>
  ));

  benchRerender(
    'variant change',
    { initialProps: { variant: 'solid' as const }, updatedProps: { variant: 'outline' as const } },
    (props) => <Button {...props}>Click</Button>,
  );

  benchMountMany('mount 1000', 1000, (i) => <Button key={i}>Item {i}</Button>);
});
```

- [ ] **Step 2: Run the benchmark to validate the entire pipeline**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm bench`

Expected: Vitest bench runs, executes 4 benchmarks (Button > mount, Button > mount with decorators, Button > variant change, Button > mount 1000), prints results table with ops/sec and margin of error. This is the critical validation that everything works end-to-end.

If this fails, debug the error before proceeding — all subsequent tasks depend on this working.

- [ ] **Step 3: Commit**

```bash
git add packages/benchmarks/src/base-ui/Button.bench.tsx
git commit -m "feat(benchmarks): add Button benchmark — first end-to-end validation"
```

---

### Task 8: Box and Checkbox benchmarks

**Files:**
- Create: `packages/benchmarks/src/base-ui/Box.bench.tsx`
- Create: `packages/benchmarks/src/base-ui/Checkbox.bench.tsx`

- [ ] **Step 1: Write Box benchmark**

```tsx
import { describe } from 'vitest';
import { benchRender, benchMountMany } from '../utils/bench-render';
import { Box } from '@omniview/base-ui';

describe('Box', () => {
  benchRender('mount div', () => <Box>Content</Box>);

  benchRender('mount section', () => <Box as="section">Content</Box>);

  benchMountMany('mount 1000', 1000, (i) => <Box key={i}>Item {i}</Box>);
});
```

- [ ] **Step 2: Write Checkbox benchmark**

```tsx
import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { Checkbox } from '@omniview/base-ui';

describe('Checkbox', () => {
  benchRender('mount', () => <Checkbox />);

  benchRerender(
    'checked toggle',
    { initialProps: { checked: false }, updatedProps: { checked: true } },
    (props) => <Checkbox {...props} />,
  );

  benchMountMany('mount 1000', 1000, (i) => <Checkbox key={i} />);
});
```

- [ ] **Step 3: Run all benchmarks**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm bench`

Expected: 10 benchmarks run and pass (4 Button + 3 Box + 3 Checkbox).

- [ ] **Step 4: Commit**

```bash
git add packages/benchmarks/src/base-ui/Box.bench.tsx packages/benchmarks/src/base-ui/Checkbox.bench.tsx
git commit -m "feat(benchmarks): add Box and Checkbox benchmarks"
```

---

### Task 9: DataTable benchmark (compound component, scaled)

**Files:**
- Create: `packages/benchmarks/src/base-ui/DataTable.bench.tsx`

The DataTable is the most performance-critical component. It uses a compound component pattern requiring a TanStack `Table` instance passed via `table` prop, plus compound children (`DataTable.Header`, `DataTable.Body`, etc.).

- [ ] **Step 1: Write DataTable benchmark**

DataTable requires `useReactTable()` to create a table instance. Since hooks can only be called inside components, we create wrapper components for the benchmarks:

```tsx
import { describe } from 'vitest';
import { bench } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { DataTable, ThemeProvider } from '@omniview/base-ui';

interface Row {
  id: number;
  name: string;
  status: string;
  value: number;
}

const columnHelper = createColumnHelper<Row>();

const columns: ColumnDef<Row, unknown>[] = [
  columnHelper.accessor('id', { header: 'ID' }),
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('value', { header: 'Value' }),
];

function generateRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'inactive',
    value: Math.round(Math.random() * 1000),
  }));
}

// Pre-generate data so row construction isn't measured
const rows100 = generateRows(100);
const rows1000 = generateRows(1000);

/**
 * Wrapper component that calls useReactTable internally and renders
 * DataTable with its compound children.
 */
function DataTableBench({ data }: { data: Row[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTable table={table}>
      <DataTable.Header />
      <DataTable.Body />
    </DataTable>
  );
}

function wrapWithTheme(element: React.ReactElement) {
  return createElement(ThemeProvider, { persist: false }, element);
}

describe('DataTable', () => {
  bench('mount 100 rows', () => {
    render(wrapWithTheme(<DataTableBench data={rows100} />));
    cleanup();
  });

  bench('mount 1000 rows', () => {
    render(wrapWithTheme(<DataTableBench data={rows1000} />));
    cleanup();
  });
});
```

**Note:** This benchmark inlines `bench()` directly instead of using `benchRender` because DataTable requires a wrapper component with hooks. The `benchRender` utility works for pure JSX expressions; compound components that need hooks are benchmarked directly.

- [ ] **Step 2: Run the DataTable benchmark**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm bench -- --filter "DataTable"`

Expected: 2 benchmarks run. The 1000-row benchmark will be notably slower than 100-row — this is expected and provides the scaling baseline.

- [ ] **Step 3: Commit**

```bash
git add packages/benchmarks/src/base-ui/DataTable.bench.tsx
git commit -m "feat(benchmarks): add DataTable benchmark with 100 and 1000 row scenarios"
```

---

### Task 9b: CodeEditor benchmark (editors package)

**Files:**
- Create: `packages/benchmarks/src/editors/CodeEditor.bench.tsx`

CodeEditor wraps Monaco Editor, which is heavy. In JSDOM, Monaco needs to be mocked (it requires a real DOM). This benchmark measures the component's React overhead, not Monaco's internal rendering.

- [ ] **Step 1: Write CodeEditor benchmark**

```tsx
import { describe, vi } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { CodeEditor } from '@omniview/editors';

// Mock monaco-editor in JSDOM — it requires a real browser DOM.
// The benchmark measures React component overhead, not Monaco internals.
vi.mock('monaco-editor', () => {
  const mockEditor = {
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    getModel: vi.fn(() => ({
      getFullModelRange: vi.fn(() => ({})),
      uri: { toString: () => 'test', path: 'test' },
      dispose: vi.fn(),
    })),
    updateOptions: vi.fn(),
    executeEdits: vi.fn(),
    pushUndoStop: vi.fn(),
    setModel: vi.fn(),
    onDidChangeModelContent: vi.fn(() => ({ dispose: vi.fn() })),
    onDidChangeCursorPosition: vi.fn(() => ({ dispose: vi.fn() })),
    dispose: vi.fn(),
    focus: vi.fn(),
    getOption: vi.fn(() => false),
    layout: vi.fn(),
  };

  return {
    default: undefined,
    Uri: { parse: (s: string) => ({ toString: () => s, path: s }) },
    editor: {
      create: vi.fn(() => mockEditor),
      getModel: vi.fn(() => null),
      createModel: vi.fn(() => ({
        getFullModelRange: vi.fn(() => ({})),
        uri: { toString: () => 'test', path: 'test' },
        dispose: vi.fn(),
      })),
      setModelLanguage: vi.fn(),
      defineTheme: vi.fn(),
      setTheme: vi.fn(),
      EditorOption: { readOnly: 81 },
    },
    languages: { register: vi.fn(), setMonarchTokensProvider: vi.fn() },
  };
});

describe('CodeEditor', () => {
  benchRender('mount', () => <CodeEditor value="" language="typescript" />);

  benchRerender(
    'value update',
    {
      initialProps: { value: 'const x = 1;', language: 'typescript' },
      updatedProps: { value: 'const x = 2;', language: 'typescript' },
    },
    (props) => <CodeEditor {...props} />,
  );
});
```

**Note:** This mock mirrors the pattern used in `packages/editors/src/components/code-editor/CodeEditor.test.tsx`. The benchmark measures React component lifecycle overhead (refs, effects, state), not Monaco rendering.

- [ ] **Step 2: Run the CodeEditor benchmark**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm bench -- --filter "CodeEditor"`

Expected: 2 benchmarks run.

- [ ] **Step 3: Commit**

```bash
git add packages/benchmarks/src/editors/CodeEditor.bench.tsx
git commit -m "feat(benchmarks): add CodeEditor benchmark with mocked Monaco"
```

---

## Chunk 4: Report Generation & JSON Output

### Task 10: Create report generation script

**Files:**
- Create: `packages/benchmarks/scripts/generate-report.js`

- [ ] **Step 1: Write the report generator**

```js
#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsDir = join(__dirname, '..', 'results');

function loadJSON(filepath) {
  if (!existsSync(filepath)) return null;
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

function formatHz(hz) {
  if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
  return hz.toFixed(0);
}

function generateComparison(baseline, current) {
  if (!baseline || !current) return null;

  const baselineMap = new Map();
  for (const b of baseline.benchmarks ?? baseline.testResults ?? []) {
    const key = `${b.suite ?? b.name}::${b.name ?? ''}`;
    baselineMap.set(key, b);
  }

  const regressions = [];
  const improvements = [];
  const unchanged = [];

  for (const c of current.benchmarks ?? current.testResults ?? []) {
    const key = `${c.suite ?? c.name}::${c.name ?? ''}`;
    const b = baselineMap.get(key);
    if (!b) continue;

    const baseHz = b.hz ?? (1000 / b.mean);
    const currHz = c.hz ?? (1000 / c.mean);
    const changePct = ((currHz - baseHz) / baseHz) * 100;

    const entry = {
      suite: c.suite ?? c.name,
      name: c.name ?? '',
      baseline_hz: Math.round(baseHz),
      current_hz: Math.round(currHz),
      change_pct: Math.round(changePct * 10) / 10,
    };

    if (changePct < -5) regressions.push(entry);
    else if (changePct > 5) improvements.push(entry);
    else unchanged.push(entry);
  }

  return {
    baseline: baseline.timestamp ?? 'unknown',
    current: current.timestamp ?? new Date().toISOString(),
    regressions: regressions.sort((a, b) => a.change_pct - b.change_pct),
    improvements: improvements.sort((a, b) => b.change_pct - a.change_pct),
    unchanged,
  };
}

function generateMarkdown(comparison) {
  if (!comparison) return '# Benchmark Results\n\nNo baseline to compare against.\n';

  const lines = ['# Benchmark Comparison Report\n'];
  lines.push(`**Baseline:** ${comparison.baseline}`);
  lines.push(`**Current:** ${comparison.current}\n`);

  if (comparison.regressions.length > 0) {
    lines.push('## Regressions\n');
    lines.push('| Suite | Benchmark | Baseline (ops/s) | Current (ops/s) | Change |');
    lines.push('|-------|-----------|-------------------|-----------------|--------|');
    for (const r of comparison.regressions) {
      lines.push(`| ${r.suite} | ${r.name} | ${formatHz(r.baseline_hz)} | ${formatHz(r.current_hz)} | ${r.change_pct}% |`);
    }
    lines.push('');
  }

  if (comparison.improvements.length > 0) {
    lines.push('## Improvements\n');
    lines.push('| Suite | Benchmark | Baseline (ops/s) | Current (ops/s) | Change |');
    lines.push('|-------|-----------|-------------------|-----------------|--------|');
    for (const r of comparison.improvements) {
      lines.push(`| ${r.suite} | ${r.name} | ${formatHz(r.baseline_hz)} | ${formatHz(r.current_hz)} | +${r.change_pct}% |`);
    }
    lines.push('');
  }

  if (comparison.unchanged.length > 0) {
    lines.push('## Unchanged\n');
    lines.push(`${comparison.unchanged.length} benchmarks within ±5% of baseline.\n`);
  }

  return lines.join('\n');
}

// Main
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

const latest = loadJSON(join(resultsDir, 'latest.json'));
const baseline = loadJSON(join(resultsDir, 'baseline.json'));

if (!latest) {
  console.error('No results/latest.json found. Run `pnpm bench:json` first.');
  process.exit(1);
}

const comparison = generateComparison(baseline, latest);

if (comparison) {
  writeFileSync(join(resultsDir, 'comparison.json'), JSON.stringify(comparison, null, 2));
  console.log('Wrote results/comparison.json');
}

const markdown = generateMarkdown(comparison);
writeFileSync(join(resultsDir, 'report.md'), markdown);
console.log('Wrote results/report.md');
```

- [ ] **Step 2: Verify the JSON output pipeline**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm bench:json`

Then: `ls packages/benchmarks/results/latest.json`

Expected: File exists with JSON benchmark results.

**Important:** Inspect the actual JSON structure of `results/latest.json` to verify field names match what `generate-report.js` expects (it looks for `benchmarks` or `testResults` arrays with `hz`, `mean`, `suite`, `name` fields). Vitest 4.x JSON reporter output format may differ — if so, update `generate-report.js` to match the actual schema before proceeding.

- [ ] **Step 3: Test the report generator**

Run: `cd ~/Repos/omniviewdev/ui/main && node packages/benchmarks/scripts/generate-report.js`

Expected: Outputs "Wrote results/report.md". Since there's no baseline yet, the report says "No baseline to compare against."

- [ ] **Step 4: Save current results as baseline**

Run: `cp packages/benchmarks/results/latest.json packages/benchmarks/results/baseline.json`

Then run benchmarks again and generate report:

Run: `pnpm bench:json && node packages/benchmarks/scripts/generate-report.js`

Expected: Now outputs both comparison.json and report.md with actual comparison data (everything should be "unchanged" since no code changed).

- [ ] **Step 5: Commit**

```bash
git add packages/benchmarks/scripts/generate-report.js
git commit -m "feat(benchmarks): add report generation script with JSON comparison output"
```

---

## Chunk 5: Taskfile & Local Automation

### Task 11: Create Taskfile.yml

**Files:**
- Create: `~/Repos/omniviewdev/ui/main/Taskfile.yml`

- [ ] **Step 1: Write Taskfile.yml**

```yaml
version: '3'

tasks:
  bench:setup:
    desc: Install deps and build packages needed for benchmarks
    cmds:
      - pnpm install
      - pnpm --filter @omniview/base-ui build
      - pnpm --filter @omniview/editors build
    status:
      - test -d packages/base-ui/dist
      - test -d packages/editors/dist

  bench:
    desc: Run all benchmarks (JSDOM)
    deps: [bench:setup]
    cmds:
      - pnpm bench {{.CLI_ARGS}}

  bench:filter:
    desc: Run benchmarks for a specific component (COMPONENT=Name)
    deps: [bench:setup]
    cmds:
      - pnpm bench -- --filter "{{.COMPONENT}}"

  bench:browser:
    desc: Run all benchmarks in Chromium
    deps: [bench:setup]
    cmds:
      - pnpm bench:browser {{.CLI_ARGS}}

  bench:trace:
    desc: Deep profile a component with CDP tracing (COMPONENT=Name)
    deps: [bench:setup]
    cmds:
      - pnpm bench:trace -- --filter "{{.COMPONENT}}"

  bench:deterministic:
    desc: Run with full deterministic V8 flags for reproducible comparison
    deps: [bench:setup]
    cmds:
      - pnpm bench:deterministic {{.CLI_ARGS}}

  bench:json:
    desc: Run benchmarks with structured JSON output
    deps: [bench:setup]
    cmds:
      - pnpm bench:json {{.CLI_ARGS}}

  bench:report:
    desc: Generate comparison report from latest vs baseline results
    cmds:
      - node packages/benchmarks/scripts/generate-report.js

  bench:baseline:
    desc: Save current results as baseline for future comparisons
    cmds:
      - cp packages/benchmarks/results/latest.json packages/benchmarks/results/baseline.json
      - echo "Baseline saved from latest.json"
```

- [ ] **Step 2: Verify task runs**

Run: `cd ~/Repos/omniviewdev/ui/main && task bench`

Expected: Taskfile runs bench:setup (builds if needed), then runs benchmarks. All pass.

- [ ] **Step 3: Verify filter works**

Run: `task bench:filter COMPONENT=Button`

Expected: Only Button benchmarks run.

- [ ] **Step 4: Commit**

```bash
git add Taskfile.yml
git commit -m "feat(benchmarks): add Taskfile for local benchmark automation"
```

---

## Chunk 6: React Compiler Enablement

### Task 12: Install babel-plugin-react-compiler

**Files:**
- Modify: `~/Repos/omniviewdev/ui/main/package.json` (root devDependencies)

- [ ] **Step 1: Capture pre-compiler baseline**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm bench:json && cp packages/benchmarks/results/latest.json packages/benchmarks/results/pre-compiler-baseline.json`

This saves the benchmark results before React Compiler is enabled.

- [ ] **Step 2: Install the compiler plugin at root**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm add -D babel-plugin-react-compiler -w`

Expected: Package added to root devDependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: install babel-plugin-react-compiler"
```

---

### Task 13: Enable React Compiler in base-ui

**Files:**
- Modify: `packages/base-ui/vite.config.ts`

- [ ] **Step 1: Add compiler to base-ui vite config**

In `packages/base-ui/vite.config.ts`, change:

```ts
plugins: [react(), dts({ include: ['src'] })],
```

to:

```ts
plugins: [
  react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]],
    },
  }),
  dts({ include: ['src'] }),
],
```

- [ ] **Step 2: Verify base-ui builds with compiler**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm --filter @omniview/base-ui build`

Expected: Build succeeds. Watch for any React Compiler diagnostic warnings in the output — note them down for the COMPILER_BAILOUTS.md file if any appear.

- [ ] **Step 3: Run base-ui tests**

Run: `pnpm --filter @omniview/base-ui test`

Expected: All existing tests pass. React Compiler should not change runtime behavior.

- [ ] **Step 4: Commit**

```bash
git add packages/base-ui/vite.config.ts
git commit -m "feat(base-ui): enable React Compiler via babel-plugin-react-compiler"
```

---

### Task 14: Enable React Compiler in editors and ai-ui

**Files:**
- Modify: `packages/editors/vite.config.ts`
- Modify: `packages/ai-ui/vite.config.ts`

- [ ] **Step 1: Add compiler to editors vite config**

In `packages/editors/vite.config.ts`, change:

```ts
plugins: [react(), dts({ include: ['src'] })],
```

to:

```ts
plugins: [
  react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]],
    },
  }),
  dts({ include: ['src'] }),
],
```

- [ ] **Step 2: Add compiler to ai-ui vite config**

In `packages/ai-ui/vite.config.ts`, change:

```ts
plugins: [react(), dts({ include: ['src'] })],
```

to:

```ts
plugins: [
  react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]],
    },
  }),
  dts({ include: ['src'] }),
],
```

- [ ] **Step 3: Build and test both packages**

Run: `pnpm --filter @omniview/editors build && pnpm --filter @omniview/ai-ui build`

Then: `pnpm --filter @omniview/editors test && pnpm --filter @omniview/ai-ui test`

Expected: All builds and tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/editors/vite.config.ts packages/ai-ui/vite.config.ts
git commit -m "feat(editors, ai-ui): enable React Compiler"
```

---

### Task 15: Capture post-compiler benchmark and compare

- [ ] **Step 1: Run benchmarks with compiler enabled**

Run: `cd ~/Repos/omniviewdev/ui/main && pnpm bench:json`

- [ ] **Step 2: Compare against pre-compiler baseline**

Run: `cp packages/benchmarks/results/pre-compiler-baseline.json packages/benchmarks/results/baseline.json && node packages/benchmarks/scripts/generate-report.js`

Expected: `results/comparison.json` shows the impact of React Compiler. Re-render benchmarks should show the most improvement since the compiler auto-memoizes.

- [ ] **Step 3: Save post-compiler as the new baseline**

Run: `cp packages/benchmarks/results/latest.json packages/benchmarks/results/baseline.json`

- [ ] **Step 4: Review and log compiler impact**

Read `packages/benchmarks/results/report.md` and note the percentage changes. If any regressions appear, investigate whether the compiler is bailing out on those components.

---

## Chunk 7: CI/CD — GitHub Actions

### Task 16: Create CodSpeed workflow

**Files:**
- Create: `.github/workflows/codspeed.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Performance Benchmarks

on:
  push:
    branches: [main]
  pull_request:
    paths:
      - 'packages/base-ui/**'
      - 'packages/editors/**'
      - 'packages/benchmarks/**'
      - 'pnpm-lock.yaml'

concurrency:
  group: benchmarks-${{ github.ref }}
  cancel-in-progress: true

jobs:
  benchmarks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm --filter @omniview/base-ui build

      - run: pnpm --filter @omniview/editors build

      - uses: CodSpeedHQ/action@v3
        with:
          run: pnpm bench
          token: ${{ secrets.CODSPEED_TOKEN }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/codspeed.yml
git commit -m "ci: add CodSpeed performance benchmark workflow"
```

- [ ] **Step 3: Set up CodSpeed token**

This is a manual step: Go to https://codspeed.io, connect the `omniviewdev/ui` repository, and add the `CODSPEED_TOKEN` as a GitHub Actions secret.

---

## Chunk 8: Documentation

### Task 17: Write README

**Files:**
- Create: `packages/benchmarks/README.md`

- [ ] **Step 1: Write the README**

```markdown
# @omniview/benchmarks

Performance benchmarks for Omniview UI components. Uses Vitest bench mode with CodSpeed for CI regression tracking.

## Quick Start

```bash
# Using Taskfile (recommended — handles setup automatically)
task bench                              # Run all benchmarks
task bench:filter COMPONENT=Button      # Run one component
task bench:json                         # JSON output for agents
task bench:report                       # Compare latest vs baseline

# Using pnpm directly
pnpm bench                              # Run all benchmarks (JSDOM)
pnpm bench -- --filter "Button"         # Run one component
pnpm bench:deterministic                # Reproducible results (slow)
pnpm bench:browser                      # Run in Chromium
pnpm bench:trace -- --filter "DataTable" # CDP profiling
```

## Adding a Benchmark

Create a `.bench.tsx` file in the appropriate directory:

```tsx
// src/base-ui/MyComponent.bench.tsx
import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { MyComponent } from '@omniview/base-ui';

describe('MyComponent', () => {
  // Measure mount + unmount cost
  benchRender('mount', () => <MyComponent />);

  // Measure prop-change reconciliation
  benchRerender('prop update',
    { initialProps: { variant: 'solid' }, updatedProps: { variant: 'outlined' } },
    (props) => <MyComponent {...props} />,
  );

  // Measure scaling (thousands of instances)
  benchMountMany('mount 1000', 1000, (i) => <MyComponent key={i} />);
});
```

## Conventions

- File naming: `<ComponentName>.bench.tsx`
- Directory mirrors source: `src/base-ui/`, `src/editors/`
- Every component gets at minimum one `benchRender` (mount cost)
- Data-heavy components: add `benchMountMany` with realistic counts
- Interactive components: add `benchRerender` for common state changes

## Utilities

| Function | Measures | Per-iteration behavior |
|----------|----------|----------------------|
| `benchRender(name, fn)` | Mount + unmount | render() → cleanup() |
| `benchRerender(name, config, fn)` | Prop change cost | rerender(new) → rerender(old) |
| `benchMountMany(name, count, factory)` | Scaling | render(N children) → cleanup() |

## Agent Workflow

For AI agents running optimization sprints:

1. `task bench:json` → read `results/latest.json`
2. Analyze slowest components
3. Make optimizations
4. `task bench:json` → read `results/comparison.json`
5. `task bench:report` → generate PR summary

## CI

CodSpeed runs automatically on PRs that touch component or benchmark code. It comments on PRs with performance diffs and flags regressions > 5%.
```

- [ ] **Step 2: Commit**

```bash
git add packages/benchmarks/README.md
git commit -m "docs(benchmarks): add README with usage guide and conventions"
```

---

### Task 18: Final validation — full pipeline test

- [ ] **Step 1: Clean build and run all benchmarks**

Run: `cd ~/Repos/omniviewdev/ui/main && rm -rf packages/base-ui/dist packages/editors/dist && task bench`

Expected: Taskfile rebuilds everything from scratch and all benchmarks pass.

- [ ] **Step 2: Test JSON output pipeline**

Run: `task bench:json && task bench:report`

Expected: Both `results/latest.json` and `results/report.md` are generated.

- [ ] **Step 3: Test filter**

Run: `task bench:filter COMPONENT=DataTable`

Expected: Only DataTable benchmarks run.

- [ ] **Step 4: Verify all tests still pass**

Run: `pnpm test`

Expected: All package tests pass (base-ui, ai-ui, editors). React Compiler has not broken anything.
