# @omniviewdev/benchmarks

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
import { MyComponent } from '@omniviewdev/base-ui';

describe('MyComponent', () => {
  // Measure mount + unmount cost
  benchRender('mount', () => <MyComponent />);

  // Measure prop-change reconciliation
  benchRerender(
    'prop update',
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

| Function                               | Measures         | Per-iteration behavior         |
| -------------------------------------- | ---------------- | ------------------------------ |
| `benchRender(name, fn)`                | Mount + unmount  | render() → cleanup()           |
| `benchRerender(name, config, fn)`      | Prop change cost | rerender(new) → rerender(old)  |
| `benchMountMany(name, count, factory)` | Scaling          | render(N children) → cleanup() |

## Agent Workflow

For AI agents running optimization sprints:

1. `task bench:json` → read `results/latest.json`
2. Analyze slowest components
3. Make optimizations
4. `task bench:json` → read `results/comparison.json`
5. `task bench:report` → generate PR summary

## Competitive Benchmarks

Compare @omniviewdev/base-ui against MUI and raw HTML:

```bash
task bench:competitive                      # Run all competitive benchmarks
task bench:competitive:json                 # JSON output
task bench:competitive:report               # Generate comparison report
pnpm bench:competitive -- --filter "Button" # Single component
```

Results are written to `results/competitive/report.md` with per-component overhead multipliers vs raw HTML.

## CI

CodSpeed runs automatically on PRs that touch component or benchmark code and on matching pushes to `main`. The workflow also supports manual dispatch for backtesting.

The job pins `ubuntu-24.04` with CodSpeed's **CPU simulation** instrument, not walltime. The existing `@codspeed/vitest-plugin` integration remains enabled in CI. Node 20 is intentional: the installed CodSpeed 5.x integration supports Node 20, while Node 22/24 require CodSpeed 6.x. Do not replace the image pin with `ubuntu-latest` without verifying runner support: the October 2026 Ubuntu 26.04 image failed before benchmark startup with CodSpeed runner v4.19.1 reporting `Unsupported system`.

CPU simulation measures estimated user-space CPU cost, including simulated cache and memory access. It excludes time spent in system calls and is not browser latency or elapsed render time. This avoids noisy walltime comparisons on shared GitHub-hosted runners without requiring unavailable `codspeed-macro` runners. Do not compare simulation values directly with historical walltime values; establish a simulation baseline on `main` (or backtest the base revision) before interpreting PR deltas.

CodSpeed uploads measurements and supplies comparison reports through its GitHub integration. Regression thresholds and PR comment behavior depend on the repository's CodSpeed settings. Benchmark and upload failures fail the job; empty measurements are not allowed. Each run also uploads a `codspeed-simulation-<run-id>-<attempt>` artifact containing benchmark stdout/stderr, including partial output if the benchmark command fails. If setup fails before benchmarks start, use the Actions job logs instead. The log artifact is execution evidence, not a standalone performance comparison report.

### Validation

After installing workspace dependencies, smoke-test the CI-enabled plugin and one benchmark from the repository root:

```bash
CI=true pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/base-ui/Button.bench.tsx
```

Outside the CodSpeed runner this checks harness execution only; it does not produce CPU simulation measurements. Run the full GitHub workflow to validate instrumentation, upload, and report generation:

```bash
gh workflow run codspeed.yml --ref <branch>
gh run list --workflow codspeed.yml --branch <branch> --limit 5
gh run watch <run-id> --exit-status
gh run view <run-id> --log
gh run download <run-id> --pattern 'codspeed-simulation-*'
```

Manual dispatch requires the workflow to exist on the default branch; before then, push changes to the PR branch to trigger the `pull_request` workflow. Confirm the run uses `ubuntu-24.04`, executes the benchmark suite, uploads measurements successfully, and exposes both the log artifact and CodSpeed report. A successful local smoke alone does not prove CI reporting works.

References: [CPU simulation](https://codspeed.io/docs/instruments/cpu), [Vitest integration](https://codspeed.io/docs/benchmarks/nodejs/vitest), [supported Node versions](https://codspeed.io/docs/benchmarks/nodejs/overview#supported-node-js-versions), [GitHub Actions configuration](https://codspeed.io/docs/integrations/ci/github-actions/configuration), and [v4 action inputs](https://github.com/CodSpeedHQ/action/blob/v4/action.yml).
