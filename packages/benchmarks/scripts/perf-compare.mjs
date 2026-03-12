/**
 * Compare Reassure performance results between baseline and current runs.
 *
 * Usage:
 *   pnpm perf:baseline   # run on base branch, writes .reassure/baseline.perf
 *   pnpm perf            # run on current branch, writes .reassure/current.perf
 *   pnpm perf:compare    # compare and output report
 */
import { compare } from '@callstack/reassure-compare';

await compare({
  baselineFile: '.reassure/baseline.perf',
  currentFile: '.reassure/current.perf',
  outputFile: '.reassure/output.json',
  outputFormat: 'all',
});
