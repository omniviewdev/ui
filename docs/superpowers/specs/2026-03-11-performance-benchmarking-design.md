# Performance Benchmarking & React Compiler Integration

**Date:** 2026-03-11
**Status:** Approved
**Target repo:** github.com/omniviewdev/ui (main branch)

## Problem

The Omniview UI component library (v0.1.0) targets a Wails webview-based IDE where maximum rendering performance is critical. There is currently no benchmarking infrastructure, no performance regression tracking, and React Compiler is not enabled. Components — even small ones like Button and Checkbox — matter because thousands may render simultaneously in data-heavy views like DataTables.

## Goals

1. Establish a benchmarking framework that makes adding new benchmarks trivial (under 5 minutes, 3-5 lines of code)
2. Integrate CodSpeed for automated performance regression tracking on every PR
3. Verify React 19.2+ is installed and enable React Compiler across all packages
4. Capture before/after baselines to quantify React Compiler impact
5. Provide CDP tracing for deep profiling during optimization sprints

## Non-Goals

- Bundle size tracking (future work)
- WebKit-specific benchmarking (optimize on Chromium, validate on WebKit later)
- Benchmarking ai-ui package (lower priority, network-bound)
- Memory leak detection for long-running sessions (future work)

## Metrics Priority

1. **Initial render time** — mount cost per component
2. **Re-render cost** — prop change reconciliation
3. **Memory allocation** — heap growth per instance at scale
4. **Bundle size** — per-component weight (future)
5. **Layout/paint cost** — browser rendering beyond React reconciliation

## Architecture

### Package Structure

```
packages/benchmarks/            # Internal package, not published
├── package.json
├── vitest.config.ts            # JSDOM + CodSpeed (default, CI)
├── vitest.config.browser.ts    # Playwright Chromium + CDP tracing
├── .gitignore                  # Ignores traces/ directory
├── src/
│   ├── setup.ts                # Global setup (React, testing-library)
│   ├── utils/
│   │   ├── bench-render.ts     # benchRender, benchRerender, benchMountMany
│   │   ├── bench-options.ts    # Iteration config, deterministic flags
│   │   ├── trace.ts            # CDP tracing utilities
│   │   └── env.ts              # Environment detection (CI, TRACE)
│   ├── base-ui/                # Base UI component benchmarks
│   │   ├── Button.bench.tsx
│   │   ├── Checkbox.bench.tsx
│   │   ├── DataTable.bench.tsx
│   │   ├── TreeList.bench.tsx
│   │   └── ...
│   └── editors/                # Editor component benchmarks
│       ├── CodeEditor.bench.tsx
│       └── ...
├── scripts/
│   └── generate-report.js      # Comparison report generator
├── results/                    # Git-ignored, JSON output + reports
├── traces/                     # Git-ignored, CDP trace output
└── README.md                   # Developer onboarding guide
```

### Shared Benchmark Utilities

Three core functions that internally call Vitest's `bench()`:

**`benchRender(name, renderFn, options?)`**
Calls `bench(name, async () => { ... })` internally. Each iteration: renders the component via `@testing-library/react`'s `render()`, then calls `cleanup()`. Cleanup runs per-iteration to measure the full mount+unmount cycle. In browser mode with `TRACE=true`, wraps the iteration with CDP trace start/stop. Memory snapshots are only available in browser mode (`performance.measureUserAgentSpecificMemory()`); in JSDOM mode, memory metrics are skipped gracefully.

**`benchRerender(name, { initialProps, updatedProps }, renderFn, options?)`**
Calls `bench()` internally. Renders once with `initialProps` outside the measured loop. Each iteration: calls `rerender()` with `updatedProps`, then `rerender()` back to `initialProps`. Does NOT call `cleanup()` per iteration — measures reconciliation cost only. Cleanup runs once after the benchmark completes.

**`benchMountMany(name, count, factory, options?)`**
Calls `bench()` internally. Each iteration: renders a wrapper containing `count` instances produced by the factory function, then calls `cleanup()`. Measures scaling behavior for the "thousands of small components in a table" scenario.

