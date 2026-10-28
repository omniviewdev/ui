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

### Rerender fixture lifecycle

The installed runners use different lifecycle APIs. Vitest 4.0.18 forwards benchmark `setup`/`teardown` options to Tinybench 2.9.0, outside the timed loop. CodSpeed 5.2.0's simulation/analysis runner instead invokes Vitest suite hooks and calls the benchmark function directly; it never reads those Tinybench options. Its `beforeAll`/`afterAll` hooks surround the optimization and measured calls.

`benchRerender` therefore registers the same setup/cleanup with both APIs, inside a dedicated `describe(name)` scope. The native runner uses the Tinybench callbacks; simulation uses the suite hooks. Do not move mounting into the measured callback, register these hooks in the containing component suite, or return cleanup from `beforeAll`: CodSpeed 5 does not consume returned cleanup callbacks. Explicit `afterAll` handles normal completion; setup and benchmark errors clean up before rethrowing because CodSpeed 5 does not reach `afterAll` on failure.

The isolated suite adds `::rerender` to rerender benchmark identities (for example, `Button::variant change::rerender`). Treat these as new series; mount identities stay unchanged. Comparison helpers only benchmark mount/unmount and need no fixture lifecycle.

`src/utils/bench-render.lifecycle.bench.tsx` exercises the real helper through the selected benchmark runner. Two sibling fixtures must mount before updates, restore initial props, and unmount before the following mount benchmark. Its assertions validate the harness, not component performance.

Pinned API evidence: [Vitest 4.0.18 benchmark options](https://github.com/vitest-dev/vitest/blob/v4.0.18/docs/api/index.md#bench), [native benchmark runner](https://github.com/vitest-dev/vitest/blob/v4.0.18/packages/vitest/src/runtime/runners/benchmark.ts), [CodSpeed 5.2.0 analysis runner](https://github.com/CodSpeedHQ/codspeed-node/blob/v5.2.0/packages/vitest-plugin/src/analysis.ts), and [CodSpeed suite-hook dispatch](https://github.com/CodSpeedHQ/codspeed-node/blob/v5.2.0/packages/vitest-plugin/src/common.ts).

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

The full suite runs in four native Vitest shards within one workflow, with fail-fast disabled. Each benchmark file belongs to exactly one shard; the matrix does not drop benchmarks or run duplicate configurations. This bounds per-job CPU-simulation startup cost after the serial suite exceeded its 30-minute deadline while still completing measurements. CodSpeed aggregates the four jobs as one workflow run.

CodSpeed uploads measurements and supplies comparison reports through its GitHub integration. Regression thresholds and PR comment behavior depend on the repository's CodSpeed settings. Benchmark and upload failures fail the job; empty measurements are not allowed. Each shard also uploads a `codspeed-simulation-<run-id>-<attempt>-<shard>` artifact containing benchmark stdout/stderr, including partial output if the benchmark command fails. If setup fails before benchmarks start, use the Actions job logs instead. The log artifact is execution evidence, not a standalone performance comparison report.

### Validation

After installing workspace dependencies, use Node 20 for these smoke commands from the repository root. First check native Vitest/Tinybench, then explicitly select CodSpeed's analysis runner:

```bash
pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/utils/bench-render.lifecycle.bench.tsx src/base-ui/Button.bench.tsx
CI=true CODSPEED_ENV=local CODSPEED_RUNNER_MODE=simulation pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/utils/bench-render.lifecycle.bench.tsx src/base-ui/Button.bench.tsx
```

`CI=true` alone loads the plugin but does not select its analysis runner outside CodSpeed. `CODSPEED_ENV` enables runner selection; `CODSPEED_RUNNER_MODE=simulation` selects analysis. Without CodSpeed instrumentation the second command warns about missing instrumentation and only validates actual analysis-runner lifecycle execution, not CPU simulation measurements.

To verify shard partitioning locally without running the full suite, supply two files to complementary shards. Their union must execute both files once; the Vitest sequencer determines which shard owns each file:

```bash
CI=true pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/base-ui/Button.bench.tsx src/base-ui/Input.bench.tsx --shard=1/2
CI=true pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/base-ui/Button.bench.tsx src/base-ui/Input.bench.tsx --shard=2/2
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
