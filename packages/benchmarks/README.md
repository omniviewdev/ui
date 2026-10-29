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
pnpm bench Button                       # Run one component
pnpm bench:deterministic                # Reproducible results (slow)
pnpm bench:browser                      # Run in Chromium
pnpm bench:trace DataTable              # CDP profiling
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
- `benchmark.include` selects benchmark files; `vitest bench` runs their isolated benchmark project, not ordinary tests.
- Helpers keep their registration signatures and create `test(name, async ({ bench }) => ...)` internally.
- Timing, iteration, and warmup options use Vitest's `BenchRunOptions` and go to `.run(options)` or `bench.compare(...registrations, options)`.
- Competitive helpers compare all implementations in one test with interleaved measurements. Element construction stays outside the timed callback for bulk mounts.

## Utilities

| Function                               | Measures         | Per-iteration behavior         |
| -------------------------------------- | ---------------- | ------------------------------ |
| `benchRender(name, fn)`                | Mount + unmount  | render() → cleanup()           |
| `benchRerender(name, config, fn)`      | Prop change cost | rerender(new) → rerender(old)  |
| `benchMountMany(name, count, factory)` | Scaling          | render(N children) → cleanup() |

### Rerender fixture lifecycle

Vitest 5 and CodSpeed 6's benchmark provider both support per-function `beforeAll`/`afterAll` options passed as `bench(name, fnOptions, fn)`. `benchRerender` mounts before each warmup or measurement phase, then measures updated props → initial props without mount/unmount inside the timed callback. Cleanup runs after each phase; a `finally` block also cleans up when the provider or measured function throws.

The helper retains its dedicated `describe(name)` scope and `rerender` registration (for example, `Button::variant change::rerender`). Mount and competitive registration names remain unchanged. Vitest 5 now nests benchmark registrations under their test case; CodSpeed identities include that test case, so establish a new CI baseline after upgrading.

`src/utils/bench-render.lifecycle.bench.tsx` exercises the real helper through the selected benchmark provider. Two sibling fixtures must mount before updates, restore initial props, and unmount before the following mount benchmark. Its assertions validate the harness, not component performance.

API evidence: [Vitest benchmark fixtures, hooks, and run options](https://vitest.dev/guide/benchmarking.md), [Vitest migration guide](https://vitest.dev/guide/migration.md).

## Agent Workflow

For AI agents running optimization sprints:

1. `task bench:json` → read `results/latest.json`
2. Analyze slowest components
3. Make optimizations
4. `task bench:json` → read `results/comparison.json`
5. `task bench:report` → generate PR summary

Vitest 5 removed `benchmark.outputJson`/`--outputJson`. JSON commands use `--reporter=default --reporter=json --outputFile=results/latest.json` (or `results/competitive/latest.json`). Measurements live at `testResults[].assertionResults[].benchmarks[].tasks[]`; reports read throughput in ops/s and latency in milliseconds from their native statistics. Recreate the baseline with Vitest 5 before comparing results: old `files[].groups[].benchmarks[]` snapshots use a different schema and throughput estimator.

## Competitive Benchmarks

Compare @omniviewdev/base-ui against MUI and raw HTML:

```bash
task bench:competitive                      # Run all competitive benchmarks
task bench:competitive:json                 # JSON output
task bench:competitive:report               # Generate comparison report
pnpm bench:competitive Button             # Single component
```

Results are written to `results/competitive/report.md` with per-component overhead multipliers vs raw HTML.

## CI

CodSpeed runs automatically on PRs that touch component or benchmark code and on matching pushes to `main`. The workflow also supports manual dispatch for backtesting.

The job pins Node 26.13.0 and `ubuntu-24.04` with CodSpeed's **CPU simulation** instrument, not walltime. The `@codspeed/vitest-plugin` integration remains enabled in CI. Do not replace the image pin with `ubuntu-latest` without verifying runner support: the October 2026 Ubuntu 26.04 image failed before benchmark startup with CodSpeed runner v4.19.1 reporting `Unsupported system`.

CPU simulation measures estimated user-space CPU cost, including simulated cache and memory access. It excludes time spent in system calls and is not browser latency or elapsed render time. This avoids noisy walltime comparisons on shared GitHub-hosted runners without requiring unavailable `codspeed-macro` runners. Do not compare simulation values directly with historical walltime values; establish a simulation baseline on `main` (or backtest the base revision) before interpreting PR deltas.

The full suite runs in four native Vitest shards within one workflow, with fail-fast disabled. Each benchmark file belongs to exactly one shard; the matrix does not drop benchmarks or run duplicate configurations. This bounds per-job CPU-simulation startup cost after the serial suite exceeded its 30-minute deadline while still completing measurements. CodSpeed aggregates the four jobs as one workflow run.

Vitest 5 executes benchmark registrations inside ordinary test cases. The CodSpeed command explicitly passes `--testTimeout=600000` for a bounded 10-minute per-case timeout; native commands retain 60 seconds. This does not depend on runner environment variables being available while Vite loads configuration. The unchanged 100-instance Combobox workload completed measurement in 411 seconds under simulation, exceeding the old test timeout despite finishing successfully. This runner budget does not change instance counts, iterations, measurement boundaries, or CodSpeed regression thresholds. The existing 30-minute shard deadline still bounds total CI work.

CodSpeed uploads measurements and supplies comparison reports through its GitHub integration. Regression thresholds and PR comment behavior depend on the repository's CodSpeed settings. Benchmark and upload failures fail the job; empty measurements are not allowed. Each shard also uploads a `codspeed-simulation-<run-id>-<attempt>-<shard>` artifact containing benchmark stdout/stderr, including partial output if the benchmark command fails. If setup fails before benchmarks start, use the Actions job logs instead. The log artifact is execution evidence, not a standalone performance comparison report.

### Validation

After installing workspace dependencies, use Node 26.13.0 for these smoke commands from the repository root. First check native Vitest/Tinybench, then explicitly select CodSpeed's benchmark provider:

```bash
pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/utils/bench-render.lifecycle.bench.tsx src/base-ui/Button.bench.tsx
CI=true CODSPEED_ENV=local CODSPEED_RUNNER_MODE=simulation pnpm --filter @omniviewdev/benchmarks exec vitest bench --run src/utils/bench-render.lifecycle.bench.tsx src/base-ui/Button.bench.tsx
pnpm --filter @omniviewdev/benchmarks exec vitest bench --config vitest.config.browser.ts --run src/utils/bench-render.lifecycle.bench.tsx src/base-ui/Button.bench.tsx
pnpm --filter @omniviewdev/benchmarks exec vitest bench --config vitest.config.competitive.ts --run src/competitive/Button.competitive.tsx --reporter=default --reporter=json --outputFile=results/competitive/latest.json
pnpm --filter @omniviewdev/benchmarks exec node scripts/generate-competitive-report.js
```

`CI=true` alone loads the plugin but does not select its provider outside CodSpeed. `CODSPEED_ENV` enables provider selection; `CODSPEED_RUNNER_MODE=simulation` selects CPU analysis. Without CodSpeed instrumentation the second command warns about missing instrumentation and validates provider lifecycle execution only, not CPU simulation measurements. CodSpeed's simulation provider reports zero-valued timing statistics because CPU measurements are uploaded separately; use native or browser runs, not simulation JSON, for local throughput reports.

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