All three functions:
- Accept optional benchmark options (iterations, warmup count)
- Automatically capture CDP traces when `TRACE=true` (browser mode only)
- Gracefully degrade in JSDOM — memory metrics skipped, tracing unavailable, render timing still accurate

### Example Benchmark

```tsx
// packages/benchmarks/src/base-ui/Button.bench.tsx
import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { Button } from '@omniview/base-ui';

describe('Button', () => {
  benchRender('mount', () => <Button>Click</Button>);

  benchRerender('variant change',
    { initialProps: { variant: 'solid' }, updatedProps: { variant: 'outlined' } },
    (props) => <Button {...props}>Click</Button>
  );

  benchMountMany('mount 1000', 1000, (i) => <Button key={i}>Item {i}</Button>);
});
```

## Vitest Configuration

### Compatibility

- **Vitest:** 4.0.18 (currently installed). `@codspeed/vitest-plugin` requires Vitest 3.2+ — no compatibility concerns.
- **@codspeed/vitest-plugin:** Use latest version.

### JSDOM Config (default, CI)

```ts
// packages/benchmarks/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import codspeed from '@codspeed/vitest-plugin';

const isCI = !!process.env.CI;

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
    ...(isCI ? [codspeed()] : []),
  ],
  test: {
    benchmark: {
      include: ['src/**/*.bench.{ts,tsx}'],
    },
    environment: 'jsdom',
    setupFiles: ['./src/setup.ts'],
    pool: 'forks',
    fileParallelism: false,
  },
});
```

### Deterministic Node Flags

Applied via `poolOptions.forks.execArgv`. **Opt-in via `DETERMINISTIC=true`** to avoid slowing down normal local development:

Default local flags (always applied):
```
--expose-gc --hash-seed=1 --random-seed=1 --max-old-space-size=4096
```

Full deterministic flags (when `DETERMINISTIC=true`):
```
--no-opt --predictable --predictable-gc-schedule
--expose-gc --no-concurrent-sweeping
--hash-seed=1 --random-seed=1
--max-old-space-size=4096
```

The full flags disable V8 JIT and GC randomness for maximally reproducible results but run 10-100x slower. Use for final comparison runs, not iterative development. CodSpeed uses its own instrumentation in CI that supersedes both sets.

### Browser Config

Same as JSDOM config but:
- Playwright Chromium as browser provider
- CDP tracing enabled when `TRACE=true`
- 60s timeout for trace-heavy benchmarks
- Chromium flags: `--enable-precise-memory-info`, `--js-flags=--expose-gc`

### Script Definitions

Root `package.json`:
```json
{
  "bench": "vitest bench --config packages/benchmarks/vitest.config.ts --run",
  "bench:browser": "vitest bench --config packages/benchmarks/vitest.config.browser.ts --run",
  "bench:trace": "TRACE=true pnpm bench:browser",
  "bench:deterministic": "DETERMINISTIC=true pnpm bench",
  "bench:json": "vitest bench --config packages/benchmarks/vitest.config.ts --run --reporter=json > packages/benchmarks/results/latest.json"
}
```

## CDP Tracing

Optional deep profiling tool for optimization sprints. Not used in CI.

**Trace categories:**
- `v8.execute`, `v8.compile` — JS execution
- `blink.user_timing` — React performance marks
- `cc`, `gpu`, `viz` — compositor, paint, layout
- `disabled-by-default-v8.cpu_profiler` — function-level CPU profiling

**Output:** JSON files in `packages/benchmarks/traces/`, compatible with Chrome DevTools Performance tab and Perfetto UI.

**Usage:**
```bash
pnpm bench:trace -- --filter "DataTable"
open packages/benchmarks/traces/DataTable-*.json
```

## React Compiler Enablement

### React Version Verification

React 19.2.x is already installed (peer dependency range `^19.0.0` resolves to 19.2.4+). Verify the installed version meets the minimum for React Compiler:

