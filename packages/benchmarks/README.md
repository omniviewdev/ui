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