```bash
pnpm list react --depth=0
```

If below 19.2.0, bump the peer dependency lower bound. No version change needed if already at 19.2.x.

### Compiler Setup

1. Install `babel-plugin-react-compiler` as a dev dependency at the root
2. Add to Vite config in each package's `vite.config.ts`:
   ```ts
   react({
     babel: {
       plugins: [['babel-plugin-react-compiler', {}]],
     },
   })
   ```
3. Applied to: base-ui, ai-ui, editors, benchmarks
4. CI job captures compiler diagnostics to surface components that can't be auto-optimized

### Compiler Escape Hatch

React Compiler may bail out on certain components. When it does:
- The compiler emits diagnostic warnings during build
- Components that can't be auto-optimized are candidates for manual `useMemo`/`useCallback`
- To opt a specific component out: add `'use no memo'` directive at the top of the component function
- Track opt-outs in a `COMPILER_BAILOUTS.md` file so they can be revisited

### Baseline Strategy

1. Set up benchmarking framework first (without React Compiler enabled)
2. Run full benchmark suite → record as baseline in CodSpeed
3. Enable React Compiler across all packages
4. Run full benchmark suite again → compare against baseline
5. Quantifies per-component impact of compiler optimization

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/codspeed.yml
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
      - run: pnpm install
      - run: pnpm --filter @omniview/base-ui build
      - run: pnpm --filter @omniview/editors build
      - uses: CodSpeedHQ/action@v3
        with:
          run: pnpm bench
          token: ${{ secrets.CODSPEED_TOKEN }}
```

**Key decisions:**
- `concurrency` group prevents multiple benchmark runs from interfering on the same PR
- Path filtering includes `pnpm-lock.yaml` to catch dependency changes that could affect performance
- `ubuntu-latest` runners support `perf_events` required by CodSpeed's instrumented mode
- Builds base-ui and editors before benchmarks since benchmarks import from them (ai-ui excluded from build since it's not benchmarked)
- Path list should be updated when new cross-package dependencies are introduced to benchmarked packages

### CodSpeed Configuration

- **Regression threshold:** Start at 5% — CodSpeed flags regressions exceeding this on PRs. Adjust based on observed noise levels after initial rollout.
- **In CI:** CodSpeed plugin intercepts `bench()` calls, uses instrumented measurement (wall-clock + CPU instructions via `perf_events`)
- **Locally:** Standard Vitest bench (tinybench), results printed to terminal
- **Dashboard:** Tracks every benchmark over time, flags regressions on PRs with inline comments

## Local Setup Automation (Taskfile)

A `Taskfile.yml` at the repo root wraps pnpm scripts with automated setup. Developers and agents can use `task bench` instead of manually building dependencies first.

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
    desc: Run benchmarks for a specific component
    deps: [bench:setup]
    cmds:
      - pnpm bench -- --filter "{{.COMPONENT}}"

  bench:browser:
    desc: Run all benchmarks in Chromium
    deps: [bench:setup]
    cmds:
      - pnpm bench:browser {{.CLI_ARGS}}

  bench:trace:
    desc: Deep profile a component with CDP tracing
    deps: [bench:setup]
    cmds:
      - pnpm bench:trace -- --filter "{{.COMPONENT}}"

  bench:deterministic:
    desc: Run with full deterministic flags for comparison
    deps: [bench:setup]
    cmds:
      - pnpm bench:deterministic {{.CLI_ARGS}}

  bench:json:
    desc: Run benchmarks with structured JSON output
    deps: [bench:setup]
    cmds:
      - pnpm bench:json {{.CLI_ARGS}}

  bench:report:
    desc: Generate comparison report from last run
    cmds:
      - node packages/benchmarks/scripts/generate-report.js
```

**Key:** `bench:setup` uses Taskfile `status` checks — if `dist/` directories already exist, it's a no-op. First run sets everything up; subsequent runs skip straight to benchmarks.

**Usage:**
```bash
task bench                              # Setup + run all (JSDOM)
task bench:filter COMPONENT=Button      # Setup + run one component
task bench:trace COMPONENT=DataTable    # Setup + deep profile
task bench:json                         # Setup + structured JSON output
task bench:report                       # Generate comparison report
```

## Structured Output for AI Agents

Benchmarks produce machine-parseable JSON output that AI agents (Claude, Codex, etc.) and MCP tools can consume for automated performance optimization.

### JSON Output

`pnpm bench:json` (or `task bench:json`) writes results to `packages/benchmarks/results/latest.json`:

```json
{
  "timestamp": "2026-03-11T...",
  "environment": {
    "node": "20.x",
    "vitest": "4.0.18",
    "react": "19.2.4",
    "compiler": true
  },
  "benchmarks": [
    {
      "suite": "Button",
      "name": "mount",
      "hz": 45230,
      "mean": 0.0221,
      "median": 0.0198,
      "p99": 0.0412,
      "samples": 1000,
      "rme": 1.23
    }
  ]
}
```

### Comparison Reports

`packages/benchmarks/scripts/generate-report.js` reads `results/latest.json` and optionally compares against `results/baseline.json`. Produces two outputs:

**1. Markdown table** (`results/report.md`) — for PR comments and human review

**2. Structured JSON diff** (`results/comparison.json`) — for agents:

```json
{
  "baseline": "2026-03-10T...",
  "current": "2026-03-11T...",
  "regressions": [
    {
      "suite": "DataTable",
      "name": "mount 1000",
      "baseline_hz": 120,
      "current_hz": 95,
      "change_pct": -20.8
    }
  ],
  "improvements": [
    {
      "suite": "Button",
      "name": "mount",
      "baseline_hz": 42000,
      "current_hz": 45230,
      "change_pct": 7.7
    }
  ],
  "unchanged": []
}
```

### Agent Performance Sprint Workflow

An AI agent performing an optimization sprint follows this loop:

1. `task bench:json` → read `results/latest.json` → identify slowest components
2. Analyze component source code for optimization opportunities
3. Make changes (reduce re-renders, simplify DOM, leverage React Compiler patterns)
4. `task bench:json` → read `results/comparison.json` → verify improvement
5. Repeat until targets are met
6. `task bench:report` → generate markdown summary for PR

The structured JSON means agents never parse terminal output — they read well-defined files with consistent schemas.

### Results Directory

```
packages/benchmarks/results/        # Git-ignored
├── latest.json                     # Most recent benchmark run
├── baseline.json                   # Saved baseline for comparison
├── comparison.json                 # Generated diff (latest vs baseline)
└── report.md                       # Generated markdown report
```

## Developer Experience

### Adding a New Benchmark

1. Create `packages/benchmarks/src/<package>/<Component>.bench.tsx`
2. Import the component and shared utilities
3. Write 1-3 `benchRender`/`benchRerender`/`benchMountMany` calls
4. Run `pnpm bench -- --filter "ComponentName"` to verify locally
5. PR triggers CodSpeed tracking automatically

### Conventions

- File naming: `<ComponentName>.bench.tsx`
- Directory mirrors source package: `base-ui/`, `editors/`
- Every component gets at minimum one `benchRender` (mount cost)
- Data-heavy components add `benchMountMany` with realistic counts
- Interactive components add `benchRerender` for common state changes

### Local Commands

```bash
pnpm bench                              # All benchmarks (JSDOM, fast)
pnpm bench -- --filter "Button"         # Single component
pnpm bench:deterministic                # Reproducible results (slow)
pnpm bench:browser                      # All benchmarks (Chromium)
pnpm bench:trace -- --filter "DataTable" # Deep CDP profiling
```

### PR Workflow

1. Open PR touching component code → CodSpeed runs automatically
2. CodSpeed comments with performance diff (e.g., "Button mount: -3.2%")
3. Regressions above 5% threshold flagged as warnings
4. Reviewer can request trace results for flagged components

## Dependencies (New)

| Package | Purpose |
|---------|---------|
| `@codspeed/vitest-plugin` | CodSpeed integration for Vitest bench (Vitest 4.x compatible) |
| `babel-plugin-react-compiler` | React Compiler |
| `@testing-library/react` | Component rendering in benchmarks (already installed) |
| `playwright` | Browser-based benchmark execution |

## Gitignore

Add to `packages/benchmarks/.gitignore`:
```
traces/
results/
```

## Phase 2: Competitive Benchmarking

**Goal:** Prove quantitatively that @omniview/base-ui outperforms MUI, Radix, and raw HTML/CSS for the components that matter most — validating the migration from MUI's theming system to CSS variables.

**Implemented after Phase 1 is working and baseline measurements exist.**

### Comparison Targets

| Target | What it represents |
|--------|-------------------|
| **Raw HTML + CSS** | Theoretical floor — the fastest possible render with no framework overhead |
| **MUI (Material UI)** | The library being migrated away from — must prove we're faster |
| **Radix UI** | Unstyled primitive library — similar philosophy to @base-ui/react |
| **@base-ui/react (standalone)** | The primitives @omniview wraps — measures our added overhead |

### Design

Competitive benchmarks live in a separate directory to keep them isolated from the main regression suite (different dependencies, different update cadence):

```
packages/benchmarks/
├── src/
│   ├── base-ui/                    # Phase 1: @omniview component benchmarks
│   ├── editors/                    # Phase 1: editor benchmarks
│   └── competitive/                # Phase 2: cross-library comparison
│       ├── utils/
│       │   └── competitive.ts      # benchCompare() utility
│       ├── Button.compare.bench.tsx
│       ├── Checkbox.compare.bench.tsx
│       ├── Select.compare.bench.tsx
│       ├── DataTable.compare.bench.tsx
│       └── ...
├── results/
│   ├── latest.json                 # Phase 1 results
│   └── competitive/
│       ├── latest.json             # Phase 2 comparison results
│       └── report.md               # Competitive comparison table
```

### Competitive Benchmark API

A `benchCompare()` utility that runs identical operations across multiple implementations:

```tsx
// packages/benchmarks/src/competitive/Button.compare.bench.tsx
import { benchCompare } from './utils/competitive';

// Raw HTML baseline
import { RawButton } from './implementations/raw/Button';
// MUI
import { Button as MuiButton } from '@mui/material';
// Radix
import { Button as RadixButton } from '@radix-ui/themes';
// Base UI (unwrapped primitive)
import { Button as BaseUiButton } from '@base-ui/react';
// Omniview (our component)
import { Button as OmniButton } from '@omniview/base-ui';

benchCompare('Button', {
  implementations: {
    'raw-html':  () => <RawButton>Click</RawButton>,
    'mui':       () => <MuiButton variant="contained">Click</MuiButton>,
    'radix':     () => <RadixButton>Click</RadixButton>,
    'base-ui':   () => <BaseUiButton>Click</BaseUiButton>,
    'omniview':  () => <OmniButton>Click</OmniButton>,
  },
  scenarios: {
    mount: 'single',           // Single mount+unmount
    rerender: { prop: 'variant', from: 'solid', to: 'outlined' },
    scale: 1000,               // Mount 1000 instances
  },
});
```

`benchCompare()` generates one `bench()` call per implementation per scenario (e.g., `Button > raw-html > mount`, `Button > mui > mount`, etc.), all in the same Vitest run for apples-to-apples comparison.

### Raw HTML Implementations

A `competitive/implementations/raw/` directory with minimal HTML+CSS versions of each component. These serve as the **performance floor** — the fastest possible implementation with no abstraction overhead:

```tsx
// competitive/implementations/raw/Button.tsx
export function RawButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="raw-btn" {...props}>{children}</button>;
}
```

With a plain CSS file using CSS variables matching the same visual output. This isolates how much overhead each library adds on top of the browser's native rendering.

### Competitive JSON Output

`results/competitive/latest.json`:

```json
{
  "timestamp": "2026-03-15T...",
  "component": "Button",
  "scenario": "mount",
  "results": {
    "raw-html":  { "hz": 98000, "mean": 0.0102 },
    "base-ui":   { "hz": 72000, "mean": 0.0139 },
    "omniview":  { "hz": 68000, "mean": 0.0147 },
    "radix":     { "hz": 55000, "mean": 0.0182 },
    "mui":       { "hz": 31000, "mean": 0.0323 }
  },
  "rankings": ["raw-html", "base-ui", "omniview", "radix", "mui"],
  "overhead_vs_raw": {
    "base-ui": 1.36,
    "omniview": 1.44,
    "radix": 1.78,
    "mui": 3.17
  }
}
```

### Competitive Report

`results/competitive/report.md` — auto-generated comparison table:

```markdown
## Button Performance Comparison

| Implementation | Mount (ops/s) | vs Raw | Rerender (ops/s) | Scale 1000 (ms) |
|---------------|---------------|--------|-------------------|-----------------|
| Raw HTML+CSS  | 98,000        | 1.00x  | 145,000           | 12ms            |
| @base-ui      | 72,000        | 1.36x  | 110,000           | 18ms            |
| @omniview     | 68,000        | 1.44x  | 105,000           | 19ms            |
| Radix         | 55,000        | 1.78x  | 82,000            | 28ms            |
| MUI           | 31,000        | 3.17x  | 48,000            | 52ms            |
```

### Which Components to Compare

Focus on components where performance difference is most visible and where MUI had known overhead:

**Priority 1 (high-frequency in IDE):**
- Button, Checkbox, Switch, Select — rendered thousands of times in tables/forms
- Tooltip, Popover — frequent show/hide cycles
- Input, TextField — keystroke latency sensitive

**Priority 2 (complex components):**
- DataTable — the biggest win opportunity, combines many small components
- TreeList — recursive rendering, deep nesting
- Tabs, Menu — layout-heavy, animation-sensitive

**Priority 3 (composition test):**
- "Full table row" — a realistic row with Button + Checkbox + Select + text, mounted 500 times
- This tests real-world composition overhead, not isolated components

### Dependency Isolation

Competitive benchmarks install MUI, Radix, etc. as dev dependencies of the benchmarks package only. They never leak into published packages:

```json
// packages/benchmarks/package.json devDependencies
{
  "@mui/material": "^6.x",
  "@emotion/react": "^11.x",
  "@emotion/styled": "^11.x",
  "@radix-ui/themes": "^4.x"
}
```

### Taskfile Addition

```yaml
  bench:competitive:
    desc: Run competitive comparison benchmarks
    deps: [bench:setup]
    cmds:
      - pnpm bench -- --filter "competitive"

  bench:competitive:json:
    desc: Run competitive benchmarks with JSON output
    deps: [bench:setup]
    cmds:
      - pnpm bench:json -- --filter "competitive"

  bench:competitive:report:
    desc: Generate competitive comparison report
    cmds:
      - node packages/benchmarks/scripts/generate-competitive-report.js
```

### CI Considerations

Competitive benchmarks run **on-demand only** (manual dispatch or specific label), not on every PR:
- They have extra dependencies (MUI, Radix) that slow install
- They measure absolute performance, not regressions — useful for periodic validation, not per-commit
- A scheduled weekly run on `main` tracks competitive position over time

```yaml
# Added to codspeed.yml
on:
  workflow_dispatch:     # Manual trigger
  schedule:
    - cron: '0 6 * * 1' # Weekly Monday 6am UTC
```

## Future Work

- Bundle size tracking per component (e.g., `size-limit`)
- WebKit validation job via Playwright WebKit
- Memory leak detection for long-running editor sessions
- ai-ui package benchmarks (streaming rendering)
- Interaction latency benchmarks (click-to-visual-response)
